import { Repository } from "typeorm";
import { Context } from "../../../../context";
import { User } from "../../../../entities/user.entity";

import {
  getLockoutSessionFromRedis,
  getLoginAttemptsFromRedis,
  getUserInfoByEmailInRedis,
  removeLockoutSessionFromRedis,
  removeLoginAttemptsFromRedis,
  setLockoutSessionInRedis,
  setLoginAttemptsInRedis,
  setUserInfoByEmailInRedis,
  setUserInfoByUserIdInRedis,
  setUserTokenByUserIdInRedis,
} from "../../../../helper/redis";
import { MutationLoginArgs, UserLoginResponseOrError } from "../../../../types";
import CompareInfo from "../../../../utils/bcrypt/compare-info";
import { loginSchema } from "../../../../utils/data-validation";
import EncodeToken from "../../../../utils/jwt/encode-token";

/**
 * Logs a user into the system.
 *
 * Steps:
 * - Validates input using Zod schema
 * - Checks Redis for user data to optimize performance via caching
 * - Verifies the account activation status, email verification status, password and handles account lockout logic 
 * - Generates and returns a JWT token upon successful login
 * - Cache necessary user data in redis for future request
 *
 * @param _ - Unused GraphQL parent argument
 * @param args - Login arguments (email, password)
 * @param context - GraphQL context with AppDataSource
 * @returns Promise<UserLoginResponseOrError> - Response status and message
 */
export const login = async (
  _: any,
  args: MutationLoginArgs,
  { redis, AppDataSource }: Context
): Promise<UserLoginResponseOrError> => {
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

    // Check Redis for cached user's data & permission
    let user;
    user = await getUserInfoByEmailInRedis(email);

    if (!user) {
      // Fetch user from database
      const dbUser = await userRepository.findOne({
        where: { email },
        relations: ["role"],
      });

      if (!dbUser) {
        return {
          statusCode: 400,
          success: false,
          message: `User not found with this email: ${email}`,
          __typename: "ErrorResponse",
        };
      }

      user = {
        ...dbUser,
        role: dbUser.role.name,
      };

      const userSessionByEmail = {
        id: user.id,
        email: user.email,
        firstName: user.firstName,
        lastName: user.lastName,
        role: dbUser.role.name,
        gender: user.gender,
        emailVerified: user.emailVerified,
        isAccountActivated: user.isAccountActivated,
        password: user.password,
      };

      // Cache user in Redis
      await setUserInfoByEmailInRedis(email, userSessionByEmail);
    }

    // Account lock check using Redis session data
    const lockoutSession = await getLockoutSessionFromRedis(user.email);

    // Handle lockout state
    if (lockoutSession) {
      const { lockedAt, duration } = lockoutSession; // Cast to LockoutSession type
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
          __typename: "ErrorResponse",
        };
      } else {
        // Clear cache and unlock the account if the lock time has expired
        await removeLockoutSessionFromRedis(user.email);
      }
    }

    // Verify password
    if (!(await CompareInfo(password, user.password))) {
      const newAttempts = (await getLoginAttemptsFromRedis(user.email)) + 1;
      await setLoginAttemptsInRedis(user.email, newAttempts);

      if (newAttempts >= 5) {
        await setLockoutSessionInRedis(user.email, {
          lockedAt: Date.now(),
          duration: 900,
        });
        return {
          statusCode: 400,
          success: false,
          message: "Account locked. Try again in 15 minutes.",
          __typename: "ErrorResponse",
        };
      }

      return {
        statusCode: 400,
        success: false,
        message: "Invalid password",
        __typename: "ErrorResponse",
      };
    }

    // Check whether user email is verified and account is activated or not
    if (!user.emailVerified && !user.isAccountActivated) {
      return {
        statusCode: 400,
        success: false,
        message:
          "Your mail isn't verified and account isn't activated. Please verify your mail to active your account.",
        __typename: "ErrorResponse",
      };
    }

    // Clear cache login attempts after successful password verification
    await removeLoginAttemptsFromRedis(user.email);

    let roleName;

    if (typeof user.role !== "string") {
      roleName = user.role.name; // Safe update
    } else {
      roleName = user.role; // Direct assignment
    }

    // Generate JWT token
    const token = await EncodeToken(
      user.id,
      user.email,
      user.firstName,
      user.lastName,
      roleName,
      user.gender,
      user.emailVerified,
      user.isAccountActivated,
      "30d" // Set the token expiration time
    );

    // Create and store session
    const session = {
      id: user.id,
      email: user.email,
      firstName: user.firstName,
      lastName: user.lastName,
      role: roleName,
      gender: user.gender,
      emailVerified: user.emailVerified,
      isAccountActivated: user.isAccountActivated,
    };

    // Cache user, user session for curd in Redis with configurable TTL(30 days = 25920000)
    await setUserTokenByUserIdInRedis(user.id, session, 25920000);
    await setUserInfoByUserIdInRedis(user.id, session);

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
      __typename: "ErrorResponse",
    };
  }
};
