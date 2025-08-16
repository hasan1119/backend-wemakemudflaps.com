import CONFIG from "../../../config/config";
import { Context } from "../../../context";
import {
  BaseResponseOrError,
  MutationDeleteCategoryArgs,
} from "../../../types";
import { deleteCategorySchema } from "../../../utils/data-validation";
import {
  checkUserAuth,
  checkUserPermission,
  hardDeleteCategory,
  softDeleteCategory,
} from "../../services";

/**
 * GraphQL Mutation Resolver to delete one or more categories or subcategories.
 *
 * Workflow:
 * 1. Verifies user authentication and delete permission.
 * 2. Validates input arguments with Zod.
 * 3. For each id:
 *    - Checks existence.
 *    - Checks deletability (no associated products).
 *    - Performs soft or hard delete based on skipTrash flag.
 * 4. Returns summary response.
 *
 * Notes:
 * - This handles both categories and subcategories by inspecting the entity.
 *
 * @param _ - Unused resolver root param.
 * @param args - Contains ids array and skipTrash flag.
 * @param context - GraphQL context with authenticated user info.
 * @returns BaseResponseOrError indicating success or error details.
 */
export const deleteCategory = async (
  _: any,
  args: MutationDeleteCategoryArgs,
  { user }: Context
): Promise<BaseResponseOrError> => {
  try {
    // Authenticate user
    const authResponse = checkUserAuth(user);
    if (authResponse) return authResponse;

    // Permission check
    const canDelete = await checkUserPermission({
      action: "canDelete",
      entity: "category",
      user,
    });
    if (!canDelete) {
      return {
        statusCode: 403,
        success: false,
        message: "You do not have permission to delete categories",
        __typename: "BaseResponse",
      };
    }

    // Validate input
    const validationResult = deleteCategorySchema.safeParse(args);
    if (!validationResult.success) {
      const errors = validationResult.error.errors.map((e) => ({
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

    const { ids, skipTrash } = validationResult.data;

    for (const id of ids) {
      // Perform delete action
      if (skipTrash) {
        await hardDeleteCategory(id);
      } else {
        await softDeleteCategory(id);
      }
    }

    return {
      statusCode: 200,
      success: true,
      message: skipTrash
        ? `Selected categories/subcategories permanently deleted successfully`
        : `Selected categories/subcategories moved to trash successfully`,
      __typename: "BaseResponse",
    };
  } catch (error: any) {
    console.error("Error deleting category/subcategory:", error);

    return {
      statusCode: 500,
      success: false,
      message:
        CONFIG.NODE_ENV === "production"
          ? "Something went wrong, please try again."
          : error.message || "Internal server error",
      __typename: "BaseResponse",
    };
  }
};
