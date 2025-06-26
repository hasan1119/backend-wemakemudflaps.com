import { z } from "zod";
import CONFIG from "../../../config/config";
import { Context } from "../../../context";
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
  paginateCategories,
} from "../../service";
import { subCategoryRepository } from "../../service/repositories/repositories";

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
 * 4. Recursively maps each category and all levels of nested subcategories.
 * 5. Returns a structured success response with categories and total count,
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
    const authResponse = checkUserAuth(user);
    if (authResponse) return authResponse;

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

    const mappedArgs = mapArgsToPagination(args);
    const validationResult = await combinedSchema.safeParseAsync(mappedArgs);

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

    const allowedSortFields = ["name", "createdAt", "position"] as const;
    const safeSortBy = allowedSortFields.includes(sortBy as any)
      ? (sortBy as (typeof allowedSortFields)[number])
      : "createdAt";

    const allowedSortOrders = ["asc", "desc"] as const;
    const safeSortOrder = allowedSortOrders.includes(sortOrder as any)
      ? (sortOrder as (typeof allowedSortOrders)[number])
      : "desc";

    const { categories: dbCategories, total } = await paginateCategories({
      page,
      limit,
      search,
      sortBy: safeSortBy,
      sortOrder: safeSortOrder,
    });

    const categories = await Promise.all(
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

    return {
      statusCode: 200,
      success: true,
      message: "Categories fetched successfully",
      category: categories,
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
