import { Repository } from "typeorm";

import { Context } from "../../../context";
import { User } from "../../../entities/user.entity";
import {
  setUserInfoByEmailInRedis,
  setUserInfoByUserIdInRedis
} from "../../../helper/redis";
import {
  ActiveAccountResponseOrError,
  CachedUserSessionByEmailKeyInputs,
  MutationAccountActivationArgs,
  UserSession,
} from "../../../types";
import { idSchema } from "../../../utils/data-validation";

/**
 * Activates a user account using the user ID from the activation link.
 *
 * Steps:
 * - Validates input using Zod schema
 * - Checks Redis for user data to optimize performance via caching
 * - Checks if the user exists
 * - Verifies if the account is already activated
 * - Updates the user's isAccountActivated status
 * - Updates necessary user data in redis for future request
 *
 * @param _ - Unused GraphQL parent argument
 * @param args - Arguments for account activation (userId)
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

    // If validation fails, return detailed error messages with field names
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

    // Check user if exists.
    const user = await userRepository.findOne({
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

    // Initiate the empty variable for the user role
    let roleName;

    if (typeof user.role !== "string") {
      roleName = user.role.name; // Safe update
    } else {
      roleName = user.role; // Direct assignment
    }

    // Update Redis cache
    const userCacheData: UserSession = {
      id: user.id,
      email: user.email,
      firstName: user.firstName,
      lastName: user.lastName,
      role: roleName,
      gender: user.gender,
      emailVerified: true,
      isAccountActivated: true,
    };

    const userEmailCacheData: CachedUserSessionByEmailKeyInputs = {
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

    // Cache user for curd in Redis
    await Promise.all([
      setUserInfoByEmailInRedis(user.email, userEmailCacheData),
      setUserInfoByUserIdInRedis(user.id, userCacheData),
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
      message: error.message || "Internal server error",
      __typename: "ErrorResponse",
    };
  }
};
