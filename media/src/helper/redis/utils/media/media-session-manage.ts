import { UserSession } from "../../../../types";
import { redis } from "../../redis";

// Prefixes for Redis keys used for user session, email, and count caching.
const PREFIX = {
  SESSION: "session:",
  USER: "user:",
  EMAIL: "email:",
  COUNT: "count:",
};

// ===================== GETTERS =====================

/**
 * Retrieves cached user email-related data by email key from Redis.
 *
 * @param {string} email - The user's email address.
 * @returns {Promise<string | null>} - The cached email data or null if not found.
 */
export const getUserEmailFromRedis = async (
  email: string
): Promise<string | null> => {
  return redis.getSession<string | null>(`${PREFIX.EMAIL}${email}`);
};

/**
 * Retrieves the total user count stored in Redis.
 *
 * @returns {Promise<number | null>} - The cached user count or null if not found.
 */
export const getUserCountInDBFromRedis = async (): Promise<number | null> => {
  const count = await redis.getSession<string>(`${PREFIX.COUNT}user`);
  return count ? Number(count) : null;
};

/**
 * Retrieves user token session data by user ID from Redis.
 *
 * @param {string} userId - The user's ID.
 * @returns {Promise<UserSession | null>} - The cached user session or null if not found.
 */
export const getUserTokenInfoByUserIdFromRedis = async (
  userId: string
): Promise<UserSession | null> => {
  return redis.getSession<UserSession | null>(
    `${PREFIX.SESSION}token:${userId}`
  );
};

/**
 * Retrieves user session data by user ID from Redis.
 *
 * @param {string} userId - The user's ID.
 * @returns {Promise<UserSessionById | null>} - The cached user session or null if not found.
 */
// export const getUserInfoByUserIdFromRedis = async (
//   userId: string
// ): Promise<UserSessionById | null> => {
//   return redis.getSession<UserSessionById | null>(
//     `${PREFIX.SESSION}user:${userId}`
//   );
// };

/**
 * Retrieves user session data by email from Redis.
 *
 * @param {string} email - The user's email address.
 * @returns {Promise<UserSessionByEmail | null>} - The cached user session or null if not found.
 */
// export const getUserInfoByEmailFromRedis = async (
//   email: string
// ): Promise<UserSessionByEmail | null> => {
//   return redis.getSession<UserSessionByEmail | null>(
//     `${PREFIX.SESSION}email:${email}`
//   );
// };

// ===================== SETTERS =====================

/**
 * Caches user email-related data in Redis.
 *
 * @param {string} email - The user's email address.
 * @param {string} data - The data to cache.
 * @returns {Promise<void>}
 */
export const setUserEmailInRedis = async (
  email: string,
  data: string
): Promise<void> => {
  await redis.setSession(`${PREFIX.EMAIL}${email}`, data);
};

/**
 * Caches the total user count in Redis.
 *
 * @param {number} count - The user count to cache.
 * @returns {Promise<void>}
 */
export const setUserCountInDBInRedis = async (count: number): Promise<void> => {
  await redis.setSession(`${PREFIX.COUNT}user`, count.toString());
};

/**
 * Caches user session data in Redis by user ID.
 *
 * @param {string} userId - The user's ID.
 * @param {UserSessionById} data - The session data to cache.
 * @returns {Promise<void>}
 */
// export const setUserInfoByUserIdInRedis = async (
//   userId: string,
//   data: UserSessionById
// ): Promise<void> => {
//   await redis.setSession(`${PREFIX.SESSION}user:${userId}`, data);
// };

/**
 * Caches user token session data in Redis by user ID with optional TTL.
 *
 * @param {string} userId - The user's ID.
 * @param {UserSession} data - The session data to cache.
 * @param {number} ttl - Time to live in seconds.
 * @returns {Promise<void>}
 */
export const setUserTokenInfoByUserIdInRedis = async (
  userId: string,
  data: UserSession,
  ttl: number
): Promise<void> => {
  await redis.setSession(`${PREFIX.SESSION}token:${userId}`, data, ttl);
};

/**
 * Caches user session data in Redis by email.
 *
 * @param {string} email - The user's email address.
 * @param {UserSessionByEmail} data - The session data to cache.
 * @returns {Promise<void>}
 */
// export const setUserInfoByEmailInRedis = async (
//   email: string,
//   data: UserSessionByEmail
// ): Promise<void> => {
//   await redis.setSession(`${PREFIX.SESSION}email:${email}`, data);
// };

// ===================== REMOVERS =====================

/**
 * Removes user info from Redis by user ID.
 *
 * @param {string} userId - The user's ID.
 * @returns {Promise<void>}
 */
export const removeUserInfoByUserIdInRedis = async (
  userId: string
): Promise<void> => {
  await redis.deleteSession(`${PREFIX.SESSION}user:${userId}`);
};

/**
 * Removes user token session data from Redis by user ID.
 *
 * @param {string} userId - The user's ID.
 * @returns {Promise<void>}
 */
export const removeUserTokenByUserIdFromRedis = async (
  userId: string
): Promise<void> => {
  await redis.deleteSession(`${PREFIX.SESSION}token:${userId}`);
};

/**
 * Removes user session data in Redis by email.
 *
 * @param {string} email - The user's email address.
 * @returns {Promise<void>}
 */
export const removeUserInfoByEmailFromRedis = async (
  email: string
): Promise<void> => {
  await redis.deleteSession(`${PREFIX.SESSION}email:${email}`);
};

/**
 * Removes cached user email-related data by email key from Redis.
 *
 * @param {string} email - The user's email address.
 * @returns {Promise<void>}
 */
export const removeUserEmailFromRedis = async (
  email: string
): Promise<void> => {
  await redis.deleteSession(`${PREFIX.EMAIL}${email}`);
};

/**
 * Removes the total user count stored in Redis.
 *
 * @returns {Promise<void>}
 */
export const removeUserCountInDBFromRedis = async (): Promise<void> => {
  await redis.deleteSession(`${PREFIX.COUNT}user`);
};
