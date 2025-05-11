import {
  CachedUserEmailKeyInputs,
  CachedUserSessionByEmailKeyInputs,
  UserSession,
} from "../../../types";
import { redis } from "../redis";

//
// ===================== GETTERS =====================
//

/**
 * Get cached user email-related data from Redis by email key.
 */
export const getUserEmailFromRedis = async (
  email: string
): Promise<CachedUserEmailKeyInputs | null> => {
  return await redis.getSession<CachedUserEmailKeyInputs | null>(email);
};

/**
 * Get total user count stored in Redis.
 */
export const getUserCountInDBFromRedis = async (): Promise<number | null> => {
  const count = await redis.getSession<string>("user-count");
  if (count === null) return null;

  const numericCount = Number(count);
  return isNaN(numericCount) ? null : numericCount;
};

/**
 * Get user session data from Redis by user ID.
 */
export const getUserInfoByUserIdFromRedis = async (
  userId: string
): Promise<UserSession | null> => {
  return await redis.getSession<UserSession | null>(userId);
};

/**
 * Get user session data from Redis by user email.
 */
export const getUserInfoByEmailInRedis = async (
  email: string
): Promise<CachedUserSessionByEmailKeyInputs | null> => {
  return await redis.getSession<CachedUserSessionByEmailKeyInputs | null>(
    email
  );
};

//
// ===================== SETTERS =====================
//

/**
 * Set cached user email-related data in Redis.
 */
export const setUserEmailInRedis = async (
  email: string,
  data: CachedUserEmailKeyInputs,
  ttl?: number
): Promise<void> => {
  await redis.setSession(email, data, ttl);
};

/**
 * Set user session data in Redis by user ID.
 */
export const setUserInfoByUserIdInRedis = async (
  userId: string,
  data: UserSession,
  ttl?: number
): Promise<void> => {
  await redis.setSession(userId, data, ttl);
};

/**
 * Set total user count in Redis.
 */
export const setUserCountInDBInRedis = async (
  count: number,
  ttl?: number
): Promise<void> => {
  await redis.setSession("user-count", count.toString(), ttl);
};

/**
 * Set user session data in Redis by email.
 */
export const setUserInfoByEmailInRedis = async (
  email: string,
  data: CachedUserSessionByEmailKeyInputs,
  ttl?: number
): Promise<void> => {
  await redis.setSession(email, data, ttl);
};
