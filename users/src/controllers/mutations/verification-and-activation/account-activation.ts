import { Repository } from "typeorm";

import CONFIG from "../../../config/config";
import { Context } from "../../../context";
import { User } from "../../../entities/user.entity";
import {
  getUserInfoByEmailInRedis,
  setUserInfoByEmailInRedis,
  setUserInfoByUserIdInRedis,
} from "../../../helper/redis";
import {
  ActiveAccountResponseOrError,
  CachedUserSessionByEmailKeyInputs,
  MutationAccountActivationArgs,
  UserSession,
} from "../../../types";
import { emailSchema, idSchema } from "../../../utils/data-validation";

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
  const { userId, email } = args;

  try {
    // Validate input data using Zod schema
    const [idResult, emailResult] = await Promise.all([
      idSchema.safeParseAsync({ id: userId }),
      emailSchema.safeParseAsync({ email }),
    ]);

    if (!idResult.success || !emailResult.success) {
      const errors = [
        ...(idResult.error?.errors || []),
        ...(emailResult.error?.errors || []),
      ].map((e) => ({
        field: e.path.join("."),
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

    // Initialize user repository
    const userRepository: Repository<User> = AppDataSource.getRepository(User);

    // Check Redis for cached user's data
    let user;

    user = await getUserInfoByEmailInRedis(email);

    if (!user) {
      // Cache miss: Fetch user from database
      user = await userRepository.findOne({
        where: { id: userId, email, deletedAt: null },
        relations: ["role"],
        select: {
          id: true,
          firstName: true,
          lastName: true,
          email: true,
          emailVerified: true,
          gender: true,
          role: {
            name: true,
          },
          password: true,
          isAccountActivated: true,
          tempUpdatedEmail: true,
          tempEmailVerified: true,
        },
      });

      if (!user) {
        return {
          statusCode: 404,
          success: false,
          message: "Authenticated user not found in database",
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
      { id: user.id },
      { isAccountActivated: true, emailVerified: true }
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
      firstName: user.firstName,
      lastName: user.lastName,
      email: user.email,
      gender: user.gender,
      role: roleName,
      emailVerified: true,
      isAccountActivated: true,
    };

    const userEmailCacheData: CachedUserSessionByEmailKeyInputs = {
      id: user.id,
      firstName: user.firstName,
      lastName: user.lastName,
      email: user.email,
      emailVerified: true,
      gender: user.gender,
      role: roleName,
      password: user.password,
      isAccountActivated: true,
      tempUpdatedEmail: user.tempUpdatedEmail,
      tempEmailVerified: user.tempEmailVerified,
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
      message: `${
        CONFIG.NODE_ENV === "production"
          ? "Something went wrong, please try again."
          : error.message || "Internal server error"
      }`,
      __typename: "ErrorResponse",
    };
  }
};
