import CONFIG from "../../../config/config";
import { Context } from "../../../context";
import {
  clearAllMediaSearchCache,
  setMediaByMediaIdInRedis,
} from "../../../helper/redis";
import {
  MediaCategory,
  MutationUploadMediaFilesArgs,
  UploadMediaResponseOrError,
} from "../../../types";
import { createUploadMediaFilesSchema } from "../../../utils/data-validation";
import { checkUserPermission } from "../../services";
import { checkUserAuth } from "../../services/session-check/session-check";
import { uploadMediaFiles as uploadFiles } from "../../services/upload-and-delete/upload-and-delete-media-files";

/**
 * Handles uploading of media files.
 *
 * Workflow:
 * 1. Verifies user authentication and permission to upload medias.
 * 3. Validates input using a Zod schema that includes user ID context.
 * 4. Calls the service to upload media files.
 * 5. Caches the new medias in Redis for future requests.
 * 6. Returns success or validation/error response.
 *
 * @param _ - Unused parent resolver parameter.
 * @param args - Contains the inputs (media file details).
 * @param context - GraphQL context containing the authenticated user.
 * @returns A promise resolving to BaseResponseOrError.
 */
export const uploadMediaFiles = async (
  _: any,
  args: MutationUploadMediaFilesArgs,
  { user }: Context
): Promise<UploadMediaResponseOrError> => {
  const data = args.inputs;

  try {
    // Check user authentication
    const authResponse = checkUserAuth(user);
    if (authResponse) return authResponse;

    // Replace "Avatar" with the correct enum/type value if MediaCategory is an enum
    if (data[0].category !== MediaCategory.Avatar) {
      // Check if user has permission to create a role
      const canCreate = await checkUserPermission({
        action: "canCreate",
        entity: "media",
        user,
      });

      if (!canCreate) {
        return {
          statusCode: 403,
          success: false,
          message: "You do not have permission to upload media files",
          __typename: "BaseResponse",
        };
      }
    }

    // Create schema with context user.id for validation
    const UploadMediaFilesSchema = createUploadMediaFilesSchema(user.id);

    // Validate input data using Zod schema
    const validationResult = await UploadMediaFilesSchema.safeParseAsync(data);

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

    const dataWithCreatedBy = (validationResult.data as any[]).map(item => ({
      ...item,
      createdBy: user.id as any,
    }));
    const result = await uploadFiles(dataWithCreatedBy);

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
      message: "Media files uploaded successfully",
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
    console.error("Error during media upload:", error);

    return {
      statusCode: 500,
      success: false,
      message: `${CONFIG.NODE_ENV === "production"
        ? "Something went wrong, please try again."
        : error.message || "Internal server error"
        }`,
      __typename: "ErrorResponse",
    };
  }
};
