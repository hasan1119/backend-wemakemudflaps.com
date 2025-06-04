import { User } from "../../../../entities";
import {
  UserSession,
  UserSessionByEmail,
  UserSessionById,
} from "../../../../types";
import {
  mapUserToResponseByEmail,
  mapUserToResponseById,
  mapUserToTokenData,
} from "../../../../utils/mapper";
import { redis } from "../../redis";

// Defines prefixes for Redis keys used for user session, email, and count caching
const PREFIX = {
  SESSION: "session:",
  USER: "user:",
  EMAIL: "email:",
  COUNT: "count:",
};

/**
 * Handles retrieval of cached user email data from Redis.
 *
 * Workflow:
 * 1. Queries Redis using the email prefix and user email.
 * 2. Returns the cached email data or null if not found.
 *
 * @param email - The email address of the user.
 * @returns A promise resolving to the cached email data or null if not found.
 */
export const getUserEmailFromRedis = async (
  email: string
): Promise<string | null> => {
  return redis.getSession<string | null>(`${PREFIX.EMAIL}${email}`, "user-app");
};

/**
 * Handles retrieval of the total user count from Redis.
 *
 * Workflow:
 * 1. Queries Redis using the count prefix for users.
 * 2. Converts the result to a number or returns null if not found.
 *
 * @returns A promise resolving to the user count or null if not found.
 */
export const getUserCountInDBFromRedis = async (): Promise<number | null> => {
  const count = await redis.getSession<string>(
    `${PREFIX.COUNT}user`,
    "user-app"
  );
  return count ? Number(count) : null;
};

/**
 * Handles retrieval of user token session data from Redis by user ID.
 *
 * Workflow:
 * 1. Queries Redis using the session token prefix and user ID.
 * 2. Returns the parsed UserSession or null if not found.
 *
 * @param userId - The ID of the user.
 * @returns A promise resolving to the UserSession or null if not found.
 */
export const getUserTokenInfoByUserIdFromRedis = async (
  userId: string
): Promise<UserSession | null> => {
  return redis.getSession<UserSession | null>(
    `${PREFIX.SESSION}token:${userId}`,
    "user-session"
  );
};

/**
 * Handles retrieval of user session data from Redis by user ID.
 *
 * Workflow:
 * 1. Queries Redis using the session user prefix and user ID.
 * 2. Returns the parsed UserSessionById or null if not found.
 *
 * @param userId - The ID of the user.
 * @returns A promise resolving to the UserSessionById or null if not found.
 */
export const getUserInfoByUserIdFromRedis = async (
  userId: string
): Promise<UserSessionById | null> => {
  return redis.getSession<UserSessionById | null>(
    `${PREFIX.SESSION}user:${userId}`,
    "user-app"
  );
};

/**
 * Handles retrieval of user session data from Redis by email.
 *
 * Workflow:
 * 1. Queries Redis using the session email prefix and user email.
 * 2. Returns the parsed UserSessionByEmail or null if not found.
 *
 * @param email - The email address of the user.
 * @returns A promise resolving to the UserSessionByEmail or null if not found.
 */
export const getUserInfoByEmailFromRedis = async (
  email: string
): Promise<UserSessionByEmail | null> => {
  return redis.getSession<UserSessionByEmail | null>(
    `${PREFIX.SESSION}email:${email}`,
    "user-session"
  );
};

/**
 * Handles caching user email data in Redis.
 *
 * Workflow:
 * 1. Stores the provided email data in Redis with the email prefix and user email.
 *
 * @param email - The email address of the user.
 * @param data - The email data to cache.
 * @returns A promise resolving when the email data is cached.
 */
export const setUserEmailInRedis = async (
  email: string,
  data: string
): Promise<void> => {
  await redis.setSession(`${PREFIX.EMAIL}${email}`, data, "user-app");
};

/**
 * Handles caching the total user count in Redis.
 *
 * Workflow:
 * 1. Stores the user count as a string in Redis with the count prefix for users.
 *
 * @param count - The user count to cache.
 * @returns A promise resolving when the count is cached.
 */
export const setUserCountInDBInRedis = async (count: number): Promise<void> => {
  await redis.setSession(`${PREFIX.COUNT}user`, count.toString(), "user-app");
};

/**
 * Handles caching user session data in Redis by user ID.
 *
 * Workflow:
 * 1. Maps the provided user data to a response format using mapUserToResponseById.
 * 2. Stores the mapped data in Redis with the session user prefix and user ID.
 *
 * @param userId - The ID of the user.
 * @param data - The User entity to cache.
 * @returns A promise resolving when the session data is cached.
 */
export const setUserInfoByUserIdInRedis = async (
  userId: string,
  data: User
): Promise<void> => {
  const sessionData = await mapUserToResponseById(data);
  await redis.setSession(
    `${PREFIX.SESSION}user:${userId}`,
    sessionData,
    "user-app"
  );
};

/**
 * Handles caching user token session data in Redis by user ID.
 *
 * Workflow:
 * 1. Maps the provided user session data to a token format using mapUserToTokenData.
 * 2. Stores the mapped data in Redis with the session token prefix, user ID, and specified TTL.
 *
 * @param userId - The ID of the user.
 * @param data - The UserSession data to cache.
 * @param ttl - Time-to-live in seconds.
 * @returns A promise resolving when the token data is cached.
 */
export const setUserTokenInfoByUserIdInRedis = async (
  userId: string,
  data: UserSession,
  ttl: number
): Promise<void> => {
  const sessionData = await mapUserToTokenData(data);
  await redis.setSession(
    `${PREFIX.SESSION}token:${userId}`,
    sessionData,
    "user-session",
    ttl
  );
};

/**
 * Handles caching user session data in Redis by email.
 *
 * Workflow:
 * 1. Maps the provided user data to a response format using mapUserToResponseByEmail.
 * 2. Stores the mapped data in Redis with the session email prefix and user email.
 *
 * @param email - The email address of the user.
 * @param data - The User entity to cache.
 * @returns A promise resolving when the session data is cached.
 */
export const setUserInfoByEmailInRedis = async (
  email: string,
  data: User
): Promise<void> => {
  const sessionData = await mapUserToResponseByEmail(data);
  await redis.setSession(
    `${PREFIX.SESSION}email:${email}`,
    sessionData,
    "user-session"
  );
};

/**
 * Handles removal of user session data from Redis by user ID.
 *
 * Workflow:
 * 1. Deletes the user session data from Redis using the session user prefix and user ID.
 *
 * @param userId - The ID of the user.
 * @returns A promise resolving when the session data is removed.
 */
export const removeUserInfoByUserIdInRedis = async (
  userId: string
): Promise<void> => {
  await redis.deleteSession(`${PREFIX.SESSION}user:${userId}`, "user-app");
};

/**
 * Handles removal of user token session data from Redis by user ID.
 *
 * Workflow:
 * 1. Deletes the token session data from Redis using the session token prefix and user ID.
 *
 * @param userId - The ID of the user.
 * @returns A promise resolving when the token data is removed.
 */
export const removeUserTokenInfoByUserIdFromRedis = async (
  userId: string
): Promise<void> => {
  await redis.deleteSession(`${PREFIX.SESSION}token:${userId}`, "user-session");
};

/**
 * Handles removal of user session data from Redis by email.
 *
 * Workflow:
 * 1. Deletes the user session data from Redis using the session email prefix and user email.
 *
 * @param email - The email address of the user.
 * @returns A promise resolving when the session data is removed.
 */
export const removeUserInfoByEmailFromRedis = async (
  email: string
): Promise<void> => {
  await redis.deleteSession(`${PREFIX.SESSION}email:${email}`, "user-session");
};

/**
 * Handles removal of cached user email data from Redis.
 *
 * Workflow:
 * 1. Deletes the email data from Redis using the email prefix and user email.
 *
 * @param email - The email address of the user.
 * @returns A promise resolving when the email data is removed.
 */
export const removeUserEmailFromRedis = async (
  email: string
): Promise<void> => {
  await redis.deleteSession(`${PREFIX.EMAIL}${email}`, "user-app");
};

/**
 * Handles removal of the cached total user count from Redis.
 *
 * Workflow:
 * 1. Deletes the user count from Redis using the count prefix for users.
 *
 * @returns A promise resolving when the count is removed.
 */
export const removeUserCountInDBFromRedis = async (): Promise<void> => {
  await redis.deleteSession(`${PREFIX.COUNT}user`, "user-app");
};
