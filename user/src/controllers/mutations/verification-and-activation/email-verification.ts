import { Repository } from 'typeorm';
import { Context } from '../../../../context';
import { User } from '../../../../entities/user.entity';
import {
  getSingleUserCacheKey,
  getUserInfoByEmailCacheKey,
} from '../../../../helper/redis/session-keys';
import { BaseResponseOrError, MutationEmailVerificationArgs } from '../../../../types';
import { idSchema } from '../../../utils/data-validation';

/**
 * Verifies a user's email using the user ID from the verification link.
 *
 * Steps:
 * - Validates the user ID
 * - Checks if the user exists
 * - Verifies if the email is already verified
 * - Updates the user's emailVerified status
 * - Updates Redis cache with the new user data
 *
 * @param _ - Unused GraphQL parent argument
 * @param args - Verification arguments (userId)
 * @param context - GraphQL context with AppDataSource and Redis
 * @returns Promise<BaseResponseOrError> - Response status and message
 */
export const verifyEmail = async (
  _: any,
  args: MutationEmailVerificationArgs,
  { AppDataSource, redis }: Context
): Promise<BaseResponseOrError> => {
  const { userId } = args;
  const { getSession, setSession, deleteSession } = redis;

  try {
    // Validate input data using Zod schema
    const validationResult = await idSchema.safeParseAsync({
      id: userId,
    });

    // If validation fails, return detailed error messages
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

    // Initialize user repository
    const userRepository: Repository<User> = AppDataSource.getRepository(User);

    // Check if user exists
    const user = await userRepository.findOne({
      where: { id: userId },
      relations: ['role'],
    });

    if (!user) {
      return {
        statusCode: 404,
        success: false,
        message: 'User not found',
        __typename: 'BaseResponse',
      };
    }

    // Check if email is already verified
    if (user.emailVerified) {
      return {
        statusCode: 400,
        success: false,
        message: 'Email is already verified',
        __typename: 'BaseResponse',
      };
    }

    // Update user email verification status
    user.emailVerified = true;
    const updatedUser = await userRepository.save(user);

    // Update Redis cache
    const userCacheData = {
      id: updatedUser.id,
      email: updatedUser.email,
      firstName: updatedUser.firstName,
      lastName: updatedUser.lastName,
      role: updatedUser.role.name,
    };

    const userEmailCacheData = {
      id: updatedUser.id,
      email: updatedUser.email,
      firstName: updatedUser.firstName,
      lastName: updatedUser.lastName,
      password: updatedUser.password,
      gender: updatedUser.gender,
      role: updatedUser.role.name,
      resetPasswordToken: updatedUser.resetPasswordToken,
      emailVerified: updatedUser.emailVerified,
      isAccountActivated: updatedUser.isAccountActivated,
      resetPasswordTokenExpiry: updatedUser.resetPasswordTokenExpiry,
    };

    // Cache user in Redis with configurable TTL (default 30 days of redis session because of the env)
    await setSession(getSingleUserCacheKey(updatedUser.id), userCacheData);
    await setSession(getUserInfoByEmailCacheKey(updatedUser.email), userEmailCacheData);

    return {
      statusCode: 200,
      success: true,
      message: 'Email verified successfully',
      __typename: 'BaseResponse',
    };
  } catch (error: any) {
    console.error('Error verifying email:', error);
    return {
      statusCode: 500,
      success: false,
      message: error.message || 'Internal server error',
      __typename: 'BaseResponse',
    };
  }
};