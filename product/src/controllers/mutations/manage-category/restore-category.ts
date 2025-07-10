import CONFIG from "../../../config/config";
import { Context } from "../../../context";
import {
  MutationRestoreCategoryArgs,
  RestoreCategoryResponseOrError,
} from "../../../types";
import { idsSchema } from "../../../utils/data-validation";
import {
  checkUserAuth,
  checkUserPermission,
  restoreCategoriesByIds,
} from "../../services";

/**
 * GraphQL Mutation Resolver to restore one or more soft-deleted categories or subcategories.
 *
 * Workflow:
 * 1. Verifies user authentication and authorization to perform update operations.
 * 2. Validates the input arguments using Zod schema.
 * 3. Invokes the service function to restore soft-deleted entities by clearing `deletedAt`.
 * 4. Returns a success message on successful restoration, or error response if any failure occurs.
 *
 * Notes:
 * - This handles both categories and subcategories, depending on the input IDs.
 * - A permission check for `canUpdate` is used since restore is considered an update.
 *
 * @param _ - Unused resolver root parameter.
 * @param args - Input arguments including an array of IDs to restore.
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
    const parsed = await idsSchema.safeParseAsync(args);

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

    const { ids } = parsed.data;

    const restoredCategories = ids.length
      ? await restoreCategoriesByIds(ids)
      : [];

    const totalCategories = restoredCategories.length;

    const message =
      totalCategories > 0
        ? `Restoration successful: ${totalCategories} item(s) restored.`
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
