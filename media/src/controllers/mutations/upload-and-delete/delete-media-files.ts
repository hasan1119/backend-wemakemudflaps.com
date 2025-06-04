import CONFIG from "../../../config/config";
import { Context } from "../../../context";
import {
  getUserInfoByEmailFromRedis,
  removeMediaByMediaIdFromRedis,
  setMediaByMediaIdInRedis,
} from "../../../helper/redis";
import {
  BaseResponseOrError,
  MutationDeleteMediaFilesArgs,
} from "../../../types";
import CompareInfo from "../../../utils/bcrypt/compare-info";
import { idsSchema, skipTrashSchema } from "../../../utils/data-validation";
import { checkUserPermission } from "../../services";
import { checkUserAuth } from "../../services/session-check/session-check";
import {
  deleteMediaFiles as deleteFiles,
  deleteSoftMedia,
} from "../../services/upload-and-delete/upload-and-delete-media-files";

/**
 * Handles soft or hard deletion of media files based on skipTrash flag.
 *
 * Workflow:
 * 1. Verifies user authentication and permission to delete medias.
 * 2. Validates input IDs and skipTrash flag using Zod schemas.
 * 3. Checks user permissions to delete media.
 * 4. If not a SUPER ADMIN, requires and verifies password.
 * 5. Soft deletes (moves to trash) or permanently deletes media files and clear/update the redis entities.
 * 6. Returns success or error response.
 *
 * @param _ - Unused parent resolver parameter.
 * @param args - Contains media IDs, skipTrash flag, and optionally password.
 * @param context - GraphQL context including the authenticated user.
 * @returns A promise resolving to a BaseResponseOrError object containing status, message, and errors if applicable.
 */
export const deleteMediaFiles = async (
  _: any,
  args: MutationDeleteMediaFilesArgs,
  { user }: Context
): Promise<BaseResponseOrError> => {
  try {
    // Check user authentication
    const authResponse = checkUserAuth(user);
    if (authResponse) return authResponse;

    const userData = await getUserInfoByEmailFromRedis(user.email);

    const hasPermission = await checkUserPermission({
      action: "canDelete",
      entity: "media",
      user,
    });

    if (!hasPermission) {
      return {
        statusCode: 403,
        success: false,
        message: "You do not have permission to delete media(s)",
        __typename: "BaseResponse",
      };
    }

    const { ids, skipTrash, password } = args;

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

    const isNotSuperAdmin = !user.roles.includes("SUPER ADMIN");

    // Validate password for non-Super Admin users
    if (isNotSuperAdmin) {
      if (!password) {
        return {
          statusCode: 400,
          success: false,
          message: "Password is required for non-SUPER ADMIN users",
          __typename: "BaseResponse",
        };
      }

      // Verify provided password
      const isPasswordValid = await CompareInfo(password, userData.password);
      if (!isPasswordValid) {
        return {
          statusCode: 403,
          success: false,
          message: "Invalid password",
          __typename: "BaseResponse",
        };
      }
    }

    // Perform soft or hard deletion based on skipTrash
    if (skipTrash) {
      await deleteFiles(ids);

      // Clear media-related cache entries in Redis
      await Promise.all(ids.map((id) => removeMediaByMediaIdFromRedis(id)));
    } else {
      const result = await deleteSoftMedia(ids);

      // Update media-related cache entities update cache
      await Promise.all(
        result.map((media) =>
          setMediaByMediaIdInRedis(media.id, {
            ...media,
            createdBy: media.createdBy as any,
            createdAt: media.createdAt.toISOString(),
            deletedAt: media.deletedAt ? media.deletedAt.toISOString() : null,
          })
        )
      );
    }

    return {
      statusCode: 200,
      success: true,
      message: `${
        skipTrash ? "Media(s) permanently deleted" : "Media(s) moved to trash"
      } successfully`,
      __typename: "BaseResponse",
    };
  } catch (error: any) {
    console.error("Error during media upload:", error);

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
