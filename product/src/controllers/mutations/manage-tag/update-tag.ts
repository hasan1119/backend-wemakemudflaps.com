import CONFIG from "../../../config/config";
import { Context } from "../../../context";
import {
  getTagInfoByTagIdFromRedis,
  getTagNameExistFromRedis,
  getTagSlugExistFromRedis,
  removeTagInfoByTagIdFromRedis,
  removeTagNameExistFromRedis,
  removeTagSlugExistFromRedis,
  setTagInfoByTagIdInRedis,
  setTagNameExistInRedis,
  setTagSlugExistInRedis,
} from "../../../helper/redis";
import {
  MutationUpdateTagArgs,
  UpdateTagResponseOrError,
} from "../../../types";
import { updateTagSchema } from "../../../utils/data-validation";
import {
  checkUserAuth,
  checkUserPermission,
  findTagByNameToUpdate,
  findTagBySlugToUpdate,
  getTagById,
  updateTag as updateTagService,
} from "../../services";

/**
 * Handles updating tag data (name, slug) with proper validation and permission checks.
 *
 * Workflow:
 * 1. Authenticates user and verifies permission to update tags.
 * 2. Validates input (id, name, slug) using Zod schema.
 * 3. Fetches current tag data from Redis or DB.
 * 4. Checks if updated name or slug conflicts with existing tags.
 * 5. Updates the tag in the database.
 * 6. Updates Redis with new tag info and name existence key.
 * 7. Returns the updated tag or error if validation or update fails.
 *
 * @param _ - Unused parent parameter for GraphQL resolver.
 * @param args - Input arguments containing tag ID and updated fields.
 * @param context - GraphQL context containing authenticated user information.
 * @returns A promise resolving to an UpdateTagResponseOrError.
 */
export const updateTag = async (
  _: any,
  args: MutationUpdateTagArgs,
  { user }: Context
): Promise<UpdateTagResponseOrError> => {
  try {
    // Check user authentication
    const authError = checkUserAuth(user);
    if (authError) return authError;

    // Permission check
    const hasPermission = await checkUserPermission({
      user,
      action: "canUpdate",
      entity: "tag",
    });

    if (!hasPermission) {
      return {
        statusCode: 403,
        success: false,
        message: "You do not have permission to update tags",
        __typename: "BaseResponse",
      };
    }

    // Validate input
    const result = await updateTagSchema.safeParseAsync(args);
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

    const { id, name, slug } = result.data;

    // Get current tag data from Redis or DB
    let currentTag = await getTagInfoByTagIdFromRedis(id);

    if (currentTag?.deletedAt) {
      return {
        statusCode: 404,
        success: false,
        message: `Tag not found with this id: ${id} or has been deleted`,
        __typename: "BaseResponse",
      };
    }

    if (!currentTag) {
      currentTag = await getTagById(id); // fallback to DB
      if (!currentTag) {
        return {
          statusCode: 404,
          success: false,
          message: `Tag not found with this id: ${id} or has been deleted`,
          __typename: "BaseResponse",
        };
      }
    }

    // Check for duplicate name (if changed)
    if (name && name !== currentTag.name) {
      let nameExists;

      nameExists = await getTagNameExistFromRedis(name);

      if (!nameExists) {
        nameExists = findTagByNameToUpdate(id, name);
      }

      if (nameExists) {
        return {
          statusCode: 400,
          success: false,
          message: `Tag name: "${name}" already exists`,
          __typename: "BaseResponse",
        };
      }
    }

    // Check for duplicate name (if changed)
    if (slug && slug !== currentTag.slug) {
      let slugExists;

      slugExists = await getTagSlugExistFromRedis(slug);

      if (!slugExists) {
        slugExists = findTagBySlugToUpdate(id, slug);
      }

      if (slugExists) {
        return {
          statusCode: 400,
          success: false,
          message: `Tag slug: "${slug}" already exists`,
          __typename: "BaseResponse",
        };
      }
    }

    // Update the tag in the database
    const updatedTag = await updateTagService(id, { name, slug });

    // Update Redis cache: remove old, add new
    await Promise.all([
      removeTagInfoByTagIdFromRedis(id),
      removeTagNameExistFromRedis(currentTag.name),
      removeTagSlugExistFromRedis(currentTag.slug),
      setTagInfoByTagIdInRedis(id, updatedTag),
      setTagNameExistInRedis(updatedTag.name),
      setTagSlugExistInRedis(updatedTag.name),
    ]);

    return {
      statusCode: 200,
      success: true,
      message: "Tag updated successfully",
      tag: {
        id: updatedTag.id,
        name: updatedTag.name,
        slug: updatedTag.slug,
        createdBy: updatedTag.createdBy as any,
        createdAt: updatedTag.createdAt.toISOString(),
        deletedAt:
          updatedTag.deletedAt instanceof Date
            ? updatedTag.deletedAt.toISOString()
            : updatedTag.deletedAt,
      },
      __typename: "TagResponse",
    };
  } catch (error: any) {
    console.error("Error updating tag:", error);
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
