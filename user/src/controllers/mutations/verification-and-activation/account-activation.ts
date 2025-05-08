import { Repository } from 'typeorm';
import { Context } from '../../../../context';
import { User } from '../../../../entities/user.entity';
import {
  getSingleUserCacheKey,
  getUserInfoByEmailCacheKey,
} from '../../../../helper/redis/session-keys';
import { BaseResponseOrError, MutationAccountActivationArgs } from '../../../../types';
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
 * @param context - GraphQL context with AppDataSource and Redis
 * @returns Promise<BaseResponseOrError> - Response status and message
 */
export const activateAccount = async (
  _: any,
  args: MutationAccountActivationAgrs,
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

    // Check if user exists
    const user = await userRepository.findOne({
      where: { id: userId },
      relations: ['role']
    });

    if (!user) {
      return {
        statusCode: 404,
        success: false,
        message: 'User not found',
        __typename: 'BaseResponse',
      };
    }

    // Check if account is already activated
    if (user.isAccountActivated) {
      return {
        statusCode: 400,
        success: false,
        message: 'Account is already activated',
        __typename: 'BaseResponse',
      };
    }

    // Update user account activation status
    user.isAccountActivated = true;
    user.emailVerified = true; // Optionally verify email as part of activation
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

   
  // Cache user in Redis with configurable TTL(default 30 days of redis session because of the env)
    await setSession(getSingleUserCacheKey(updatedUser.id), userCacheData);
    await setSession(getUserInfoByEmailCacheKey(updatedUser.email), userEmailCacheData);

    return {
      statusCode: 200,
      success: true,
      message: 'Account activated successfully',
      __typename: 'BaseResponse',
    };
  } catch (error: any) {
    console.error('Error activating account:', error);
    return {
      statusCode: 500,
      success: false,
      message: error.message || 'Internal server error',
      __typename: 'BaseResponse',
    };
  }
};