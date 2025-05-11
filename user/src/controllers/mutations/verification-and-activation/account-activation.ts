import { Repository } from "typeorm";

import { Context } from "../../../context";
import { User } from "../../../entities/user.entity";
import {
  getUserInfoByUserIdFromRedis,
  setUserInfoByEmailInRedis,
  setUserInfoByUserIdInRedis,
} from "../../../helper/redis/user/user-session-manage";
import {
  ActiveAccountResponseOrError,
  MutationAccountActivationArgs,
} from "../../../types";
import { idSchema } from "../../../utils/data-validation";

/**
 * Activates a user account using the user ID from the activation link.
 *
 * Steps:
 * - Validates the user ID
 * - Checks if the user exists
 * - Verifies if the account is already activated
 * - Updates the user's isAccountActivated status
 * - Updates Redis cache with the new user data
 *
 * @param _ - Unused GraphQL parent argument
 * @param args - Activation arguments (userId)
 * @param context - GraphQL context with AppDataSource
 * @returns Promise<ActiveAccountResponseOrError> - Response status and message
 */
export const accountActivation = async (
  _: any,
  args: MutationAccountActivationArgs,
  { AppDataSource }: Context
): Promise<ActiveAccountResponseOrError> => {
  const { userId } = args;

  try {
    // Validate input data using Zod schema
    const validationResult = await idSchema.safeParseAsync({
      id: userId,
    });

    // If validation fails, return detailed error messages
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

    // Initialize user repository
    const userRepository: Repository<User> = AppDataSource.getRepository(User);

    // Check Redis for cached user's data
    let user;

    user = await getUserInfoByUserIdFromRedis(userId);

    if (!user) {
      // Check if user exists
      user = await userRepository.findOne({
        where: { id: userId },
        relations: ["role"],
      });

      if (!user) {
        return {
          statusCode: 404,
          success: false,
          message: "User not found",
          __typename: "ErrorResponse",
        };
      }
    }

    // Check if account is already activated
    if (user.isAccountActivated) {
      return {
        statusCode: 400,
        success: false,
        message: "Account is already activated",
        __typename: "ErrorResponse",
      };
    }

    // Update user account activation status
    await userRepository.update(
      { id: userId },
      {
        isAccountActivated: true,
        emailVerified: true,
      }
    );

    const roleName =
      typeof user.role === "string"
        ? user.role
        : (user.role as { name: string }).name;

    // Update Redis cache
    const userCacheData = {
      id: user.id,
      email: user.email,
      firstName: user.firstName,
      lastName: user.lastName,
      role: roleName,
      gender: user.gender,
      emailVerified: true,
      isAccountActivated: true,
    };

    const userEmailCacheData = {
      id: user.id,
      email: user.email,
      firstName: user.firstName,
      lastName: user.lastName,
      password: user.password,
      role: roleName,
      gender: user.gender,
      emailVerified: true,
      isAccountActivated: true,
    };

    // Cache user in Redis with configurable TTL(default 30 days of redis session because of the env)
    await setUserInfoByUserIdInRedis(user.id, userCacheData);
    await setUserInfoByEmailInRedis(user.email, userEmailCacheData);

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
      message: error.message || "Internal server error",
      __typename: "ErrorResponse",
    };
  }
};
