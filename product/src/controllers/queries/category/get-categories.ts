import { z } from "zod";
import CONFIG from "../../../config/config";
import { Context } from "../../../context";
import { Category, SubCategory } from "../../../entities";
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

// Combine pagination and sorting schemas for validation
const combinedSchema = z.intersection(paginationSchema, categorySortingSchema);

const mapArgsToPagination = (args: QueryGetAllCategoriesArgs) => ({
  page: args.page,
  limit: args.limit,
  search: args.search,
  sortBy: args.sortBy || "createdAt",
  sortOrder: args.sortOrder || "asc",
});

/**
 * Recursively builds a subcategory tree for GraphQL response, ensuring schema compliance.
 *
 * @param subCat - The subcategory entity to map.
 * @param visited - Set of visited subcategory IDs to prevent circular references.
 * @returns A mapped subcategory object.
 */
const buildSubCategoryTree = (
  subCat: SubCategory,
  visited: Set<string>
): any => {
  if (!subCat || !subCat.id || visited.has(subCat.id)) {
    return null;
  }

  visited.add(subCat.id);

  const children = subCat.subCategories ?? [];
  const mappedChildren = children
    .map((child) => buildSubCategoryTree(child, visited))
    .filter((sc) => sc !== null)
    .sort((a, b) => (a.position ?? 0) - (b.position ?? 0));

  return {
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
    category: subCat.category || null,
    parentSubCategory: subCat.parentSubCategory || null,
    subCategories: mappedChildren,
  };
};

/**
 * Fetches a paginated list of categories with deeply nested subcategories.
 *
 * Workflow:
 * 1. Authenticates the user and verifies their permission to view categories.
 * 2. Validates pagination and sorting inputs using Zod schemas.
 * 3. Fetches paginated categories with nested subcategories.
 * 4. Maps categories and subcategories to match the GraphQL schema.
 * 5. Returns a structured response with categories and total count.
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

    // Fetch paginated categories with nested subcategories
    const { categories: dbCategories, total } = await paginateCategories({
      page,
      limit,
      search,
      sortBy,
      sortOrder,
    });

    // Map categories to GraphQL schema
    const visited = new Set<string>();
    const categories = dbCategories.map((cat: Category) => {
      const mappedSubCategories = (cat.subCategories ?? [])
        .map((subCat) => buildSubCategoryTree(subCat, visited))
        .filter((sc) => sc !== null);

      return {
        id: cat.id,
        name: cat.name,
        slug: cat.slug,
        description: cat.description || null,
        thumbnail: cat.thumbnail || null,
        position: cat.position,
        createdBy: (cat.createdBy as any) || null,
        createdAt:
          cat.createdAt instanceof Date
            ? cat.createdAt.toISOString()
            : cat.createdAt,
        deletedAt:
          cat.deletedAt instanceof Date
            ? cat.deletedAt.toISOString()
            : cat.deletedAt || null,
        subCategories: mappedSubCategories,
      };
    });

    return {
      statusCode: 200,
      success: true,
      message: "Categories fetched successfully",
      category: categories as any,
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
