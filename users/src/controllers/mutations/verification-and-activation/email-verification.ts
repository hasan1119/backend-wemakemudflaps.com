import { Repository } from "typeorm";
import { Context } from "../../../context";
import { User } from "../../../entities/user.entity";
import {
  getUserInfoByEmailInRedis,
  removeUserEmailFromRedis,
  removeUserInfoByEmailFromRedis,
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
import { emailSchema, idSchema } from "../../../utils/data-validation";
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
        where: { id: userId, tempUpdatedEmail: email },
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

    // Store the old email for Redis cleanup
    const oldEmail = user.email;

    // Check if there’s a pending email to verify
    if (!user.tempUpdatedEmail) {
      return {
        statusCode: 400,
        success: false,
        message: "Invalid email to verify",
        __typename: "EmailVerificationResponse",
      };
    }

    // Update user with verified email
    const updateResult = await userRepository.update(
      { id: userId, tempUpdatedEmail: user.tempUpdatedEmail },
      {
        email: user.tempUpdatedEmail,
        tempUpdatedEmail: null,
        tempEmailVerified: null,
      }
    );

    // Check if the update was successful
    if (updateResult.affected !== 1) {
      return {
        statusCode: 500,
        success: false,
        message: "Failed to update email verification status",
        __typename: "ErrorResponse",
      };
    }

    // Fetch updated user to ensure correct data
    const updatedUser = await userRepository.findOne({
      where: { id: userId },
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

    // Regenerate JWT token with updated email
    const token = await EncodeToken(
      updatedUser.id,
      updatedUser.firstName,
      updatedUser.lastName,
      updatedUser.email,
      updatedUser.gender,
      updatedUser.role.name,
      updatedUser.emailVerified,
      updatedUser.isAccountActivated,
      "30d"
    );

    // Create session and cache data
    const userSession: UserSession = {
      id: updatedUser.id,
      firstName: updatedUser.firstName,
      lastName: updatedUser.lastName,
      email: updatedUser.email,
      gender: updatedUser.gender,
      role: updatedUser.role.name,
      emailVerified: updatedUser.emailVerified,
      isAccountActivated: updatedUser.isAccountActivated,
    };

    const userEmailSession: CachedUserSessionByEmailKeyInputs = {
      id: updatedUser.id,
      firstName: updatedUser.firstName,
      lastName: updatedUser.lastName,
      email: updatedUser.email,
      emailVerified: updatedUser.emailVerified,
      gender: updatedUser.gender,
      role: updatedUser.role.name,
      password: updatedUser.password,
      isAccountActivated: updatedUser.isAccountActivated,
      tempUpdatedEmail: updatedUser.tempUpdatedEmail,
      tempEmailVerified: updatedUser.tempEmailVerified,
    };

    // Update cache with new email and remove old email in Redis with configurable TTL(30 days = 25920000)
    await Promise.all([
      setUserTokenInfoByUserIdInRedis(userId, userSession, 2592000),
      setUserInfoByUserIdInRedis(userId, userSession),
      setUserInfoByEmailInRedis(updatedUser.email, userEmailSession),

      removeUserInfoByEmailFromRedis(oldEmail),
      removeUserEmailFromRedis(oldEmail),
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
