import CONFIG from "../../../config/config";
import { Context } from "../../../context";
import {
  getUserInfoByEmailFromRedis,
  setUserInfoByEmailInRedis,
  setUserInfoByUserIdInRedis,
} from "../../../helper/redis";
import {
  ActiveAccountResponseOrError,
  MutationAccountActivationArgs,
} from "../../../types";
import { emailSchema, idSchema } from "../../../utils/data-validation";
import { activateUserAccount, getUserByEmail } from "../../services";

/**
 * Handles the activation of a user account using a provided user ID and email.
 *
 * Workflow:
 * 1. Validates input (userId and email) using Zod schemas.
 * 2. Retrieves user data from Redis for performance optimization.
 * 3. Fetches user data from the database if not found in Redis.
 * 4. Verifies user existence and checks if the account is already activated.
 * 5. Updates the user's account activation status in the database.
 * 6. Caches updated user data in Redis for future requests.
 * 7. Returns a success response or error if validation, user lookup, or activation fails.
 *
 * @param _ - Unused parent parameter for GraphQL resolver.
 * @param args - Input arguments containing userId and email for account activation.
 * @param __ - GraphQL context (unused here).
 * @returns A promise resolving to an ActiveAccountResponseOrError object containing status, message, and errors if applicable.
 */
export const accountActivation = async (
  _: any,
  args: MutationAccountActivationArgs,
  __: Context
): Promise<ActiveAccountResponseOrError> => {
  try {
    const { userId, email } = args;

    // Validate input data with Zod schemas
    const [idResult, emailResult] = await Promise.all([
      idSchema.safeParseAsync({ id: userId }),
      emailSchema.safeParseAsync({ email }),
    ]);

    // Return detailed validation errors if input is invalid
    if (!idResult.success || !emailResult.success) {
      const errors = [
        ...(idResult.error?.errors || []),
        ...(emailResult.error?.errors || []),
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

    // Attempt to retrieve cached user data from Redis
    let user;

    user = await getUserInfoByEmailFromRedis(email);

    if (!user) {
      // On cache miss, fetch user data from database
      user = await getUserByEmail(email);

      if (!user) {
        return {
          statusCode: 404,
          success: false,
          message:
            "User not found in database with this associate with this activation link",
          __typename: "ErrorResponse",
        };
      }
    }

    // Verify if account is already activated
    if (user.isAccountActivated) {
      return {
        statusCode: 400,
        success: false,
        message: "Account is already activated",
        __typename: "ErrorResponse",
      };
    }

    // Activate user account in the database
    const updatedUser = await activateUserAccount(user.id);

    // Cache updated user data in Redis
    await Promise.all([
      setUserInfoByUserIdInRedis(user.id, updatedUser),
      setUserInfoByEmailInRedis(user.email, updatedUser),
    ]);

    return {
      statusCode: 200,
      success: true,
      message: "Account activated successfully",
      __typename: "BaseResponse",
    };
  } catch (error: any) {
    console.error("Error activating account:", error);

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
