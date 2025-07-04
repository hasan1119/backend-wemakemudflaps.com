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
  visited: Set<string> = new Set(),
  depth: number = 0 // For debugging depth
): Promise<any> => {
  if (!subCat || visited.has(subCat.id)) {
    console.log(
      `Skipping subcategory ${subCat?.id} at depth ${depth} (already visited or null)`
    );
    return null;
  }
  visited.add(subCat.id);

  // Fetch nested subcategories from the database
  const children = await subCategoryRepository.find({
    where: {
      parentSubCategory: { id: subCat.id },
      deletedAt: null,
    },
    relations: ["parentSubCategory", "category", "subCategories"],
  });

  // Log the fetched children for debugging
  console.log(
    `Fetched ${children.length} children for subcategory ${subCat.name} (ID: ${subCat.id}) at depth ${depth}:`,
    children.map((c) => ({ id: c.id, name: c.name }))
  );

  // Recursively map children
  const mappedChildren = await Promise.all(
    children.map((child: any) => mapSubCategory(child, visited, depth + 1))
  );

  // Fetch parent subcategory if not preloaded and not visited
  let parent = null;
  if (
    subCat.parentSubCategory &&
    typeof subCat.parentSubCategory === "object" &&
    subCat.parentSubCategory.id &&
    !visited.has(subCat.parentSubCategory.id)
  ) {
    const parentData = await subCategoryRepository.findOne({
      where: { id: subCat.parentSubCategory.id, deletedAt: null },
      relations: ["parentSubCategory", "category", "subCategories"],
    });
    if (parentData) {
      parent = await mapSubCategory(parentData, visited, depth + 1);
    }
  }

  const mappedSubCat = {
    id: subCat.id,
    name: subCat.name,
    slug: subCat.slug,
    description: subCat.description || null,
    thumbnail: subCat.thumbnail || null,
    position: subCat.position,
    createdBy: subCat.createdBy || null,
    createdAt:
      subCat.createdAt instanceof Date
        ? subCat.createdAt.toISOString()
        : subCat.createdAt,
    deletedAt:
      subCat.deletedAt instanceof Date
        ? subCat.deletedAt.toISOString()
        : subCat.deletedAt || null,
    category: subCat.category?.id || null,
    parentSubCategory: parent ? parent : subCat.parentSubCategory?.id || null,
    subCategories: mappedChildren.filter((sc) => sc !== null),
  };

  console.log(
    `Mapped subcategory ${subCat.name} (ID: ${subCat.id}) at depth ${depth} with ${mappedChildren.length} children`
  );

  return mappedSubCat;
};

/**
 * Fetches a paginated list of categories with deeply nested subcategories.
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

    // Check if user has permission to view categories
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

    // Fetch categories with immediate subcategories
    const { categories: dbCategories, total } = await paginateCategories({
      page,
      limit,
      search,
      sortBy: safeSortBy,
      sortOrder: safeSortOrder,
    });

    // Log raw categories for debugging
    const util = require("util");
    console.log(
      "Raw categories from paginateCategories:",
      util.inspect(dbCategories, { depth: null, colors: true })
    );

    const categories = await Promise.all(
      dbCategories.map(async (cat) => {
        const visited = new Set<string>();
        const mappedSubCategories = await Promise.all(
          (cat.subCategories ?? []).map((subCat) =>
            mapSubCategory(subCat, visited, 0)
          )
        );

        return {
          id: cat.id,
          name: cat.name,
          slug: cat.slug,
          description: cat.description || null,
          thumbnail: cat.thumbnail || null,
          position: cat.position,
          createdBy: cat.createdBy || null,
          createdAt:
            cat.createdAt instanceof Date
              ? cat.createdAt.toISOString()
              : cat.createdAt,
          deletedAt:
            cat.deletedAt instanceof Date
              ? cat.deletedAt.toISOString()
              : cat.deletedAt || null,
          subCategories: mappedSubCategories.filter((sc) => sc !== null),
        };
      })
    );

    // Log final mapped categories
    console.log(
      "Categories with subcategories:",
      util.inspect(categories, { depth: null, colors: true })
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
