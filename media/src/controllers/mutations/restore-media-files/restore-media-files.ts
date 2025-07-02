import CONFIG from "../../../config/config";
import { Context } from "../../../context";
import {
  clearAllMediaSearchCache,
  getMediaByMediaIdFromRedis,
  setMediaByMediaIdInRedis,
} from "../../../helper/redis";
import {
  BaseResponseOrError,
  MutationRestoreMediaFilesArgs,
} from "../../../types";
import { idsSchema } from "../../../utils/data-validation";
import {
  checkUserAuth,
  checkUserPermission,
  getMediaByIds,
  restoreMedia,
} from "../../services";

/**
 * Handles the restoration of soft-deleted medias from the trash.
 *
 * Workflow:
 * 1. Verifies user authentication and permission to restore medias.
 * 2. Validates input role IDs using Zod schema.
 * 3. Attempts to retrieve role data from Redis for performance optimization.
 * 6. Restores medias by clearing their deletedAt timestamp in the database.
 * 7. Updates Redis cache with restored media.
 * 8. Returns a success response or error if validation, permission, or restoration fails.
 *
 * @param _ - Unused parent parameter for GraphQL resolver.
 * @param args - Input arguments containing the IDs of medias to restore.
 * @param context - GraphQL context containing authenticated user information.
 * @returns A promise resolving to a BaseResponseOrError object containing status, message, and errors if applicable.
 */
export const restoreMediaFiles = async (
  _: any,
  args: MutationRestoreMediaFilesArgs,
  { user }: Context
): Promise<BaseResponseOrError> => {
  try {
    // Verify user authentication
    const authResponse = checkUserAuth(user);
    if (authResponse) return authResponse;

    // Check if user has permission to restore medias
    const canUpdate = await checkUserPermission({
      action: "canUpdate",
      entity: "media",
      user,
    });

    if (!canUpdate) {
      return {
        statusCode: 403,
        success: false,
        message: "You do not have permission to restore media",
        __typename: "BaseResponse",
      };
    }

    // Validate input role IDs with Zod schema
    const validationResult = await idsSchema.safeParseAsync(args);

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

    const { ids } = validationResult.data;

    // Attempt to retrieve media data from Redis
    const cachedMedias = await Promise.all(ids.map(getMediaByMediaIdFromRedis));

    const foundMedias: any[] = [];
    const missingIds: string[] = [];

    cachedMedias.forEach((media, index) => {
      if (media) {
        foundMedias.push(media);
      } else {
        missingIds.push(ids[index]);
      }
    });

    // Fetch missing medias from the database
    if (missingIds.length > 0) {
      const dbMedias = await getMediaByIds(missingIds);
      if (dbMedias.length !== missingIds.length) {
        const dbFoundIds = new Set(dbMedias.map((r) => r.id));
        const notFoundMedias = missingIds
          .filter((id) => !dbFoundIds.has(id))
          .map((id) => id);

        const notFoundNames = notFoundMedias.map((id) => {
          const media = dbMedias.find((r) => r.id === id);
          return media ? media.fileName : '"Unknown file"';
        });

        return {
          statusCode: 404,
          success: false,
          message: `Medias with IDs ${notFoundNames.join(", ")} not found`,
          __typename: "BaseResponse",
        };
      }
      foundMedias.push(...dbMedias);
    }

    // Verify all medias are soft-deleted
    const nonDeleted = foundMedias.filter((media) => !media.deletedAt);
    if (nonDeleted.length > 0) {
      return {
        statusCode: 400,
        success: false,
        message: `Medias with IDs ${nonDeleted
          .map((r) => r.id)
          .join(", ")} are not in the trash`,
        __typename: "BaseResponse",
      };
    }

    // Restore soft-deleted medias
    const result = await restoreMedia(ids);

    // Update Redis cache with restored role data and clear the medias paginated list
    await Promise.all([
      result.map((media) =>
        setMediaByMediaIdInRedis(media.id, {
          ...media,
          category: typeof media.category === "string" ? media.category : null,
          createdBy: media.createdBy as any,
          createdAt: media.createdAt.toISOString(),
          deletedAt: media.deletedAt ? media.deletedAt.toISOString() : null,
        })
      ),
      clearAllMediaSearchCache(),
    ]);

    return {
      statusCode: 200,
      success: true,
      message: `Media(s) restored successfully`,
      __typename: "BaseResponse",
    };
  } catch (error: any) {
    console.error("Error restoring media(s):", error);

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
