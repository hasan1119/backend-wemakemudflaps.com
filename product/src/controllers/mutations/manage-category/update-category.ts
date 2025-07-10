import CONFIG from "../../../config/config";
import { Context } from "../../../context";
import { MutationUpdateCategoryArgs } from "../../../types";
import { updateCategorySchema } from "../../../utils/data-validation";
import {
  checkUserAuth,
  checkUserPermission,
  findCategoryByNameOrSlugToUpdateScoped,
  getCategoryById,
  updateCategory as updateCategoryService,
} from "../../services";

/**
 * Handles updating an existing category information with validation and permission checks.
 *
 * Workflow:
 * 1. Verifies user authentication and retrieves user data from Redis.
 * 2. Checks user permission to update roles.
 * 3. Validates input (role ID, name, description, thumbnail) using Zod schema.
 * 4. Retrieves category data from database and ensures it exists and is not soft-deleted.
 * 5. Updates category information in the database with audit details.
 * 6. Returns a success response or error if validation, permission, or update fails.
 *
 * @param _ - Unused parent parameter for GraphQL resolver.
 * @param args - Input arguments containing role ID, name, description, permissions, protection flags, and optional password.
 * @param context - GraphQL context containing authenticated user information.
 * @returns A promise resolving to a BaseResponseOrError object containing status, message, and errors if applicable.
 */
export const updateCategory = async (
  _: any,
  args: MutationUpdateCategoryArgs,
  { user }: Context
): Promise<any> => {
  try {
    // Verify user authentication
    const authResponse = checkUserAuth(user);
    if (authResponse) return authResponse;

    // Check if user has permission to update roles
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

    // Validate input data with Zod schema
    const validationResult = await updateCategorySchema.safeParseAsync(args);

    // Return detailed validation errors if input is invalid
    if (!validationResult.success) {
      const errors = validationResult.error.errors.map((e) => ({
        field: e.path.join("."), // Join path array to string for field identification
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

    const { id, name, slug } = validationResult.data;

    // Check database for category existence
    const categoryExist = await getCategoryById(id);

    if (!categoryExist) {
      return {
        statusCode: 404,
        success: false,
        message: "Category not found",
        __typename: "BaseResponse",
      };
    }

    // Check for name conflict in the same parent scope (excluding self)
    const nameConflict = await findCategoryByNameOrSlugToUpdateScoped(
      id,
      name,
      slug ? slug : undefined
    );

    if (nameConflict) {
      return {
        statusCode: 400,
        success: false,
        message: "Category with this name/slug already exists",
        __typename: "BaseResponse",
      };
    }

    // Update role information in the database
    const result = await updateCategoryService(id, args);

    return {
      statusCode: 201,
      success: true,
      message: "Subcategory updated successfully",
      category: {
        ...(categoryExist as any),
        thumbnail: result.thumbnail as any,
        createdBy: result.createdBy as any,
        subCategories: result.subCategories as any,
        position: result.position,
        createdAt:
          result.createdAt instanceof Date
            ? result.createdAt.toISOString()
            : result.createdAt,
        deletedAt:
          result.deletedAt instanceof Date
            ? result.deletedAt.toISOString()
            : result.deletedAt,
      },
      __typename: "SubCategoryResponse",
    };
  } catch (error: any) {
    console.error("Error updating category info:", error);

    return {
      statusCode: 500,
      success: false,
      message: `${
        CONFIG.NODE_ENV === "production"
          ? "Something went wrong, please try again."
          : error.message || "Internal server error"
      }`,
      __typename: "BaseResponse",
    };
  }
};
