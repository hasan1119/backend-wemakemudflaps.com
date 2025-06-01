import CONFIG from "../../../../config/config";
import { Context } from "../../../../context";
import { setUserInfoByEmailInRedis } from "../../../../helper/redis";
import {
  BaseResponseOrError,
  MutationResetPasswordArgs,
} from "../../../../types";
import { resetPasswordSchema } from "../../../../utils/data-validation";
import {
  clearResetToken,
  getUserByPasswordResetToken,
  updateUserPasswordAndClearToken,
} from "../../../services";

/**
 * Handles user password reset using a provided token.
 *
 * Workflow:
 * 1. Validates input (token and newPassword) using Zod schema.
 * 2. Retrieves user data from the database using the provided reset token.
 * 3. Checks if the reset token is valid and not expired.
 * 4. Updates the user's password and clears the reset token and expiry.
 * 5. Caches updated user data in Redis for future requests.
 * 6. Returns a success response or error if validation, token, or update fails.
 *
 * @param _ - Unused parent parameter for GraphQL resolver.
 * @param args - Input arguments containing the reset token and new password.
 * @param __ - GraphQL context (unused here).
 * @returns A promise resolving to a BaseResponseOrError object containing status, message, and errors if applicable.
 */
export const resetPassword = async (
  _: any,
  args: MutationResetPasswordArgs,
  __: Context
): Promise<BaseResponseOrError> => {
  try {
    // Validate input data with Zod schema
    const validationResult = await resetPasswordSchema.safeParseAsync(args);

    // Return detailed validation errors if input is invalid
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

    const { token, newPassword } = validationResult.data;

    // Fetch user from database using the reset token
    const user = await getUserByPasswordResetToken(token);

    if (!user) {
      return {
        statusCode: 400,
        success: false,
        message: `User not found with this token: ${token} or has been deleted`,
        __typename: "ErrorResponse",
      };
    }

    // Verify if the reset token is still valid and not expired
    if (new Date(user.resetPasswordTokenExpiry) < new Date()) {
      // Clear expired token and related data
      await clearResetToken(user);

      return {
        statusCode: 400,
        success: false,
        message: "Password reset token has expired. Please try again.",
        __typename: "BaseResponse",
      };
    }

    // Update user's password and clear reset token
    const updatedUser = await updateUserPasswordAndClearToken(
      user,
      newPassword
    );

    // Cache updated user data in Redis
    await setUserInfoByEmailInRedis(updatedUser.email, updatedUser);

    return {
      statusCode: 200,
      success: true,
      message: "Password reset successfully",
      __typename: "BaseResponse",
    };
  } catch (error: any) {
    console.error("Reset password error:", error);

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
