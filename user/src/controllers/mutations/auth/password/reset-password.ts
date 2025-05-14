import { Repository } from "typeorm";
import { Context } from "../../../../context";
import { User } from "../../../../entities/user.entity";
import { setUserInfoByEmailInRedis } from "../../../../helper/redis";
import {
  BaseResponseOrError,
  CachedUserSessionByEmailKeyInputs,
  MutationResetPasswordArgs,
} from "../../../../types";
import HashInfo from "../../../../utils/bcrypt/hash-info";
import { resetPasswordSchema } from "../../../../utils/data-validation";

/**
 * Handles resetting the user's password using a token.
 *
 * Steps:
 * - Validates input using Zod schema
 * - Finds the user with the given token
 * - Validates token expiry
 * - Hashes the new password and updates the user's password
 * - Clears the reset token and expiry after successful update
 * - Updates necessary user data in redis for future request
 *
 * @param _ - Unused GraphQL parent argument
 * @param args - Arguments for reset password request (token and newPassword)
 * @param context - GraphQL context with AppDataSource
 * @returns Promise<BaseResponseOrError> - Response status and message
 */
export const resetPassword = async (
  _: any,
  args: MutationResetPasswordArgs,
  { AppDataSource }: Context
): Promise<BaseResponseOrError> => {
  const { token, newPassword } = args;

  const userRepository: Repository<User> = AppDataSource.getRepository(User);

  try {
    const validationResult = await resetPasswordSchema.safeParseAsync({
      token,
      newPassword,
    });

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

    // Fetch user from database
    const user = await userRepository.findOne({
      where: { resetPasswordToken: token },
      relations: ["role"],
    });

    if (!user) {
      return {
        statusCode: 400,
        success: false,
        message: `User not found with this token: ${token}`,
        __typename: "ErrorResponse",
      };
    }

    if (!user || !user.resetPasswordTokenExpiry) {
      return {
        statusCode: 400,
        success: false,
        message: "Invalid or expired password reset token",
        __typename: "BaseResponse",
      };
    }

    const isExpired = new Date(user.resetPasswordTokenExpiry) < new Date();

    if (isExpired) {
      // Optionally: clear expired token
      user.resetPasswordToken = null;
      user.resetPasswordTokenExpiry = null;

      await userRepository.save(user);

      return {
        statusCode: 400,
        success: false,
        message: "Password reset token has expired",
        __typename: "BaseResponse",
      };
    }

    const hashedPassword = await HashInfo(newPassword);

    user.password = hashedPassword;
    user.resetPasswordToken = null;
    user.resetPasswordTokenExpiry = null;

    const updatedUser = await userRepository.save(user);

    const userSessionByEmail: CachedUserSessionByEmailKeyInputs = {
      id: updatedUser.id,
      firstName: updatedUser.firstName,
      lastName: updatedUser.lastName,
      email: updatedUser.email,
      password: updatedUser.password,
      gender: updatedUser.gender,
      role: updatedUser.role.name,
      emailVerified: updatedUser.emailVerified,
      isAccountActivated: updatedUser.isAccountActivated,
    };

    // Cache user in Redis
    await setUserInfoByEmailInRedis(updatedUser.email, userSessionByEmail);

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
      message: "Failed to reset password",
      __typename: "BaseResponse",
    };
  }
};
