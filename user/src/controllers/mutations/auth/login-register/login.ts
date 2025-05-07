import { Repository } from 'typeorm';
import { Context } from '../../../../context';
import { User } from '../../../../entities/user.entity';
import {
  getLockoutKeyCacheKey,
  getLoginAttemptsKeyCacheKey,
  getSingleUserCacheKey,
  getSingleUserPermissionCacheKey,
  getUserEmailCacheKey,
  getUserSessionCacheKey,
} from '../../../../helper/redis/session-keys';
import { MutationLoginArgs, UserLoginResponseOrError } from '../../../../types';
import CompareInfo from '../../../../utils/bcrypt/compare-info';
import { loginSchema } from '../../../../utils/data-validation';
import EncodeToken from '../../../../utils/jwt/encode-token';

// Define the type for lockout session
interface LockoutSession {
  lockedAt: number; // Timestamp when the account was locked
  duration: number; // Duration in seconds for the lockout
}

/**
 * Logs a user into the system.
 *
 * Steps:
 * - Validates input using Zod schema
 * - Checks Redis for user data to optimize performance via caching
 * - Verifies the password and handles account lockout logic
 * - Generates and returns a JWT token upon successful login
 *
 * @param _ - Unused GraphQL parent argument
 * @param args - Login arguments (email, password)
 * @param context - GraphQL context with AppDataSource and Redis
 * @returns Promise<UserLoginResponseOrError> - Response status and message
 */
export const login = async (
  _: any,
  args: MutationLoginArgs,
  { redis, AppDataSource }: Context
): Promise<UserLoginResponseOrError> => {
  const { email, password } = args;
  const { getSession, setSession, deleteSession } = redis;

  try {
    // Validate input data using Zod schema
    const validationResult = await loginSchema.safeParseAsync({
      email,
      password,
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

    // Initialize repositories for User entity
    const userRepository: Repository<User> = AppDataSource.getRepository(User);

    // Check Redis for cached user's email
    let userEmail;

    let user;

    userEmail = await getSession(getUserEmailCacheKey(email));
    if (userEmail) {
      // Fetch user from database
      user = await userRepository.findOne({
        where: { email: userEmail },
        relations: ['role', 'permissions'],
      });

      if (!user) {
        return {
          statusCode: 400,
          success: false,
          message: `User not found with this email: ${userEmail}`,
          __typename: 'ErrorResponse',
        };
      }

      // Cache user, user email & permissions for curd in Redis with configurable TTL(default 30 days of redis session because of the env)
      await setSession(getSingleUserCacheKey(user.id), {
        id: user.id,
        email: user.email,
        firstName: user.firstName,
        lastName: user.lastName,
        role: user.role.name,
      });

      await setSession(getUserEmailCacheKey(email), user.email);

      await setSession(
        getSingleUserPermissionCacheKey(user.id),
        user.permissions
      );
    } else {
      // Cache missed: Fetch user from database
      user = await userRepository.findOne({
        where: { email },
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

      // Cache user, user email & permissions for curd in Redis with configurable TTL(default 30 days of redis session because of the env)
      await setSession(getSingleUserCacheKey(user.id), {
        id: user.id,
        email: user.email,
        firstName: user.firstName,
        lastName: user.lastName,
        role: user.role.name,
      });

      await setSession(getUserEmailCacheKey(email), user.email);

      await setSession(
        getSingleUserPermissionCacheKey(user.id),
        user.permissions
      );
    }

    // Account lock check using Redis session data
    const lockoutSession = await getSession(getLockoutKeyCacheKey(user.email));

    // Handle lockout state
    if (lockoutSession) {
      const { lockedAt, duration } = lockoutSession as LockoutSession; // Cast to LockoutSession type
      const timePassed = Math.floor((Date.now() - lockedAt) / 1000); // Time passed in seconds
      const timeLeft = duration - timePassed;

      if (timeLeft > 0) {
        // If lock time is remaining, return the time left
        const minutes = Math.floor(timeLeft / 60);
        const seconds = timeLeft % 60;
        return {
          statusCode: 400,
          success: false,
          message: `Account locked. Please try again after ${minutes}m ${seconds}s.`,
          __typename: 'ErrorResponse',
        };
      } else {
        // Clear cache and unlock the account if the lock time has expired
        await deleteSession(getLockoutKeyCacheKey(user.email));
      }
    }

    // Verify password
    const isPasswordValid = await CompareInfo(password, user.password);

    if (!isPasswordValid) {
      // Increment login attempt count
      const sessionData = (await getSession(
        getLoginAttemptsKeyCacheKey(user.email)
      )) as {
        attempts: number;
      } | null;
      const newAttempts = (sessionData?.attempts || 0) + 1;

      // Store updated attempts count in Redis with 1-hour TTL
      await setSession(
        getLoginAttemptsKeyCacheKey(user.email),
        { attempts: newAttempts },
        3600
      );

      // Lock account after 5 failed attempts
      if (newAttempts >= 5) {
        const lockDuration = 900; // 15 minutes in seconds
        await setSession(
          getLockoutKeyCacheKey(user.email),
          { locked: true, lockedAt: Date.now(), duration: lockDuration },
          lockDuration
        );
        return {
          statusCode: 400,
          success: false,
          message: 'Account locked. Please try again after 15 minutes.',
          __typename: 'ErrorResponse',
        };
      }

      return {
        statusCode: 400,
        success: false,
        message: 'Invalid password',
        __typename: 'ErrorResponse',
      };
    }

    // Clear cache login attempts after successful password verification
    await deleteSession(getLoginAttemptsKeyCacheKey(user.email));

    // Generate JWT token
    const token = await EncodeToken(
      user.id,
      user.email,
      user.firstName,
      user.lastName,
      user.role.name,
      '30d' // Set the token expiration time
    );

    // Create and store session
    const session = {
      id: user.id,
      email: user.email,
      firstName: user.firstName,
      lastName: user.lastName,
      role: user.role.name,
    };

    // Cache session in Redis with configurable TTL(default 30 days of redis session because of the env)
    await setSession(getUserSessionCacheKey(user.id), session);

    return {
      statusCode: 200,
      success: true,
      message: 'Login successful',
      token,
      __typename: 'UserLoginResponse',
    };
  } catch (error: any) {
    // Log the error for debugging purposes
    console.error('Error logging in user:', error);

    // Return a detailed error message if available, otherwise a generic one
    return {
      statusCode: 500,
      success: false,
      message: error.message || 'Internal server error',
      __typename: 'ErrorResponse',
    };
  }
};
