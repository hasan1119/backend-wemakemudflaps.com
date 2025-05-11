import { Repository } from "typeorm";
import { Context } from "../../../../context";
import { User } from "../../../../entities/user.entity";
import {
  getLockoutKeyCacheKey,
  getLoginAttemptsKeyCacheKey,
  getSingleUserCacheKey,
  getUserEmailCacheKey,
  getUserInfoByEmailCacheKey,
  getUserPermissionByUserIdCacheKey,
} from "../../../../helper/redis/session-keys";
import {
  CachedUserEmailKeyInputs,
  CachedUserPermissionsInputs,
  CachedUserSessionByEmailKeyInputs,
  MutationLoginArgs,
  UserLoginResponseOrError,
  UserSession,
} from "../../../../types";
import CompareInfo from "../../../../utils/bcrypt/compare-info";
import { loginSchema } from "../../../../utils/data-validation";
import EncodeToken from "../../../../utils/jwt/encode-token";

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
    let user: CachedUserSessionByEmailKeyInputs | null = await getSession(
      getUserInfoByEmailCacheKey(email)
    );

    let permissions: CachedUserPermissionsInputs[] | null;

    if (!user) {
      // Fetch user from database
      const dbUser = await userRepository.findOne({
        where: { email },
        relations: ["role", "permissions"],
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

      permissions = dbUser.permissions.map((permission) => ({
        id: permission.id,
        name: permission.name,
        description: permission.description,
        canCreate: permission.canCreate,
        canRead: permission.canRead,
        canUpdate: permission.canUpdate,
        canDelete: permission.canDelete,
      })) as CachedUserPermissionsInputs[];

      // Cache user permissions for curd in Redis with configurable TTL(default 30 days of redis session because of the env)
      await setSession(getUserPermissionByUserIdCacheKey(user.id), permissions);
    } else {
      permissions = await getSession<CachedUserPermissionsInputs[]>(
        getUserPermissionByUserIdCacheKey(user.id)
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
          __typename: "ErrorResponse",
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
          message: "Account locked. Please try again after 15 minutes.",
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
    await deleteSession(getLoginAttemptsKeyCacheKey(user.email));

    const roleName =
      typeof user.role === "string"
        ? user.role
        : (user.role as { name: string }).name;

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
    const userEmailSession: CachedUserEmailKeyInputs = {
      email: user.email,
    };

    const session: UserSession = {
      id: user.id,
      email: user.email,
      firstName: user.firstName,
      lastName: user.lastName,
      role: roleName,
      gender: user.gender,
      emailVerified: user.emailVerified,
      isAccountActivated: user.isAccountActivated,
    };

    const userSessionByEmail: CachedUserSessionByEmailKeyInputs = {
      id: user.id,
      email: user.email,
      firstName: user.firstName,
      lastName: user.lastName,
      role: roleName,
      gender: user.gender,
      emailVerified: user.emailVerified,
      isAccountActivated: user.isAccountActivated,
      password: user.password,
    };

    // Cache user, user session and user email for curd in Redis with configurable TTL(default 30 days of redis session because of the env)
    await setSession(getSingleUserCacheKey(user.id), session);
    await setSession(getUserEmailCacheKey(email), userEmailSession);
    await setSession(getUserInfoByEmailCacheKey(email), userSessionByEmail);

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
