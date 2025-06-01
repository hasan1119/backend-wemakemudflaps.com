import CONFIG from "../../../../config/config";
import { Context } from "../../../../context";
import {
  getLockoutSessionFromRedis,
  getLoginAttemptsFromRedis,
  getUserInfoByEmailFromRedis,
  removeLockoutSessionFromRedis,
  removeLoginAttemptsFromRedis,
  setLockoutSessionInRedis,
  setLoginAttemptsInRedis,
  setUserInfoByEmailInRedis,
  setUserInfoByUserIdInRedis,
  setUserPermissionsByUserIdInRedis,
  setUserTokenInfoByUserIdInRedis,
} from "../../../../helper/redis";
import {
  MutationLoginArgs,
  UserLoginResponseOrError,
  UserSession,
} from "../../../../types";
import CompareInfo from "../../../../utils/bcrypt/compare-info";
import { loginSchema } from "../../../../utils/data-validation";
import EncodeToken from "../../../../utils/jwt/encode-token";
import { getUserByEmail } from "../../../services";

/**
 * Handles user login functionality.
 *
 * Workflow:
 * 1. Validates the login input (email and password) using Zod schema.
 * 2. Attempts to retrieve cached user data from Redis to improve performance.
 * 3. If cache miss, fetches user data from the database and caches it in Redis.
 * 4. Checks for account lockout state and enforces lockout duration if applicable.
 * 5. Verifies the provided password against the stored hash.
 * 6. Tracks failed login attempts and enforces lockout after multiple failures.
 * 7. Validates whether the user's email is verified and account is activated.
 * 8. Clears failed login attempt counters upon successful login.
 * 9. Caches user session data and permissions in Redis for subsequent requests.
 * 10. Generates and returns a JWT token with a 30-day expiration.
 *
 * @param _ - Unused parent parameter for GraphQL resolver.
 * @param args - Input arguments containing email and password.
 * @param __ - GraphQL context (unused here).
 * @returns A promise resolving to a UserLoginResponseOrError object containing status, messages, and token if successful.
 */
export const login = async (
  _: any,
  args: MutationLoginArgs,
  __: Context
): Promise<UserLoginResponseOrError> => {
  try {
    // Validate input data with Zod schema
    const validationResult = await loginSchema.safeParseAsync(args);

    // Return detailed validation errors if input is invalid
    if (!validationResult.success) {
      const errorMessages = validationResult.error.errors.map((error) => ({
        field: error.path.join("."), // Join path array to string for field identification
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

    const { email, password } = validationResult.data;

    // Attempt to get cached user data from Redis by email
    let user;

    user = await getUserInfoByEmailFromRedis(email);

    if (!user) {
      // On cache miss, query user from database
      user = await getUserByEmail(email);

      if (!user) {
        // Return error if user not found or deleted
        return {
          statusCode: 400,
          success: false,
          message: `User not found with this email: ${email} or has been deleted`,
          __typename: "ErrorResponse",
        };
      }

      // Cache user data in Redis by both email and userId
      await Promise.all([
        setUserInfoByEmailInRedis(email, user),
        setUserInfoByUserIdInRedis(user.id, user),
      ]);
    }

    // Check for any active account lockout session in Redis
    const lockoutSession = await getLockoutSessionFromRedis(user.email);

    if (lockoutSession) {
      const { lockedAt, duration } = lockoutSession;

      const timePassed = Math.floor((Date.now() - lockedAt) / 1000); // seconds elapsed
      const timeLeft = duration - timePassed;

      if (timeLeft > 0) {
        // Lockout still active, inform user of remaining lockout time
        const minutes = Math.floor(timeLeft / 60);
        const seconds = timeLeft % 60;

        return {
          statusCode: 400,
          success: false,
          message: `Account locked. Please try again after ${minutes}m ${seconds}s.`,
          __typename: "ErrorResponse",
        };
      } else {
        // Lockout expired, remove lockout session to allow login attempts
        await removeLockoutSessionFromRedis(user.email);
      }
    }

    // Verify the user's password using bcrypt comparison
    const passwordValid = await CompareInfo(password, user.password);
    if (!passwordValid) {
      // Increment failed login attempts counter in Redis
      const newAttempts = (await getLoginAttemptsFromRedis(user.email)) + 1;
      await setLoginAttemptsInRedis(user.email, newAttempts);

      // Lock account after 5 failed attempts for 15 minutes
      if (newAttempts >= 5) {
        await setLockoutSessionInRedis(user.email, {
          lockedAt: Date.now(),
          duration: 900, // 15 minutes in seconds
        });
        return {
          statusCode: 400,
          success: false,
          message: "Account locked. Try again in 15 minutes.",
          __typename: "ErrorResponse",
        };
      }

      // Return invalid password error otherwise
      return {
        statusCode: 400,
        success: false,
        message: "Invalid password",
        __typename: "ErrorResponse",
      };
    }

    // Ensure user's email is verified and account is activated before allowing login
    if (!user.emailVerified && !user.isAccountActivated) {
      return {
        statusCode: 400,
        success: false,
        message:
          "Your mail isn't verified and account isn't activated. Please verify your mail to activate your account.",
        __typename: "ErrorResponse",
      };
    }

    // Clear failed login attempts after successful login
    await removeLoginAttemptsFromRedis(user.email);

    // Prepare user session data for JWT token and caching
    const userSessionData: UserSession = {
      id: user.id,
      avatar: user.avatar,
      firstName: user.firstName,
      lastName: user.lastName,
      email: user.email,
      gender: user.gender,
      roles: user.roles.map((role) => role.toUpperCase()),
      emailVerified: user.emailVerified,
      isAccountActivated: user.isAccountActivated,
    };

    // Cache user session and permissions in Redis with TTL (30 days)
    await Promise.all([
      setUserTokenInfoByUserIdInRedis(user.id, userSessionData, 25920000),
      setUserPermissionsByUserIdInRedis(user.id, user),
    ]);

    // Generate JWT token with 30-day expiration
    const token = await EncodeToken(userSessionData, "30d");

    return {
      statusCode: 200,
      success: true,
      message: "Login successful",
      token,
      __typename: "UserLoginResponse",
    };
  } catch (error: any) {
    console.error("Error logging in user:", error);

    return {
      statusCode: 500,
      success: false,
      message: `${
        CONFIG.NODE_ENV === "production"
          ? "Something went wrong, please try again."
          : error.message || "Internal server error"
      }`,
      __typename: "ErrorResponse",
    };
  }
};
