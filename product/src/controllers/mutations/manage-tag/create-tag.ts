import CONFIG from "../../../config/config";
import { Context } from "../../../context";
import {
  CreateTagResponseOrError,
  MutationCreateTagArgs,
} from "../../../types";
import { createTagSchema } from "../../../utils/data-validation";
import {
  checkUserAuth,
  checkUserPermission,
  createTag as createTagService,
  findTagByName,
} from "../../service";

/**
 * Handles the creation of a new tag.
 *
 * Workflow:
 * 1. Verifies user authentication and authorization to create tags.
 * 2. Validates input using Zod schema.
 * 3. Checks if a tag with the same name already exists.
 * 4. Creates and stores the new tag in the database.
 * 5. Returns the created tag or an appropriate error response.
 *
 * @param _ - Unused parent resolver param.
 * @param args - Input arguments for creating a tag (name, slug).
 * @param context - GraphQL context containing authenticated user.
 * @returns A union response containing either the created tag or an error.
 */
export const createTag = async (
  _: any,
  args: MutationCreateTagArgs,
  { user }: Context
): Promise<CreateTagResponseOrError> => {
  try {
    // Verify user authentication
    const authError = checkUserAuth(user);
    if (authError) return authError;

    // Check if user has permission to create a tag
    const hasPermission = await checkUserPermission({
      user,
      action: "canCreate",
      entity: "tag",
    });

    if (!hasPermission) {
      return {
        statusCode: 403,
        success: false,
        message: "You do not have permission to create tags",
        __typename: "BaseResponse",
      };
    }

    // Validate input data with Zod schema
    const result = await createTagSchema.safeParseAsync(args);

    // Return detailed validation errors if input is invalid
    if (!result.success) {
      const errors = result.error.errors.map((e) => ({
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

    const { name, slug } = result.data;

    // Check database for tag existence
    const existingTag = await findTagByName(name);
    if (existingTag) {
      return {
        statusCode: 400,
        success: false,
        message: "A tag with this name already exists",
        __typename: "BaseResponse",
      };
    }

    // Create the tag in the database
    const tag = await createTagService({ name, slug }, user.id);

    return {
      statusCode: 201,
      success: true,
      message: "Tag created successfully",
      tag: {
        id: tag.id,
        name: tag.name,
        slug: tag.slug,
        createdBy: tag.createdBy as any,
        createdAt:
          tag.createdAt instanceof Date
            ? tag.createdAt.toISOString()
            : tag.createdAt,
        deletedAt:
          tag.deletedAt instanceof Date
            ? tag.deletedAt.toISOString()
            : tag.deletedAt,
      },
      __typename: "TagResponse",
    };
  } catch (error: any) {
    console.error("Error creating tag:", error);
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
