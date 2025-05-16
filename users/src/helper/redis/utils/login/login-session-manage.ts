import { redis } from "../../redis";

const PREFIX = {
  ACCOUNT_LOCKOUT: "account-lockout:",
  LOGIN_ATTEMPTS: "login-attempts:",
};

// Define the type for lockout session
interface LockoutSession {
  lockedAt: number; // Timestamp when the account was locked
  duration: number; // Duration in seconds for the lockout
}

//
// ===================== GETTERS =====================
//

/**
 * Get the lockout session for a user from Redis.
 */
export const getLockoutSessionFromRedis = async (
  email: string
): Promise<LockoutSession | null> => {
  const session = await redis.getSession<LockoutSession | null>(
    `${PREFIX.ACCOUNT_LOCKOUT}${email}`
  );
  return session;
};

/**
 * Get login attempts for a user from Redis.
 */
export const getLoginAttemptsFromRedis = async (
  email: string
): Promise<number> => {
  const sessionData = await redis.getSession<{ attempts: number } | null>(
    `${PREFIX.LOGIN_ATTEMPTS}${email}`
  );
  return sessionData?.attempts || 0;
};

//
// ===================== SETTERS =====================
//

/**
 * Set the lockout session for a user in Redis.
 */
export const setLockoutSessionInRedis = async (
  email: string,
  session: LockoutSession,
  ttl: number = 300
): Promise<void> => {
  await redis.setSession(`${PREFIX.ACCOUNT_LOCKOUT}${email}`, session, ttl);
};

/**
 * Set login attempts for a user in Redis.
 */
export const setLoginAttemptsInRedis = async (
  email: string,
  attempts: number,
  ttl: number = 3600
): Promise<void> => {
  await redis.setSession(`${PREFIX.LOGIN_ATTEMPTS}${email}`, { attempts }, ttl);
};

//
// ===================== REMOVERS =====================
//

/**
 * Remove the lockout session for a user from Redis.
 */
export const removeLockoutSessionFromRedis = async (
  email: string
): Promise<void> => {
  await redis.deleteSession(`${PREFIX.ACCOUNT_LOCKOUT}${email}`);
};

/**
 * Remove login attempts session for a user in Redis.
 */
export const removeLoginAttemptsFromRedis = async (
  email: string
): Promise<void> => {
  await redis.deleteSession(`${PREFIX.LOGIN_ATTEMPTS}${email}`);
};
