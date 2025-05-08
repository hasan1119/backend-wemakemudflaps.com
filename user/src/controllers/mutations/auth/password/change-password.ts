import { Repository } from 'typeorm';
import { Context } from '../../../../context';
import { User } from '../../../../entities/user.entity';
import { getUserInfoByEmailCacheKey } from '../../../../helper/redis/session-keys';
import {
  BaseResponseOrError,
  MutationChangePasswordArgs,
} from '../../../../types';
import CompareInfo from '../../../../utils/bcrypt/compare-info';
import HashInfo from '../../../../utils/bcrypt/hash-info';
import { changePasswordSchema } from '../../../../utils/data-validation';

/**
 * Allows an authenticated user to change their password.
 *
 * Steps:
 * - Validates input using Zod schema
 * - Ensures the user is authenticated
 * - Verifies the old password
 * - Hashes the new password
 * - Updates the password in the database
 *
 * @param _ - Unused GraphQL parent argument
 * @param args - Arguments for change password (oldPassword and newPassword)
 * @param context - GraphQL context with AppDataSource, user info and redis
 * @returns Promise<BaseResponseOrError> - Response status and message
 */
export const changePassword = async (
  _: any,
  args: MutationChangePasswordArgs,
  { AppDataSource, user, redis }: Context
): Promise<BaseResponseOrError> => {
  const { oldPassword, newPassword } = args;
  const { getSession, setSession, deleteSession } = redis;

  try {
    // Validate input data using Zod schema for the change password operation
    const validationResult = await changePasswordSchema.safeParseAsync({
      oldPassword,
      newPassword,
    });

    // If validation fails, return detailed error messages with field names
    if (!validationResult.success) {
      const errorMessages = validationResult.error.errors.map((error) => ({
        field: error.path.join('.'), // Converts the path array to a string
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

    // Use the user from the context (already authenticated user)
    if (!user) {
      return {
        statusCode: 401,
        success: false,
        message: "You're not authenticated",
        __typename: 'BaseResponse',
      };
    }

    // Retrieve the user from the database (no need to fetch again if we already have it in context)
    const userRepository: Repository<User> = AppDataSource.getRepository(User);

    let userData;
    userData = await getSession(getUserInfoByEmailCacheKey(user.email));
    if (!userData) {
      // Fetch the full User entity for authenticated user
      userData = await userRepository.findOne({
        where: { email: user.email },
      });

      if (!userData) {
        return {
          statusCode: 404,
          success: false,
          message: 'Authenticated user not found in database',
          __typename: 'BaseResponse',
        };
      }
    }

    // Check if the old password matches the stored hashed password
    const isOldPasswordValid = await CompareInfo(
      oldPassword,
      userData.password
    );

    if (!isOldPasswordValid) {
      return {
        statusCode: 400,
        success: false,
        message: 'Old password is incorrect',
        __typename: 'BaseResponse',
      };
    }

    // Hash the new password for secure storage
    const hashedNewPassword = await HashInfo(newPassword);

    // Update the user's password in the database
    userData.password = hashedNewPassword;

    const updatedUserPassword = await userRepository.save(userData);

    // Cache user's info by email in Redis with configurable TTL(default 30 days of redis session because of the env)
    await setSession(getUserInfoByEmailCacheKey(updatedUserPassword.email), {
      id: updatedUserPassword.id,
      firstName: updatedUserPassword.firstName,
      lastName: updatedUserPassword.lastName,
      email: updatedUserPassword.email,
      password: updatedUserPassword.password,
      gender: updatedUserPassword.gender,
      role: updatedUserPassword.role.name,
      resetPasswordToken: updatedUserPassword.resetPasswordTokenExpiry,
      emailVerified: updatedUserPassword.emailVerified,
      isAccountActivated: updatedUserPassword.isAccountActivated,
      resetPasswordTokenExpiry: updatedUserPassword.resetPasswordTokenExpiry,
    });

    // Return success response
    return {
      statusCode: 200,
      success: true,
      message: 'Password changed successfully',
      __typename: 'BaseResponse',
    };
  } catch (error: any) {
    // Log the error for debugging purposes
    console.error('Error changing password:', error);

    // Return a detailed error message if available, otherwise a generic one
    return {
      statusCode: 500,
      success: false,
      message: error.message || 'Internal server error',
      __typename: 'BaseResponse',
    };
  }
};
