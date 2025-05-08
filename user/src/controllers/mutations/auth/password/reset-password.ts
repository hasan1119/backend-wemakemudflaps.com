import { Repository } from 'typeorm';
import { Context } from '../../../../context';
import { User } from '../../../../entities/user.entity';
import {
  BaseResponseOrError,
  MutationResetPasswordArgs,
} from '../../../../types';
import HashInfo from '../../../../utils/bcrypt/hash-info';
import { resetPasswordSchema } from '../../../../utils/data-validation';
import { getUserInfoByEmailCacheKey } from '../../../../helper/redis/session-keys';

/**
 * Handles resetting the user's password using a token.
 *
 * Steps:
 * - Validates input using Zod schema
 * - Finds the user with the given token
 * - Validates token expiry
 * - Hashes the new password and updates the user's password
 * - Clears the reset token and expiry after successful update
 *
 * @returns Promise<BaseResponseOrError> - Response status and message
 */
export const resetPassword = async (
  _: any,
  args: MutationResetPasswordArgs,
  { AppDataSource, redis }: Context
): Promise<BaseResponseOrError> => {
  const { token, newPassword } = args;
  const { getSession, setSession } = redis;

  const userRepository: Repository<User> = AppDataSource.getRepository(User);

  try {
    const validationResult = await resetPasswordSchema.safeParseAsync({
      token,
      newPassword,
    });

    if (!validationResult.success) {
      const errorMessages = validationResult.error.errors.map((error) => ({
        field: error.path.join('.'),
        message: error.message,
      }));

      return {
        statusCode: 400,
        success: false,
        message: 'Validation failed',
        errors: errorMessages,
        __typename: 'ErrorResponse',
      };
    }

    // Check Redis for cached user's data
    let user;

    user = await getSession(getUserInfoByEmailCacheKey(email));

    if (!user) {
      // Fetch user from database
      user = await userRepository.findOne({
        where: { email: email },
        relations: ['role', 'permissions'],
      });

      if (!user) {
        return {
          statusCode: 400,
          success: false,
          message: `User not found with this email: ${email}`,
          __typename: 'ErrorResponse',
        };
    }

    if (!user || !user.resetPasswordTokenExpiry) {
      return {
        statusCode: 400,
        success: false,
        message: 'Invalid or expired password reset token',
        __typename: 'BaseResponse',
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
        message: 'Password reset token has expired',
        __typename: 'BaseResponse',
      };
    }

    const hashedPassword = await HashInfo(newPassword);

    user.password = hashedPassword;
    user.resetPasswordToken = null;
    user.resetPasswordTokenExpiry = null;

    const updatedUser = await userRepository.save(user);

    await setSession(getUserInfoByEmailCacheKey(updatedUser.email), {
      id: updatedUser.id,
      firstName: updatedUser.firstName,
      lastName: updatedUser.lastName,
      email: updatedUser.email,
      password: updatedUser.password,
      gender: updatedUser.gender,
      role: updatedUser.role.name,
      resetPasswordToken: updatedUser.resetPasswordToken,
      resetPasswordTokenExpiry: updatedUser.resetPasswordTokenExpiry,
      emailVerified: updatedUser.emailVerified,
      isAccountActivated: updatedUser.isAccountActivated,
    });

    return {
      statusCode: 200,
      success: true,
      message: 'Password reset successfully',
      __typename: 'BaseResponse',
    };
  } catch (error: any) {
    console.error('Reset password error:', error);
    return {
      statusCode: 500,
      success: false,
      message: 'Failed to reset password',
      __typename: 'BaseResponse',
    };
  }
};