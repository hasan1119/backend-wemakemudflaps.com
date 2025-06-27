import CONFIG from "../../../config/config";
import { Context } from "../../../context";
import {
  getMediaByMediaIdFromRedis,
  setMediaByMediaIdInRedis,
} from "../../../helper/redis";
import {
  GetMediaByIdResponseOrError,
  QueryGetRoleByIdArgs,
} from "../../../types";
import { idSchema } from "../../../utils/data-validation";
import { checkUserAuth, checkUserPermission } from "../../services";
import { getMediaById as getMedia } from "./../../services/get-media/get-media";

/**
 * Retrieves a media file by its ID.
 *
 * Workflow:
 * 1. Verifies user authentication and checks read permission for media.
 * 2. Validates the provided ID using Zod.
 * 3. Attempts to retrieve cached media from Redis to improve performance.
 * 4. Attempts to retrieve media from the database.
 * 5. Returns media data or an appropriate error message.
 *
 * @param _ - Unused parent resolver parameter.
 * @param args - Contains the media ID.
 * @param context - GraphQL context containing the authenticated user.
 * @returns A promise resolving to GetMediaByIdResponseOrError.
 */
export const getMediaById = async (
  _: any,
  args: QueryGetRoleByIdArgs,
  { user }: Context
): Promise<GetMediaByIdResponseOrError> => {
  const { id } = args;

  try {
    // Check user authentication
    const authResponse = checkUserAuth(user);
    if (authResponse) return authResponse;

    // Check if user has permission to view media
    const canRead = await checkUserPermission({
      action: "canRead",
      entity: "media",
      user,
    });

    if (!canRead) {
      return {
        statusCode: 403,
        success: false,
        message: "You do not have permission to view media info",
        __typename: "BaseResponse",
      };
    }

    // Validate input data using Zod schema
    const validationResult = await idSchema.safeParseAsync({ id });

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

    // Attempt to retrieve cached media from Redis
    let media;

    media = await getMediaByMediaIdFromRedis(id);

    if (media.deletedAt) {
      return {
        statusCode: 404,
        success: false,
        message: `Media not found with this id: ${id} or has been deleted`,
        __typename: "BaseResponse",
      };
    }

    if (!media) {
      // On cache miss, fetch roles from database
      media = await getMedia(id);

      if (!media) {
        return {
          statusCode: 404,
          success: false,
          message: `Media not found with this id: ${id} or has been deleted`,
          __typename: "ErrorResponse",
        };
      }

      media = {
        ...media,
        createdAt: media.createdAt.toISOString(),
        deletedAt: media.deletedAt ? media.deletedAt.toISOString() : null,
        createdBy: media.createdBy as any,
      };

      // Cache media data in Redis
      await setMediaByMediaIdInRedis(media.id, media);
    }

    return {
      statusCode: 200,
      success: true,
      message: "Media file fetched successfully",
      media,
      __typename: "MediaResponse",
    };
  } catch (error: any) {
    console.error("Error retrieving media by ID:", error);

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
