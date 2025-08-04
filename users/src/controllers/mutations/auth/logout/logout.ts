import CONFIG from "../../../../config/config";
import { Context } from "../../../../context";
import { removeUserTokenInfoByUserSessionIdFromRedis } from "../../../../helper/redis";
import { BaseResponseOrError } from "../../../../types";
import { idSchema } from "../../../../utils/data-validation";
import {
  checkUserAuth,
  deleteUserLoginInfoSessionsByIds,
} from "../../../services";

/**
 * Handles user logout and cache management.
 *
 * Workflow:
 * 1. Verifies user authentication and retrieves user data from Redis.
 * 2. Clears user and role cache in Redis, enforcing re-login for changes.
 * 12. Returns a success response or error or logout fails.
 *
 * @param _ - Unused parent parameter for GraphQL resolver.
 * @param __ - Unused parent parameter for GraphQL arguments.
 * @param context - GraphQL context containing authenticated user information.
 * @returns A promise resolving to a BaseResponseOrError object containing status, message, and errors if applicable.
 */
export const logout = async (
  _: any,
  __: any,
  { user }: Context
): Promise<BaseResponseOrError> => {
  try {
    // Verify user authentication
    const authResponse = checkUserAuth(user);
    if (authResponse) return authResponse;

    const validationResult = await idSchema.safeParseAsync({
      id: user.sessionId,
    });

    if (!validationResult.success) {
      const errorMessages = validationResult.error.errors.map((error) => ({
        field: error.path.join("."), // Join path array to string for field identification
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

    // Delete the user login info from database
    await deleteUserLoginInfoSessionsByIds([user.sessionId]);

    await Promise.all([
      removeUserTokenInfoByUserSessionIdFromRedis(user.sessionId),
    ]);

    return {
      statusCode: 200,
      success: true,
      message: "Logout successful",
      __typename: "BaseResponse",
    };
  } catch (error: any) {
    console.error("Error logout in user:", error);

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
