import { Repository } from "typeorm";
import { Context } from "../../../../context";
import { User } from "../../../../entities/user.entity";
import {
  getlockoutKeyCacheKey,
  getloginAttemptsKeyCacheKey,
  getSingleUserCacheKey,
  getSingleUserPermissionCacheKey,
  getUserEmailCacheKey,
  getUserSessionCacheKey,
} from "../../../../helper/redis/session-keys";
import {
  BaseResponse,
  ErrorResponse,
  MutationLoginArgs,
  UserLoginResponse,
} from "../../../../types";
import CompareInfo from "../../../../utils/bcrypt/compare-info";
import { loginSchema } from "../../../../utils/data-validation/auth/auth";
import EncodeToken from "../../../../utils/jwt/encode-token";

// Define the type for lockout session
interface LockoutSession {
  lockedAt: number; // Timestamp when the account was locked
  duration: number; // Duration in seconds for the lockout
}

/**
 * Logs a user into the system.
 * - Authenticates the user by checking the email and password.
 * - Returns a JWT token if successful, or an error message if not.
 * @param _ - Unused GraphQL parent argument
 * @param args - Login arguments (email, password)
 * @param context - Application context containing AppDataSource
 * @returns Promise<UserLoginResponse | ErrorResponse | BaseResponse> - Login result with status and message
 */
export const login = async (
  _: any,
  args: MutationLoginArgs,
  { redis, AppDataSource }: Context
): Promise<UserLoginResponse | ErrorResponse | BaseResponse> => {
  const { getSession, setSession, deleteSession } = redis;

  const { email, password } = args;

  try {
    // Validate input data using Zod schema
    const validationResult = await loginSchema.safeParseAsync({
      email,
      password,
    });

    // If validation fails, return detailed error messages with field names
    if (!validationResult.success) {
      const errorMessages = validationResult.error.errors.map((error) => ({
        field: error.path.join("."), // Converts the path array to a string
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

    // Initialize repositories for User entity
    const userRepository: Repository<User> = AppDataSource.getRepository(User);

    // Check Redis for cached user's email
    let userEmail;

    let user;

    userEmail = await getSession(getUserEmailCacheKey(email));

    if (!userEmail) {
      // Cache miss: Fetch user from database
      user = await userRepository.findOne({
        where: { email },
        relations: ["role", "permissions"],
      });

      if (!user) {
        return {
          statusCode: 400,
          success: false,
          message: `User not found with this email: ${email}`,
          __typename: "BaseResponse",
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
      // User email found in cache - fetch complete user info
      user = await userRepository.findOne({
        where: { email },
        relations: ["role", "permissions"],
      });

      if (!user) {
        return {
          statusCode: 400,
          success: false,
          message: `User not found with this email: ${email}`,
          __typename: "BaseResponse",
        };
      }
    }

    // Account lock check using Redis session data
    const lockoutSession = await getSession(getlockoutKeyCacheKey(user.email));

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
          __typename: "BaseResponse",
        };
      } else {
        // Unlock the account if the lock time has expired
        await deleteSession(getlockoutKeyCacheKey(user.email));
      }
    }

    // Verify password
    const isPasswordValid = await CompareInfo(password, user.password);

    if (!isPasswordValid) {
      // Increment login attempt count
      const sessionData = (await getSession(
        getloginAttemptsKeyCacheKey(user.email)
      )) as {
        attempts: number;
      } | null;
      const newAttempts = (sessionData?.attempts || 0) + 1;

      // Store updated attempts count in Redis with 1-hour TTL
      await setSession(
        getloginAttemptsKeyCacheKey(user.email),
        { attempts: newAttempts },
        3600
      );

      // Lock account after 5 failed attempts
      if (newAttempts >= 5) {
        const lockDuration = 900; // 15 minutes in seconds
        await setSession(
          getlockoutKeyCacheKey(user.email),
          { locked: true, lockedAt: Date.now(), duration: lockDuration },
          lockDuration
        );
        return {
          statusCode: 400,
          success: false,
          message: "Account locked. Please try again after 15 minutes.",
          __typename: "BaseResponse",
        };
      }

      return {
        statusCode: 400,
        success: false,
        message: "Invalid password",
        __typename: "BaseResponse",
      };
    }

    // Reset login attempts after successful password verification
    await deleteSession(getloginAttemptsKeyCacheKey(user.email));

    // Generate JWT token
    const token = await EncodeToken(
      user.id,
      user.email,
      user.firstName,
      user.lastName,
      user.role.name,
      "30d" // Set the token expiration time
    );

    // Create and store session
    const session = {
      id: user.id,
      email: user.email,
      firstName: user.firstName,
      lastName: user.lastName,
      role: user.role.name,
    };

    // Cache user, user session & permissions  for curd in Redis with configurable TTL(default 30 days of redis session because of the env)
    await setSession(getSingleUserCacheKey(user.id), session);
    await setSession(getUserSessionCacheKey(user.id), session);
    await setSession(
      getSingleUserPermissionCacheKey(user.id),
      user.permissions
    );

    return {
      statusCode: 200,
      success: true,
      message: "Login successful",
      token,
      __typename: "UserLoginResponse",
    };
  } catch (error: any) {
    // Log the error for debugging purposes
    console.error("Error logging in user:", error);

    // Return a detailed error message if available, otherwise a generic one
    return {
      statusCode: 500,
      success: false,
      message: error.message || "Internal server error",
      __typename: "BaseResponse",
    };
  }
};
