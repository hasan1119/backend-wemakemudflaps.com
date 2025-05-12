import { CachedUserSessionByEmailKeyInputs, UserSession } from "../../../types";
import { redis } from "../redis";

// Prefixes for Redis keys
const PREFIX = {
  SESSION: "session:",
  USER: "user:",
  EMAIL: "email:",
  COUNT: "count:",
};

//
// ===================== GETTERS =====================
//

/**
 * Retrieve cached user email-related data by email key.
 */
export const getUserEmailFromRedis = async (
  email: string
): Promise<string | null> => {
  return redis.getSession<string | null>(`${PREFIX.EMAIL}${email}`);
};

/**
 * Retrieve total user count stored in Redis.
 */
export const getUserCountInDBFromRedis = async (): Promise<number | null> => {
  const count = await redis.getSession<string>(`${PREFIX.COUNT}user`);
  return count ? Number(count) : null;
};

/**
 * Retrieve user token session data by user ID.
 */
export const getUserTokenInfoByUserIdFromRedis = async (
  userId: string
): Promise<UserSession | null> => {
  return redis.getSession<UserSession | null>(
    `${PREFIX.SESSION}token:${userId}`
  );
};

/**
 * Retrieve user session data by user ID.
 */
export const getUserInfoByUserIdFromRedis = async (
  userId: string
): Promise<UserSession | null> => {
  return redis.getSession<UserSession | null>(
    `${PREFIX.SESSION}user:${userId}`
  );
};

/**
 * Retrieve user session data by email.
 */
export const getUserInfoByEmailInRedis = async (
  email: string
): Promise<CachedUserSessionByEmailKeyInputs | null> => {
  return redis.getSession<CachedUserSessionByEmailKeyInputs | null>(
    `${PREFIX.SESSION}email:${email}`
  );
};

//
// ===================== SETTERS =====================
//

/**
 * Cache user email-related data in Redis.
 */
export const setUserEmailInRedis = async (
  email: string,
  data: string
): Promise<void> => {
  await redis.setSession(`${PREFIX.EMAIL}${email}`, data);
};

/**
 * Cache total user count in Redis.
 */
export const setUserCountInDBInRedis = async (count: number): Promise<void> => {
  await redis.setSession(`${PREFIX.COUNT}user`, count.toString());
};

/**
 * Cache user session data in Redis by user ID.
 */
export const setUserInfoByUserIdInRedis = async (
  userId: string,
  data: UserSession
): Promise<void> => {
  await redis.setSession(`${PREFIX.SESSION}user:${userId}`, data);
};

/**
 * Cache user token session data in Redis by user ID with optional TTL.
 */
export const setUserTokenByUserIdInRedis = async (
  userId: string,
  data: UserSession,
  ttl: number
): Promise<void> => {
  await redis.setSession(`${PREFIX.SESSION}token:${userId}`, data, ttl);
};

/**
 * Cache user session data in Redis by email.
 */
export const setUserInfoByEmailInRedis = async (
  email: string,
  data: CachedUserSessionByEmailKeyInputs
): Promise<void> => {
  await redis.setSession(`${PREFIX.SESSION}email:${email}`, data);
};

//
// ===================== REMOVERS =====================
//

/**
 * Remove user info from Redis by user ID.
 */
export const removeUserInfoByUserIdInRedis = async (
  userId: string
): Promise<void> => {
  await redis.deleteSession(`${PREFIX.SESSION}user:${userId}`);
};

/**
 * Remove user token session data from Redis by user ID.
 */
export const removeUserTokenByUserIdFromRedis = async (
  userId: string
): Promise<void> => {
  await redis.deleteSession(`${PREFIX.SESSION}token:${userId}`);
};

/**
 * Remove user session data in Redis by email.
 */
export const removeUserInfoByEmailFromRedis = async (
  email: string
): Promise<void> => {
  await redis.deleteSession(`${PREFIX.SESSION}email:${email}`);
};
