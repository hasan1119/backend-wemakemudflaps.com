import CONFIG from "../../../config/config";
import { Context } from "../../../context";
import {
  clearAllMediaSearchCache,
  getMediaByMediaIdFromRedis,
  setMediaByMediaIdInRedis,
} from "../../../helper/redis";
import {
  MutationUpdateMediaFileInfoArgs,
  UpdateMediaResponseOrError,
} from "../../../types";
import { UpdateMediaFilesSchema } from "../../../utils/data-validation";
import {
  checkUserAuth,
  checkUserPermission,
  getMediaById,
} from "../../services";
import { updateMediaFileInfo as updateMedia } from "../../services/update-media-file-info/update-media-file-info";

/**
 * Handles updating metadata for a media file.
 *
 * Workflow:
 * 1. Verifies user authentication and permission to update media.
 * 2. Validates input fields using Zod schema.
 * 3. Attempts to retrieve cached media from Redis to improve performance.
 * 4. On cache miss, fetches media from the database.
 * 5. Updates relevant metadata fields (title, description, alt text, etc.).
 * 6. Saves updated media to the database.
 * 7. Updates Redis cache with restored media.
 * 8. Returns a success response or appropriate error.
 *
 * @param _ - Unused parent resolver parameter.
 * @param args - Contains the media update input fields.
 * @param context - Contains the authenticated user info.
 * @returns A promise resolving to a BaseResponseOrError object containing status, message, and errors if applicable.
 */
export const updateMediaFileInfo = async (
  _: any,
  args: MutationUpdateMediaFileInfoArgs,
  { user }: Context
): Promise<UpdateMediaResponseOrError> => {
  const { inputs } = args;
  try {
    // Check user authentication
    const authResponse = checkUserAuth(user);
    if (authResponse) return authResponse;

    // Validate input data using Zod schema
    const validationResult = await UpdateMediaFilesSchema.safeParseAsync(
      inputs
    );

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
        message: "You do not have permission to media metadata",
        __typename: "BaseResponse",
      };
    }

    if (!validationResult.success) {
      const errorMessages = validationResult.error.errors.map((error) => ({
        field: error.path.join("."),
        message: error.message,
      }));

      return {
        statusCode: 400,
        success: false,
        message: "Validation failed",
        errors: errorMessages,
        __typename: "ErrorResponse",
      };
    }

    const { id, title, description, altText, dimension, length, category } =
      validationResult.data;

    // Attempt to retrieve cached media from Redis
    let existingMedia;

    existingMedia = await getMediaByMediaIdFromRedis(id);

    if (existingMedia?.deletedAt) {
      return {
        statusCode: 404,
        success: false,
        message: `Media not found with this id: ${id}, or it may have been deleted or moved to the trash`,
        __typename: "BaseResponse",
      };
    }

    if (!existingMedia) {
      // On cache miss, fetch roles from database
      const dbMedia = await getMediaById(id);

      if (!dbMedia) {
        return {
          statusCode: 404,
          success: false,
          message: `Media not found with this id: ${id}, or it may have been deleted or moved to the trash`,
          __typename: "ErrorResponse",
        };
      }

      existingMedia = {
        ...dbMedia,
        createdAt: dbMedia.createdAt.toISOString(),
        deletedAt: dbMedia.deletedAt ? dbMedia.deletedAt.toISOString() : null,
        createdBy: dbMedia.createdBy as any,
      };
    }

    // Prepare update object, excluding undefined fields
    if (title !== undefined && title !== null) existingMedia.title = title;
    if (description !== undefined && description !== null)
      existingMedia.description = description;
    if (altText !== undefined && altText !== null)
      existingMedia.altText = altText;
    if (dimension !== undefined && dimension !== null)
      existingMedia.dimension = dimension;
    if (length !== undefined && length !== null) existingMedia.length = length;
    if (category !== undefined && category !== null)
      existingMedia.category = category;
    existingMedia.createdBy = user.id;

    // Update media files in the database
    await updateMedia(existingMedia);

    // Cache the updated media in Redis and clear the medias paginated list

    await Promise.all([
      setMediaByMediaIdInRedis(id, {
        ...existingMedia,
        createdBy: existingMedia.createdBy as any,
        createdAt: existingMedia.createdAt,
        deletedAt: existingMedia.deletedAt ? existingMedia.deletedAt : null,
      }),
      clearAllMediaSearchCache(),
    ]);

    return {
      statusCode: 200,
      success: true,
      message: "Media file(s) updated successfully",
      media: {
        ...existingMedia,
        createdAt: existingMedia.createdAt,
        deletedAt: existingMedia.deletedAt
          ? existingMedia.deletedAt.toISOString()
          : null,
        createdBy: existingMedia.createdBy as any,
      },
      __typename: "MediaResponse",
    };
  } catch (error: any) {
    console.error("Error during media update:", error);

    return {
      statusCode: 500,
      success: false,
      message: `${
        CONFIG.NODE_ENV === "production"
          ? "Something went wrong, please try again."
          : error.message || "Internal server error"
      }`,
      __typename: "ErrorResponse",
    };
  }
};
