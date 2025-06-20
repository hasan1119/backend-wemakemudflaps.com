import CONFIG from "../../../../config/config";
import { Context } from "../../../../context";
import {
  getLockoutSessionFromRedis,
  getLoginAttemptsFromRedis,
  getRoleInfoByRoleNameFromRedis,
  getUserInfoByEmailFromRedis,
  removeLockoutSessionFromRedis,
  removeLoginAttemptsFromRedis,
  setLockoutSessionInRedis,
  setLoginAttemptsInRedis,
  setRoleInfoByRoleNameInRedis,
  setUserInfoByEmailInRedis,
  setUserInfoByUserIdInRedis,
  setUserPermissionsByUserIdInRedis,
  setUserRolesInfoInRedis,
  setUserTokenInfoByUserSessionIdInRedis,
} from "../../../../helper/redis";
import {
  MutationLoginArgs,
  UserLoginResponseOrError,
  UserSession,
} from "../../../../types";
import CompareInfo from "../../../../utils/bcrypt/compare-info";
import { loginSchema } from "../../../../utils/data-validation";
import EncodeToken from "../../../../utils/jwt/encode-token";
import { mapUserToResponseByEmail } from "../../../../utils/mapper";
import {
  createUserLoginInfo,
  findRolesByNames,
  getUserByEmail,
} from "../../../services";

/**
 * Handles user login functionality.
 *
 * Workflow:
 * 1. Validates the login input (email and password) using Zod schema.
 * 2. Attempts to retrieve cached user data and role infos from Redis to improve performance.
 * 3. If cache miss, fetches user data from the database and caches it in Redis.
 * 4. Checks for account lockout state and enforces lockout duration if applicable.
 * 5. Verifies the provided password against the stored hash.
 * 6. Tracks failed login attempts and enforces lockout after multiple failures.
 * 7. Validates whether the user's email is verified and account is activated.
 * 8. Clears failed login attempt counters upon successful login.
 * 9. Caches user session data, role infos and permissions in Redis for subsequent requests.
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
    const validationResult = await loginSchema.safeParseAsync({
      email: args.email,
      password: args.password,
    });

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
      const dbUser = await getUserByEmail(email);

      if (!dbUser) {
        // Return error if user not found or deleted
        return {
          statusCode: 400,
          success: false,
          message: `User not found with this email: ${email} or has been deleted`,
          __typename: "ErrorResponse",
        };
      }

      user = await mapUserToResponseByEmail(dbUser);

      // Cache user data in Redis by both email and userId
      await Promise.all([
        setUserInfoByEmailInRedis(email, dbUser),
        setUserInfoByUserIdInRedis(dbUser.id, dbUser),
      ]);
    }

    // Attempt to get cached user roles data from Redis by role names
    let rolesInfoByName;

    rolesInfoByName = await Promise.all(
      user.roles.map(async (roleName) => {
        const roleInfo = await getRoleInfoByRoleNameFromRedis(roleName);
        return roleInfo ?? null; // Return null if not found
      })
    );

    // Identify missing roles not found in Redis
    const missingRoleNames = user.roles.filter(
      (_, index) => rolesInfoByName[index] === null
    );

    if (missingRoleNames.length > 0) {
      // Fetch missing roles from database
      const dbRoles = await findRolesByNames(missingRoleNames);

      // Merge fetched roles into rolesInfoByName
      rolesInfoByName = rolesInfoByName.map(
        (roleInfo, index) =>
          roleInfo ??
          dbRoles.find((dbRole) => dbRole.name === user.roles[index])
      );

      // Cache newly fetched roles in Redis
      await Promise.all(
        dbRoles.map((dbRole) =>
          setRoleInfoByRoleNameInRedis(dbRole.name, dbRole)
        )
      );
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

    const sessionData = await createUserLoginInfo({
      ...args.meta,
      user: user.id,
      ip: args.meta?.ip ?? null,
      city: args.meta?.city ?? null,
      isp: args.meta?.isp ?? null,
      country: args.meta?.country ?? null,
      countryIso: args.meta?.countryIso ?? null,
      postalCode: args.meta?.postalCode ?? null,
      subdivisionIso: args.meta?.subdivisionIso ?? null,
      timeZone: args.meta?.timeZone ?? null,
      cityGeonameId: args.meta?.cityGeonameId ?? null,
      countryGeonameId: args.meta?.countryGeonameId ?? null,
      subdivisionGeonameId: args.meta?.subdivisionGeonameId ?? null,
      ispId: args.meta?.ispId ?? null,
      latitude: args.meta?.latitude ?? null,
      longitude: args.meta?.longitude ?? null,
      fingerprint: args.meta?.fingerprint,
      session: args.meta?.session,
      fraud: args.meta?.fraud ?? 0,
      tor: args.meta?.tor ?? false,
      loggedInAt: args.meta?.loggedInAt
        ? new Date(args.meta.loggedInAt)
        : new Date(),
    });

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
      sessionId: sessionData.id,
    };

    // Cache user session and permissions in Redis with TTL (30 days)
    await Promise.all([
      setUserTokenInfoByUserSessionIdInRedis(
        sessionData.id,
        userSessionData,
        25920000
      ),
      setUserPermissionsByUserIdInRedis(user.id, user),
      setUserRolesInfoInRedis(user.id, rolesInfoByName),
    ]);

    // Generate JWT token with 30-day expiration
    const token = await EncodeToken(userSessionData, "30d");

    return {
      statusCode: 200,
      success: true,
      message: "Login successful",
      token,
      sessionId: args.meta.session,
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
