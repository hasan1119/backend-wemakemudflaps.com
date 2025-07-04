import CONFIG from "../../../config/config";
import { Context } from "../../../context";
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
 * GraphQL Mutation Resolver to restore a soft-deleted category or subcategory.
 *
 * Workflow:
 * 1. Verifies user authentication and authorization to perform update operations.
 * 2. Validates the input arguments using Zod schema.
 * 3. Normalizes `categoryType` to match service expectations (e.g., converts "subCategory" to "subcategory").
 * 4. Invokes the service function to restore the soft-deleted entity by clearing `deletedAt`.
 * 5. Returns a success message on successful restoration, or error response if any failure occurs.
 *
 * Notes:
 * - This handles both `category` and `subcategory` restoration using the same resolver.
 * - A permission check for `canUpdate` is used since restore is a form of update.
 *
 * @param _ - Unused resolver root parameter.
 * @param args - Input arguments including ID of the entity to restore and its category type.
 * @param context - GraphQL context containing authenticated user information.
 * @returns A `RestoreCategoryResponseOrError` indicating operation success or failure details.
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
