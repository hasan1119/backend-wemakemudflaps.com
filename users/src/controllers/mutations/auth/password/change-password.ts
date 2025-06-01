import CONFIG from "../../../../config/config";
import { Context } from "../../../../context";
import {
  getUserInfoByEmailFromRedis,
  setUserInfoByEmailInRedis,
} from "../../../../helper/redis";
import {
  BaseResponseOrError,
  MutationChangePasswordArgs,
} from "../../../../types";
import CompareInfo from "../../../../utils/bcrypt/compare-info";
import { changePasswordSchema } from "../../../../utils/data-validation";
import { checkUserAuth, updateUserPassword } from "../../../services";

/**
 * Handles password change functionality for an authenticated user.
 *
 * Workflow:
 * 1. Verifies user authentication using provided context.
 * 2. Validates input (oldPassword and newPassword) using Zod schema.
 * 3. Retrieves cached user data from Redis to optimize performance.
 * 4. Compares provided old password with stored hashed password.
 * 5. Updates the user's password in the database if old password is valid.
 * 6. Caches updated user data in Redis for future requests.
 * 7. Returns success response or error if validation, authentication, or password update fails.
 *
 * @param _ - Unused parent parameter for GraphQL resolver.
 * @param args - Input arguments containing oldPassword and newPassword.
 * @param context - GraphQL context containing authenticated user information.
 * @returns A promise resolving to a BaseResponseOrError object containing status, message, and errors if applicable.
 */
export const changePassword = async (
  _: any,
  args: MutationChangePasswordArgs,
  { user }: Context
): Promise<BaseResponseOrError> => {
  try {
    // Verify user authentication status
    const authResponse = checkUserAuth(user);
    if (authResponse) return authResponse;

    // Validate input data with Zod schema
    const validationResult = await changePasswordSchema.safeParseAsync(args);

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

    const { oldPassword, newPassword } = validationResult.data;

    // Attempt to retrieve cached user data from Redis
    const userData = await getUserInfoByEmailFromRedis(user.email);

    // Verify the provided old password against the stored hash
    const isOldPasswordValid = await CompareInfo(
      oldPassword,
      userData.password
    );

    if (!isOldPasswordValid) {
      return {
        statusCode: 400,
        success: false,
        message: "Old password is incorrect",
        __typename: "BaseResponse",
      };
    }

    // Update the user's password in the database
    const result = await updateUserPassword({
      userId: userData.id,
      newPassword,
    });

    // Cache updated user data in Redis
    await setUserInfoByEmailInRedis(user.email, result);

    return {
      statusCode: 200,
      success: true,
      message: "Password changed successfully",
      __typename: "BaseResponse",
    };
  } catch (error: any) {
    console.error("Error changing password:", error);

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
