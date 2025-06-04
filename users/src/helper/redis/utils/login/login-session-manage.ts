import { redis } from "../../redis";

// Defines prefixes for Redis keys used for account lockout and login attempt caching
const PREFIX = {
  ACCOUNT_LOCKOUT: "account-lockout:",
  LOGIN_ATTEMPTS: "login-attempts:",
};

/**
 * Specifies the structure for a lockout session.
 */
interface LockoutSession {
  lockedAt: number; // Timestamp when the account was locked
  duration: number; // Duration in seconds for the lockout
}

/**
 * Handles retrieval of a user's lockout session from Redis.
 *
 * Workflow:
 * 1. Queries Redis using the account lockout prefix and user email.
 * 2. Returns the parsed LockoutSession object or null if not found.
 *
 * @param email - The email address of the user.
 * @returns A promise resolving to the LockoutSession or null if not found.
 */
export const getLockoutSessionFromRedis = async (
  email: string
): Promise<LockoutSession | null> => {
  const session = await redis.getSession<LockoutSession | null>(
    `${PREFIX.ACCOUNT_LOCKOUT}${email}`,
    "user-session"
  );
  return session;
};

/**
 * Handles retrieval of a user's login attempt count from Redis.
 *
 * Workflow:
 * 1. Queries Redis using the login attempts prefix and user email.
 * 2. Returns the number of login attempts or 0 if not found.
 *
 * @param email - The email address of the user.
 * @returns A promise resolving to the number of login attempts.
 */
export const getLoginAttemptsFromRedis = async (
  email: string
): Promise<number> => {
  const sessionData = await redis.getSession<{ attempts: number } | null>(
    `${PREFIX.LOGIN_ATTEMPTS}${email}`,
    "user-session"
  );
  return sessionData?.attempts || 0;
};

/**
 * Handles storing a user's lockout session in Redis.
 *
 * Workflow:
 * 1. Stores the lockout session data in Redis with the account lockout prefix and user email.
 * 2. Applies an optional time-to-live (TTL) for the stored data.
 *
 * @param email - The email address of the user.
 * @param session - The LockoutSession data to store.
 * @param ttl - Optional time-to-live in seconds (default: 300).
 * @returns A promise resolving when the session is stored.
 */
export const setLockoutSessionInRedis = async (
  email: string,
  session: LockoutSession,
  ttl: number = 300
): Promise<void> => {
  await redis.setSession(
    `${PREFIX.ACCOUNT_LOCKOUT}${email}`,
    session,
    "user-session",
    ttl
  );
};

/**
 * Handles storing a user's login attempt count in Redis.
 *
 * Workflow:
 * 1. Stores the login attempt count in Redis with the login attempts prefix and user email.
 * 2. Applies an optional time-to-live (TTL) for the stored data.
 *
 * @param email - The email address of the user.
 * @param attempts - The number of login attempts.
 * @param ttl - Optional time-to-live in seconds (default: 3600).
 * @returns A promise resolving when the attempts are stored.
 */
export const setLoginAttemptsInRedis = async (
  email: string,
  attempts: number,
  ttl: number = 3600
): Promise<void> => {
  await redis.setSession(
    `${PREFIX.LOGIN_ATTEMPTS}${email}`,
    { attempts },
    "user-session",
    ttl
  );
};

/**
 * Handles removal of a user's lockout session from Redis.
 *
 * Workflow:
 * 1. Deletes the lockout session data from Redis using the account lockout prefix and user email.
 *
 * @param email - The email address of the user.
 * @returns A promise resolving when the session is removed.
 */
export const removeLockoutSessionFromRedis = async (
  email: string
): Promise<void> => {
  await redis.deleteSession(
    `${PREFIX.ACCOUNT_LOCKOUT}${email}`,
    "user-session"
  );
};

/**
 * Handles removal of a user's login attempt session from Redis.
 *
 * Workflow:
 * 1. Deletes the login attempt data from Redis using the login attempts prefix and user email.
 *
 * @param email - The email address of the user.
 * @returns A promise resolving when the attempts are removed.
 */
export const removeLoginAttemptsFromRedis = async (
  email: string
): Promise<void> => {
  await redis.deleteSession(`${PREFIX.LOGIN_ATTEMPTS}${email}`, "user-session");
};
