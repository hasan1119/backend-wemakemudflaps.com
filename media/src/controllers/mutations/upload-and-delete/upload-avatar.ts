import CONFIG from "../../../config/config";
import { Context } from "../../../context";
import {
  clearAllMediaSearchCache,
  removeMediaByMediaIdFromRedis,
  setMediaByMediaIdInRedis,
} from "../../../helper/redis";
import {
  MutationUploadAvatarArgs,
  UploadMediaResponseOrError,
} from "../../../types";
import { uploadMediaInputSchema } from "../../../utils/data-validation";
import {
  deleteMediaFiles,
  uploadMediaFiles as uploadFiles,
} from "../../services";
import { checkUserAuth } from "../../services/session-check/session-check";

/**
 * Handles uploading of media for avatar.
 *
 * Workflow:
 * 1. Verifies user authentication to upload avatar.
 * 3. Validates input using a Zod schema that includes user ID context.
 * 4. Calls the service to upload media files.
 * 5. Caches the new media in Redis for future requests.
 * 6. Returns success or validation/error response.
 *
 * @param _ - Unused parent resolver parameter.
 * @param args - Contains the inputs (media file details).
 * @param context - GraphQL context containing the authenticated user.
 * @returns A promise resolving to BaseResponseOrError.
 */
export const uploadAvatar = async (
  _: any,
  args: MutationUploadAvatarArgs,
  { user }: Context
): Promise<UploadMediaResponseOrError> => {
  try {
    // Check user authentication
    const authResponse = checkUserAuth(user);
    if (authResponse) return authResponse;

    // Args with type
    const avatarArgs = {
      ...args.inputs,
      category: "Profile",
    };

    // Validate input data using Zod schema
    const validationResult = await uploadMediaInputSchema.safeParseAsync(
      avatarArgs
    );

    // If validation fails, return detailed error messages with field names
    if (!validationResult.success) {
      const errorMessages = validationResult.error.errors.map((error) => ({
        field: error.path.join("."), // Converts the path array to a string
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

    const result = await uploadFiles([avatarArgs]);

    // delete if the old avatar available
    if (user.avatar) {
      await deleteMediaFiles([user.avatar]);

      // Remove the previous avatar from cache
      await removeMediaByMediaIdFromRedis(user.avatar);
    }

    // Cache the new medias in Redis and clear the medias paginated list
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
      message: "Avatar updated successfully",
      medias: result.map((media) => ({
        ...media,
        category: typeof media.category === "string" ? media.category : null,
        createdBy: media.createdBy as any,
        createdAt: media.createdAt.toISOString(),
        deletedAt: media.deletedAt ? media.deletedAt.toISOString() : null,
      })),
      __typename: "UploadMediaResponse",
    };
  } catch (error: any) {
    console.error("Error during avatar upload:", error);

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
