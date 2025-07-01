import { z } from "zod";
import CONFIG from "../../../config/config";
import { Context } from "../../../context";
import {
  getCategoriesCountFromRedis,
  getCategoriesFromRedis,
  setCategoriesCountInRedis,
  setCategoriesInRedis,
} from "../../../helper/redis";
import {
  GetCategoriesResponseOrError,
  QueryGetAllCategoriesArgs,
} from "../../../types";
import {
  categorySortingSchema,
  paginationSchema,
} from "../../../utils/data-validation";
import {
  checkUserAuth,
  checkUserPermission,
  countCategoriesWithSearch,
  paginateCategories,
} from "../../services";
import { subCategoryRepository } from "../../services/repositories/repositories";

// Combine pagination and sorting schemas for validation
const combinedSchema = z.intersection(paginationSchema, categorySortingSchema);

const mapArgsToPagination = (args: QueryGetAllCategoriesArgs) => ({
  page: args.page,
  limit: args.limit,
  search: args.search,
  sortBy: args.sortBy || "createdAt",
  sortOrder: args.sortOrder || "asc",
});

// Recursively fetch and map all nested subcategories
const mapSubCategory = async (
  subCat: any,
  visited: Set<string> = new Set()
): Promise<any> => {
  if (!subCat || visited.has(subCat.id)) return null;
  visited.add(subCat.id);

  // Fetch nested subcategories explicitly from the DB
  const children = await subCategoryRepository.find({
    where: {
      parentSubCategory: { id: subCat.id },
      deletedAt: null,
    },
    relations: ["parentSubCategory", "category"],
  });

  const mappedChildren = await Promise.all(
    children.map((child) => mapSubCategory(child, visited))
  );

  // Optionally fetch and map parentSubCategory
  let parent = null;
  if (
    subCat.parentSubCategory &&
    typeof subCat.parentSubCategory === "object" &&
    !visited.has(subCat.parentSubCategory.id)
  ) {
    const parentData = await subCategoryRepository.findOne({
      where: { id: subCat.parentSubCategory.id, deletedAt: null },
      relations: ["parentSubCategory", "category"],
    });
    if (parentData) {
      parent = await mapSubCategory(parentData, visited);
    }
  }

  return {
    id: subCat.id,
    name: subCat.name,
    slug: subCat.slug,
    description: subCat.description || null,
    thumbnail: subCat.thumbnail || null,
    position: subCat.position,
    createdBy: subCat.createdBy ? { id: subCat.createdBy } : null, // <-- wrapped here
    createdAt:
      subCat.createdAt instanceof Date
        ? subCat.createdAt.toISOString()
        : subCat.createdAt,
    deletedAt:
      subCat.deletedAt instanceof Date
        ? subCat.deletedAt.toISOString()
        : subCat.deletedAt,
    category: subCat.category?.id || null,
    parentSubCategory: parent,
    subCategories: mappedChildren.filter((sc) => sc !== null),
  };
};

/**
 * Fetches a paginated list of categories with deeply nested subcategories.
 *
 * Workflow:
 * 1. Authenticates the user and verifies their permission to view categories.
 * 2. Validates pagination and sorting inputs using Zod schemas.
 * 3. Queries the database using pagination, sorting, and optional search.
 * 4. On cache miss, fetches categories from the database with pagination, search, and sorting.
* 5. Maps database categories to cached format, including creator details.
 * 6. Caches categories and total count in Redis, excluding user counts.

 * 4. Recursively maps each category and all levels of nested subcategories.
 * 5. Returns a structured success response with categories, total count and cache result,
 *    or an error response if validation or permission fails.
 *
 * @param _ - Unused GraphQL root/resolver parameter.
 * @param args - GraphQL arguments including pagination, sorting, and search.
 * @param context - GraphQL context containing the authenticated user.
 * @returns A `GetCategoriesResponseOrError` containing paginated results or error.
 */
export const getAllCategories = async (
  _: any,
  args: QueryGetAllCategoriesArgs,
  { user }: Context
): Promise<GetCategoriesResponseOrError> => {
  try {
    // Verify user authentication
    const authResponse = checkUserAuth(user);
    if (authResponse) return authResponse;

    // Check if user has permission to delete a category
    const canRead = await checkUserPermission({
      action: "canRead",
      entity: "category",
      user,
    });

    if (!canRead) {
      return {
        statusCode: 403,
        success: false,
        message: "You do not have permission to view category info",
        __typename: "BaseResponse",
      };
    }

    // Map and validate input arguments
    const mappedArgs = mapArgsToPagination(args);
    const validationResult = await combinedSchema.safeParseAsync(mappedArgs);

    // Return detailed validation errors if input is invalid
    if (!validationResult.success) {
      const errorMessages = validationResult.error.errors.map((error) => ({
        field: error.path.join("."),
        message: error.message,
      }));

      return {
        statusCode: 400,
        success: false,
        message: "Validation failed",
        errors: errorMessages,
        __typename: "ErrorResponse",
      };
    }

    const { page, limit, search, sortBy, sortOrder } = mappedArgs;

    /* getCategoriesFromRedis */

    // Attempt to retrieve cached categories and total count from Redis
    let categoriesData;

    categoriesData = await getCategoriesFromRedis(
      page,
      limit,
      search,
      sortBy,
      sortOrder
    );

    let total;

    total = await getCategoriesCountFromRedis(search, sortBy, sortOrder);

    if (!categoriesData) {
      // On cache miss, fetch categories from database

      const allowedSortFields = ["name", "createdAt", "position"] as const;
      const safeSortBy = allowedSortFields.includes(sortBy as any)
        ? (sortBy as (typeof allowedSortFields)[number])
        : "createdAt";

      const allowedSortOrders = ["asc", "desc"] as const;
      const safeSortOrder = allowedSortOrders.includes(sortOrder as any)
        ? (sortOrder as (typeof allowedSortOrders)[number])
        : "desc";

      const { categories: dbCategories, total: queryTotal } =
        await paginateCategories({
          page,
          limit,
          search,
          sortBy: safeSortBy,
          sortOrder: safeSortOrder,
        });

      total = queryTotal;

      categoriesData = await Promise.all(
        dbCategories.map(async (cat) => {
          const visited = new Set<string>();
          const mappedSubCategories = await Promise.all(
            (cat.subCategories ?? []).map((subCat) =>
              mapSubCategory(subCat, visited)
            )
          );

          return {
            id: cat.id,
            name: cat.name,
            slug: cat.slug,
            description: cat.description || null,
            thumbnail: cat.thumbnail || null,
            position: cat.position,
            createdBy: cat.createdBy as any,
            createdAt:
              cat.createdAt instanceof Date
                ? cat.createdAt.toISOString()
                : cat.createdAt,
            deletedAt:
              cat.deletedAt instanceof Date
                ? cat.deletedAt.toISOString()
                : cat.deletedAt,
            subCategories: mappedSubCategories.filter((sc) => sc !== null),
          };
        })
      );

      // Cache categories and total count in Redis
      await Promise.all([
        setCategoriesInRedis(
          page,
          limit,
          search,
          sortBy,
          sortOrder,
          categoriesData
        ),
        setCategoriesCountInRedis(search, sortBy, sortOrder, total),
      ]);
    }

    // Calculate total categories count if not cached
    if (total === 0) {
      total = await countCategoriesWithSearch(search);

      // Cache total count in Redis
      await setCategoriesCountInRedis(search, sortBy, sortOrder, total);
    }

    return {
      statusCode: 200,
      success: true,
      message: "Categories fetched successfully",
      category: categoriesData,
      total,
      __typename: "CategoryPaginationResponse",
    };
  } catch (error: any) {
    console.error("Error fetching categories:", error);

    return {
      statusCode: 500,
      success: false,
      message:
        CONFIG.NODE_ENV === "production"
          ? "Something went wrong, please try again."
          : error.message || "Internal server error",
      __typename: "ErrorResponse",
    };
  }
};
