import CONFIG from "../../../config/config";
import { Context } from "../../../context";
import {
  BaseResponseOrError,
  MutationRestoreMediaFilesArgs,
} from "../../../types";
import { idsSchema } from "../../../utils/data-validation";
import {
  checkUserAuth,
  checkUserPermission,
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

    // Restore soft-deleted roles
    await restoreMedia(ids);

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
