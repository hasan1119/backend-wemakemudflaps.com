import { Repository } from "typeorm";
import { Context } from "../../../../context";
import { User } from "../../../../entities/user.entity";
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

  // Initialize repositories for User entity
  const userRepository: Repository<User> = AppDataSource.getRepository(User);

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
        message: "Validation failed.",
        errors: errorMessages,
        __typename: "ErrorResponse",
      };
    }

    // Load user with their role
    const user = await userRepository.findOne({
      where: { email },
      relations: ["role"],
    });

    if (!user) {
      return {
        statusCode: 400,
        success: false,
        message: `User not found with this email: ${email}`,
        __typename: "BaseResponse",
      };
    }

    // Account lock check using Redis session data
    const loginAttemptsKey = `login_attempts_${email}`;
    const lockoutKey = `lockout_${email}`;

    const lockoutSession = await getSession(lockoutKey);

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
        await deleteSession(lockoutKey);
      }
    }

    // Verify password
    const isPasswordValid = await CompareInfo(password, user.password);

    if (!isPasswordValid) {
      // Increment login attempt count
      const sessionData = (await getSession(loginAttemptsKey)) as {
        attempts: number;
      } | null;
      const newAttempts = (sessionData?.attempts || 0) + 1;

      // Store updated attempts count in Redis with 1-hour TTL
      await setSession(loginAttemptsKey, { attempts: newAttempts }, 3600);

      // Lock account after 5 failed attempts
      if (newAttempts >= 5) {
        const lockDuration = 900; // 15 minutes in seconds
        await setSession(
          lockoutKey,
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
        message: "Invalid password.",
        __typename: "BaseResponse",
      };
    }

    // Reset login attempts after successful password verification
    await deleteSession(loginAttemptsKey);

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

    // Cache permissions in Redis with configurable TTL
    const userCacheKey = `user-${user.id}`;
    const TTL = 2592000; // 30 days in seconds

    try {
      await setSession(user.id, session, TTL);
      await setSession(userCacheKey, session, TTL);
    } catch (redisError) {
      console.warn("Redis error caching user data:", redisError);
    }

    return {
      statusCode: 200,
      success: true,
      message: "Login successful.",
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
