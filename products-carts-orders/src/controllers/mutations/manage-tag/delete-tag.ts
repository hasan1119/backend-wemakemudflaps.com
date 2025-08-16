import CONFIG from "../../../config/config";
import { Context } from "../../../context";
import {
  clearTagsAndCountCache,
  getTagInfoByIdFromRedis,
  removeTagInfoByIdFromRedis,
  removeTagNameExistFromRedis,
  removeTagSlugExistFromRedis,
  setTagInfoByIdInRedis,
} from "../../../helper/redis";
import { BaseResponseOrError, MutationDeleteTagArgs } from "../../../types";
import { idsSchema, skipTrashSchema } from "../../../utils/data-validation";
import {
  checkUserAuth,
  checkUserPermission,
  getTagsByIds,
  hardDeleteTag,
  softDeleteTag,
} from "../../services";

// Clear tag-related cache entries in Redis
const clearTagCache = async (id: string, name: string, slug: string) => {
  await Promise.all([
    removeTagInfoByIdFromRedis(id),
    removeTagNameExistFromRedis(name),
    removeTagSlugExistFromRedis(slug),
    clearTagsAndCountCache(),
  ]);
};

// Perform soft delete and update cache
const softDeleteAndCache = async (id: string) => {
  const deletedData = await softDeleteTag(id);
  setTagInfoByIdInRedis(id, deletedData);
  await clearTagsAndCountCache();
};

/**
 * Handles the deletion of tags with validation and permission checks.
 *
 * Workflow:
 * 1. Verifies user authentication and permission to delete tags.
 * 2. Validates input (ids, skipTrash) using Zod schemas.
 * 3. Retrieves tag data from Redis or database for each tag ID.
 * 4. Ensures tags are not used in any products.
 * 5. Performs soft or hard deletion based on skipTrash parameter.
 * 6. Clears related cache entries in Redis.
 * 7. Returns a success response with deleted tag names or error if validation, permission, or deletion fails.
 *
 * @param _ - Unused parent parameter for GraphQL resolver.
 * @param args - Input arguments containing tag IDs and skipTrash flag.
 * @param context - GraphQL context containing authenticated user information.
 * @returns A promise resolving to a BaseResponseOrError object containing status, message, and errors if applicable.
 */
export const deleteTag = async (
  _: any,
  args: MutationDeleteTagArgs,
  { user }: Context
): Promise<BaseResponseOrError> => {
  try {
    // Verify user authentication
    const authResponse = checkUserAuth(user);
    if (authResponse) return authResponse;

    // Check if user has permission to delete tags
    const canDelete = await checkUserPermission({
      action: "canDelete",
      entity: "tag",
      user,
    });

    if (!canDelete) {
      return {
        statusCode: 403,
        success: false,
        message: "You do not have permission to delete tag(s)",
        __typename: "BaseResponse",
      };
    }

    const { ids, skipTrash } = args;

    // Validate input data with Zod schemas
    const [idsResult, skipTrashResult] = await Promise.all([
      idsSchema.safeParseAsync({ ids }),
      skipTrashSchema.safeParseAsync({ skipTrash }),
    ]);

    if (!idsResult.success || !skipTrashResult.success) {
      const errors = [
        ...(idsResult.error?.errors || []),
        ...(skipTrashResult.error?.errors || []),
      ].map((e) => ({
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

    // Attempt to retrieve tag data from Redis
    const cachedTags = await Promise.all(ids.map(getTagInfoByIdFromRedis));

    const foundTags: any[] = [];
    const missingIds: string[] = [];

    cachedTags.forEach((tag, index) => {
      if (tag) {
        foundTags.push(tag);
      } else {
        missingIds.push(ids[index]);
      }
    });

    // Fetch missing tags from the database
    if (missingIds.length > 0) {
      const dbTags = await getTagsByIds(missingIds);

      if (dbTags.length !== missingIds.length) {
        const dbFoundIds = new Set(dbTags.map((t) => t.id));
        const notFoundTags = missingIds
          .filter((id) => !dbFoundIds.has(id))
          .map((id) => id);

        return {
          statusCode: 404,
          success: false,
          message: `Tags not found with IDs: ${notFoundTags.join(", ")}`,
          __typename: "BaseResponse",
        };
      }

      foundTags.push(...dbTags);
    }

    const deletedTags: string[] = [];

    for (const tagData of foundTags) {
      const { id, name, slug, deletedAt } = tagData;

      // Perform soft or hard deletion based on skipTrash
      if (skipTrash) {
        await hardDeleteTag(id);
        await clearTagCache(id, name, slug);
      } else {
        if (deletedAt) {
          return {
            statusCode: 400,
            success: false,
            message: `Tag: ${name} already in the trash`,
            __typename: "BaseResponse",
          };
        }
        await softDeleteAndCache(id);
      }

      deletedTags.push(name);
    }

    return {
      statusCode: 200,
      success: true,
      message: deletedTags.length
        ? `${
            skipTrash ? "Tag(s) permanently deleted" : "Tag(s) moved to trash"
          } successfully: ${deletedTags.join(", ")}`
        : "No tags deleted",
      __typename: "BaseResponse",
    };
  } catch (error: any) {
    console.error("Error deleting tag:", error);

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
