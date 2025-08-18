import { z } from "zod";
import CONFIG from "../../../config/config";
import { Context } from "../../../context";
import { Category } from "../../../entities";
import {
  GetCategoriesResponseOrError,
  QueryGetAllCategoriesArgs,
} from "../../../types";
import {
  categorySortingSchema,
  paginationSchema,
} from "../../../utils/data-validation";
import { paginateCategories } from "../../services";

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
 * Maps a Category entity to GraphQL-compatible plain object including nested subcategories recursively.
 */
function mapCategoryToResponse(cat: Category): any {
  return {
    id: cat.id,
    name: cat.name,
    slug: cat.slug,
    description: cat.description || null,
    thumbnail: (cat.thumbnail as any) || null,
    position: cat.position,
    totalProducts: 0, // Add totalProducts field for pagination response
    createdBy: (cat.createdBy as any) || null,
    createdAt:
      cat.createdAt instanceof Date
        ? cat.createdAt.toISOString()
        : cat.createdAt,
    deletedAt:
      cat.deletedAt instanceof Date
        ? cat.deletedAt.toISOString()
        : cat.deletedAt || null,
    // Recursively map subcategories
    subCategories: (cat.subCategories || []).map(mapCategoryToResponse),
    parentCategory: cat.parentCategory
      ? mapCategoryToResponse(cat.parentCategory)
      : null,
  };
}

/**
 * Fetches a paginated list of categories with deeply nested subcategories.
 */
export const getAllCategoriesForCustomers = async (
  _: any,
  args: QueryGetAllCategoriesArgs,
  { user }: Context
): Promise<GetCategoriesResponseOrError> => {
  try {
    // Validate inputs
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

    // Direct DB fetch without Redis
    const { categories: dbCategories, total } = await paginateCategories({
      page,
      limit,
      search,
      sortBy,
      sortOrder,
    });

    const categories = dbCategories.map(mapCategoryToResponse);

    return {
      statusCode: 200,
      success: true,
      message: "Categories fetched successfully",
      categories,
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
