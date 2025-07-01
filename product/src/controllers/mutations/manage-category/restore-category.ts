import CONFIG from "../../../config/config";
import { Context } from "../../../context";
import { SubCategory } from "../../../entities";
import {
  clearAllCategorySearchCache,
  setCategoryInfoByIdInRedis,
  setSubCategoryInfoByIdInRedis,
} from "../../../helper/redis";
import {
  MutationRestoreCategoryArgs,
  RestoreCategoryResponseOrError,
} from "../../../types";
import { restoreCategorySchema } from "../../../utils/data-validation";
import {
  checkUserAuth,
  checkUserPermission,
  restoreCategoryOrSubCategoryById,
} from "../../services";

/**
 * Recursively normalizes a SubCategory to a flat JSON structure with nested subcategories.
 *
 * @param subCategory - The subcategory entity to normalize.
 * @returns A fully normalized SubCategoryDataResponse with nested children.
 */
async function normalizeSubCategory(subCategory: SubCategory) {
  const resolvedCategory =
    subCategory.category && typeof subCategory.category === "object"
      ? await subCategory.category
      : null;

  const resolvedParent =
    subCategory.parentSubCategory &&
    typeof subCategory.parentSubCategory === "object"
      ? subCategory.parentSubCategory
      : null;

  const nestedSubCategories = subCategory.subCategories
    ? await Promise.all(
        subCategory.subCategories.map((child) => normalizeSubCategory(child))
      )
    : [];

  return {
    id: subCategory.id,
    name: subCategory.name,
    slug: subCategory.slug,
    description: subCategory.description,
    thumbnail: subCategory.thumbnail,
    position: subCategory.position,
    totalProducts: subCategory?.products?.length ?? 0,
    category: resolvedCategory ? resolvedCategory.id : null,
    parentSubCategory: resolvedParent ? resolvedParent.id : null,
    subCategories: nestedSubCategories,
    createdBy: subCategory.createdBy as any,
    createdAt:
      subCategory.createdAt instanceof Date
        ? subCategory.createdAt.toISOString()
        : subCategory.createdAt,
    deletedAt:
      subCategory.deletedAt instanceof Date
        ? subCategory.deletedAt.toISOString()
        : subCategory.deletedAt,
  };
}

/**
 * GraphQL Mutation Resolver to restore soft-deleted categories or subcategories with Redis caching.
 *
 * Workflow:
 * 1. Verifies user authentication and permission to restore categories.
 * 2. Validates input (ids, categoryType) using Zod schema.
 * 3. Attempts to retrieve category/subcategory data from Redis.
 * 4. Fetches missing data from the database if not found in Redis.
 * 5. Ensures all entities are soft-deleted before restoration.
 * 6. Restores entities in the database by clearing `deletedAt`.
 * 8. Clears the category search cache.
 * 9. Returns a success response or error if validation, permission, or restoration fails.
 *
 * Notes:
 * - Handles both `category` and `subCategory` types via a shared resolver.
 * - Supports multiple IDs for batch restoration.
 *
 * @param _ - Unused resolver root parameter.
 * @param args - Input arguments: ids (array of UUIDs), categoryType ("category" or "subCategory").
 * @param context - GraphQL context with authenticated user info.
 * @returns A `RestoreCategoryResponseOrError` indicating success or detailed error info.
 */
export const restoreCategory = async (
  _: any,
  args: MutationRestoreCategoryArgs,
  { user }: Context
): Promise<RestoreCategoryResponseOrError> => {
  try {
    // Verify user authentication
    const authResponse = checkUserAuth(user);
    if (authResponse) return authResponse;

    // Check if user has permission to restore a category
    const canRestore = await checkUserPermission({
      action: "canUpdate",
      entity: "category",
      user,
    });

    if (!canRestore) {
      return {
        statusCode: 403,
        success: false,
        message: "You do not have permission to restore categories",
        __typename: "BaseResponse",
      };
    }

    // Validate input data with Zod schema
    const parsed = restoreCategorySchema.safeParse(args.idsWithType);

    // Return detailed validation errors if input is invalid
    if (!parsed.success) {
      const errors = parsed.error.errors.map((e) => ({
        field: e.path.join("."),
        message: e.message,
      }));

      return {
        statusCode: 400,
        success: false,
        message: "Validation failed",
        errors,
        __typename: "ErrorResponse",
      };
    }

    const inputList = parsed.data;

    const categoryIds = inputList
      .filter((item) => item.categoryType === "category")
      .map((item) => item.id);

    const subCategoryIds = inputList
      .filter((item) => item.categoryType === "subCategory")
      .map((item) => item.id);

    const restoredCategories = categoryIds.length
      ? await restoreCategoryOrSubCategoryById(categoryIds, "category")
      : [];

    const restoredSubCategories = subCategoryIds.length
      ? await restoreCategoryOrSubCategoryById(subCategoryIds, "subCategory")
      : [];

    // Cache restored categories
    if (restoredCategories.length) {
      await Promise.all(
        restoredCategories.map((category) =>
          setCategoryInfoByIdInRedis(category.id, {
            id: category.id,
            name: category.name,
            slug: category.slug,
            description: category.description,
            thumbnail: category.thumbnail,
            position: category.position,
            totalProducts: category?.products?.length ?? 0,
            createdBy: category.createdBy as any,
            createdAt:
              category.createdAt instanceof Date
                ? category.createdAt.toISOString()
                : category.createdAt,
            deletedAt:
              category.deletedAt instanceof Date
                ? category.deletedAt.toISOString()
                : category.deletedAt,
          })
        )
      );
    }

    // Recursively normalize and cache restored subcategories
    if (restoredSubCategories.length) {
      await Promise.all(
        restoredSubCategories.map(async (subCategory: SubCategory) => {
          const normalized = await normalizeSubCategory(subCategory);
          return setSubCategoryInfoByIdInRedis(subCategory.id, normalized);
        })
      );
    }

    await clearAllCategorySearchCache();

    const totalCategories = restoredCategories.length;
    const totalSubCategories = restoredSubCategories.length;

    const categoryLabel = totalCategories === 1 ? "category" : "categories";
    const subCategoryLabel =
      totalSubCategories === 1 ? "sub category" : "sub categories";

    const parts = [];
    if (totalCategories > 0) parts.push(`${totalCategories} ${categoryLabel}`);
    if (totalSubCategories > 0)
      parts.push(`${totalSubCategories} ${subCategoryLabel}`);

    const message =
      parts.length > 0
        ? `Restoration successful: ${parts.join(" and ")} restored.`
        : "No items restored.";

    return {
      statusCode: 200,
      success: true,
      message,
      __typename: "BaseResponse",
    };
  } catch (error: any) {
    console.error("Restore category error:", error);
    return {
      statusCode: 500,
      success: false,
      message:
        CONFIG.NODE_ENV === "production"
          ? "Something went wrong. Please try again."
          : error.message || "Internal server error",
      __typename: "ErrorResponse",
    };
  }
};
