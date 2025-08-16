import CONFIG from "../../../config/config";
import { Context } from "../../../context";
import {
  MutationUpdateCategoryPositionArgs,
  UpdateCategoryResponseOrError,
} from "../../../types";
import { updateCategoryPositionSchema } from "../../../utils/data-validation";
import {
  checkUserAuth,
  checkUserPermission,
  getCategoryById,
  updatePosition,
} from "../../services";

/**
 * Handles updating an existing category position with validation and permission checks.
 *
 * Workflow:
 * 1. Verifies user authentication and authorization.
 * 2. Validates input (id and position) using Zod schema.
 * 3. Retrieves category from database and ensures it exists and is not soft-deleted.
 * 4. Updates category position scoped by parentCategoryId.
 * 5. Returns success response or error if validation, permission, or update fails.
 *
 * @param _ - Unused parent parameter for GraphQL resolver.
 * @param args - Input arguments containing category ID and new position.
 * @param context - GraphQL context containing authenticated user information.
 * @returns Promise resolving to UpdateCategoryResponseOrError.
 */
export const updateCategoryPosition = async (
  _: any,
  args: MutationUpdateCategoryPositionArgs,
  { user }: Context
): Promise<UpdateCategoryResponseOrError> => {
  try {
    // Verify user authentication
    const authResponse = checkUserAuth(user);
    if (authResponse) return authResponse;

    // Check if user has permission to update categories
    const canUpdate = await checkUserPermission({
      action: "canUpdate",
      entity: "category",
      user,
    });

    if (!canUpdate) {
      return {
        statusCode: 403,
        success: false,
        message: "You do not have permission to update any category info",
        __typename: "BaseResponse",
      };
    }

    // Validate input data (only id and position expected now)
    const validationResult = await updateCategoryPositionSchema.safeParseAsync(
      args
    );

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

    const { id, position } = validationResult.data;

    // Fetch category and ensure it exists
    const categoryExist = await getCategoryById(id);

    if (!categoryExist) {
      return {
        statusCode: 404,
        success: false,
        message: "Category not found",
        __typename: "BaseResponse",
      };
    }

    // Update position scoped by parentCategoryId
    await updatePosition(id, position, {
      parentCategoryId: categoryExist.parentCategory?.id ?? null,
    });

    return {
      statusCode: 201,
      success: true,
      message: "Category position updated successfully",
      category: {
        ...(categoryExist as any),
        thumbnail: categoryExist.thumbnail as any,
        createdBy: categoryExist.createdBy as any,
        subCategories: categoryExist.subCategories as any,
        position,
        createdAt:
          categoryExist.createdAt instanceof Date
            ? categoryExist.createdAt.toISOString()
            : categoryExist.createdAt,
        deletedAt:
          categoryExist.deletedAt instanceof Date
            ? categoryExist.deletedAt.toISOString()
            : categoryExist.deletedAt,
      },
      __typename: "CategoryResponse",
    };
  } catch (error: any) {
    console.error("Error updating category position:", error);

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
