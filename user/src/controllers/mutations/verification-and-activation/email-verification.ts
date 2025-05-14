import { Repository } from "typeorm";
import { Context } from "../../../context";
import { User } from "../../../entities/user.entity";
import {
  getUserInfoByUserIdFromRedis,
  setUserInfoByEmailInRedis,
  setUserInfoByUserIdInRedis,
  setUserTokenInfoByUserIdInRedis,
} from "../../../helper/redis";
import {
  CachedUserSessionByEmailKeyInputs,
  EmailVerificationResponseOrError,
  MutationVerifyEmailArgs,
  UserSession,
} from "../../../types";
import { idSchema } from "../../../utils/data-validation";
import EncodeToken from "../../../utils/jwt/encode-token";

/**
 * Verifies a user's email using the user ID from the verification link.
 *
 * Steps:
 * - Validates input using Zod schema
 * - Checks if the user exists
 * - Verifies if the email is already verified
 * - Updates the user's emailVerified status
 * - Updates necessary user data in redis for future request
 *
 * @param _ - Unused GraphQL parent argument
 * @param args - Arguments for email verification (userId)
 * @param context - GraphQL context with AppDataSource
 * @returns Promise<EmailVerificationResponseOrError> - Response status and message
 */
export const verifyEmail = async (
  _: any,
  args: MutationVerifyEmailArgs,
  { AppDataSource }: Context
): Promise<EmailVerificationResponseOrError> => {
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
      // Cache miss: Fetch user from database
      user = await userRepository.findOne({
        where: { id: userId },
        relations: ["role"],
      });

      if (!user) {
        return {
          statusCode: 400,
          success: false,
          message: `User not found with this id: ${userId}`,
          __typename: "ErrorResponse",
        };
      }
    }

    // Check if email is already verified
    if (user.emailVerified) {
      return {
        statusCode: 400,
        success: false,
        message: "Email is already verified",
        __typename: "EmailVerificationResponse",
      };
    }

    // Update user email verification status
    user.emailVerified = true;

    const updatedUser = await userRepository.update(
      { id: userId },
      {
        emailVerified: true,
      }
    );

    // Check if the update affected any rows
    if (updatedUser.affected !== 1) {
      return {
        statusCode: 500,
        success: false,
        message: "Failed to update user verification status",
        __typename: "ErrorResponse",
      };
    }

    // Regenerate the JWT token after the update
    const token = await EncodeToken(
      user.id,
      user.email,
      user.firstName,
      user.lastName,
      user.role.name,
      user.gender,
      true,
      user.isAccountActivated,
      "30d" // Set the token expiration time
    );

    // Update Redis cache
    const userCacheData: UserSession = {
      id: user.id,
      email: user.email,
      firstName: user.firstName,
      lastName: user.lastName,
      role: user.role.name,
      gender: user.gender,
      emailVerified: true,
      isAccountActivated: user.isAccountActivated,
    };

    const userEmailCacheData: CachedUserSessionByEmailKeyInputs = {
      id: user.id,
      email: user.email,
      firstName: user.firstName,
      lastName: user.lastName,
      role: user.role.name,
      gender: user.gender,
      emailVerified: true,
      isAccountActivated: user.isAccountActivated,
      password: user.password,
    };

    // Cache user for curd in Redis with configurable TTL(30 days = 25920000)
    await Promise.all([
      await setUserTokenInfoByUserIdInRedis(userId, userCacheData, 25920000),
      await setUserInfoByUserIdInRedis(userId, userCacheData),
      await setUserInfoByEmailInRedis(user.email, userEmailCacheData),
    ]);

    return {
      statusCode: 200,
      success: true,
      token,
      message: "Email verified successfully",
      __typename: "EmailVerificationResponse",
    };
  } catch (error: any) {
    console.error("Error verifying email:", error);

    return {
      statusCode: 500,
      success: false,
      message: error.message || "Internal server error",
      __typename: "ErrorResponse",
    };
  }
};
