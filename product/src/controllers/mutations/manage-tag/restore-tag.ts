import CONFIG from "../../../config/config";
import { Context } from "../../../context";
import {
  clearAllTagSearchCache,
  getTagInfoByTagIdFromRedis,
  setTagInfoByTagIdInRedis,
} from "../../../helper/redis";
import { BaseResponseOrError, MutationRestoreTagArgs } from "../../../types";
import { idsSchema } from "../../../utils/data-validation";
import {
  checkUserAuth,
  checkUserPermission,
  getTagsByIds,
  restoreTag,
} from "../../services";

/**
 * Handles the restoration of soft-deleted tags.
 *
 * Workflow:
 * 1. Verifies user authentication and permission to restore tags.
 * 2. Validates input tag IDs using Zod schema.
 * 3. Attempts to retrieve tag data from Redis.
 * 4. Fetches missing tag data from the database if not found in Redis.
 * 5. Ensures all tags are soft-deleted before restoration.
 * 6. Restores tags in the database.
 * 7. Updates Redis cache with restored tag data and sets name existence.
 * 8. Returns success response or error if validation, permission, or restoration fails.
 *
 * @param _ - Unused GraphQL resolver parent param.
 * @param args - Mutation args containing tag IDs to restore.
 * @param context - GraphQL context with authenticated user.
 * @returns A promise resolving to BaseResponseOrError.
 */
export const restoreTags = async (
  _: any,
  args: MutationRestoreTagArgs,
  { user }: Context
): Promise<BaseResponseOrError> => {
  try {
    // Check authentication
    const authError = checkUserAuth(user);
    if (authError) return authError;

    // Check restore permission
    const hasPermission = await checkUserPermission({
      action: "canUpdate",
      entity: "tag",
      user,
    });

    if (!hasPermission) {
      return {
        statusCode: 403,
        success: false,
        message: "You do not have permission to restore tag(s)",
        __typename: "BaseResponse",
      };
    }

    // Validate input
    const validation = await idsSchema.safeParseAsync(args);
    if (!validation.success) {
      const errors = validation.error.errors.map((e) => ({
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

    const { ids } = validation.data;

    // Attempt Redis fetch
    const cachedTags = await Promise.all(ids.map(getTagInfoByTagIdFromRedis));
    const foundTags: any[] = [];
    const missingIds: string[] = [];

    cachedTags.forEach((tag, index) => {
      if (tag) foundTags.push(tag);
      else missingIds.push(ids[index]);
    });

    // Fetch missing tags from the database
    if (missingIds.length > 0) {
      const dbTags = await getTagsByIds(missingIds);
      if (dbTags.length !== missingIds.length) {
        const dbFoundIds = new Set(dbTags.map((r) => r.id));
        const notFoundTags = missingIds
          .filter((id) => !dbFoundIds.has(id))
          .map((id) => id);

        const notFoundNames = notFoundTags.map((id) => {
          const tag = dbTags.find((r) => r.id === id);
          return tag ? tag.name : '"Unknown Tag"';
        });

        return {
          statusCode: 404,
          success: false,
          message: `Tags with names: ${notFoundNames.join(", ")} not found`,
          __typename: "BaseResponse",
        };
      }
      foundTags.push(...dbTags);
    }

    // Check all tags are soft-deleted
    const notDeleted = foundTags.filter((tag) => !tag.deletedAt);
    if (notDeleted.length > 0) {
      return {
        statusCode: 400,
        success: false,
        message: `Tags with IDs ${notDeleted
          .map((r) => r.id)
          .join(", ")} are not in the trash`,
        __typename: "BaseResponse",
      };
    }

    // Restore tags
    const restored = await restoreTag(ids);

    // Update Redis
    await Promise.all([
      restored.map((tag) => setTagInfoByTagIdInRedis(tag.id, tag))
    ),
clearAllTagSearchCache()
			]
		 

    return {
      statusCode: 200,
      success: true,
      message: `Tag(s) restored successfully`,
      __typename: "BaseResponse",
    };
  } catch (error: any) {
    console.error("Error restoring tag:", error);
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
