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
  USERS: "users:",
  USERNAME: "username:",
};

/**
 * Handles retrieval of cached users from Redis based on query parameters.
 *
 * Workflow:
 * 1. Constructs a Redis key using page, limit, search term, sortBy, and sortOrder.
 * 2. Queries Redis to retrieve the cached users array.
 * 3. Returns the parsed User array or null if not found.
 *
 * @param page - The page number for pagination.
 * @param limit - The number of users per page.
 * @param search - Optional search term or null for no search.
 * @param sortBy - The field to sort by (default: "createdAt").
 * @param sortOrder - The sort order (default: "desc").
 * @returns A promise resolving to the User array or null if not found.
 */
export const getUsersFromRedis = async (
  page: number,
  limit: number,
  search: string | null,
  sortBy: string = "createdAt",
  sortOrder: string = "desc"
): Promise<User[] | null> => {
  const searchKeyWord = search ? search.toLowerCase().trim() : "none";
  const key = `${PREFIX.USERS}page:${page}:limit:${limit}:search:${searchKeyWord}:sort:${sortBy}:${sortOrder}`;
  return redis.getSession<User[] | null>(key, "user-app");
};

/**
 * Handles retrieval of the cached total users count from Redis.
 *
 * Workflow:
 * 1. Constructs a Redis key using search term, sortBy, and sortOrder.
 * 2. Queries Redis to retrieve the cached count.
 * 3. Returns the parsed count as a number or null if not found, with 0 for invalid numbers.
 *
 * @param search - Optional search term or null for no search.
 * @param sortBy - The field to sort by (default: "createdAt").
 * @param sortOrder - The sort order (default: "desc").
 * @returns A promise resolving to the count or null if not found.
 */
export const getUsersCountFromRedis = async (
  search: string | null,
  sortBy: string = "createdAt",
  sortOrder: string = "desc"
): Promise<number | null> => {
  const searchKeyWord = search ? search.toLowerCase().trim() : "none";
  const key = `${PREFIX.USERS}count:search:${searchKeyWord}:sort:${sortBy}:${sortOrder}`;

  const result = await redis.getSession<string | null>(key, "user-app");

  if (result === null) {
    return null;
  }

  const count = Number(result);
  return isNaN(count) ? 0 : count;
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
 * Handles retrieval of user token session data from Redis by session ID.
 *
 * Workflow:
 * 1. Queries Redis using the session token prefix and session ID.
 * 2. Returns the parsed UserSession or null if not found.
 *
 * @param sessionId - The ID of the session.
 * @returns A promise resolving to the UserSession or null if not found.
 */
export const getUserTokenInfoByUserSessionIdFromRedis = async (
  sessionId: string
): Promise<UserSession | null> => {
  return redis.getSession<UserSession | null>(
    `${PREFIX.SESSION}token:${sessionId}`,
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
 * Handles caching users in Redis based on query parameters.
 *
 * Workflow:
 * 1. Constructs a Redis key using page, limit, search term, sortBy, and sortOrder.
 *
 * @param page - The page number for pagination.
 * @param limit - The number of users per page.
 * @param search - Optional search term or null for no search.
 * @param sortBy - The field to sort by (default: "createdAt").
 * @param sortOrder - The sort order (default: "desc").
 * @param users - The array of User data to cache.
 * @param ttl - Optional time-to-live in seconds(1 hr) (default: 3600).
 * @returns A promise resolving when the users are cached.
 */
export const setUsersInRedis = async (
  page: number,
  limit: number,
  search: string | null,
  sortBy: string = "createdAt",
  sortOrder: string = "desc",
  users: User[],
  ttl: number = 3600
): Promise<void> => {
  const searchKeyWord = search ? search.toLowerCase().trim() : "none";
  const key = `${PREFIX.USERS}page:${page}:limit:${limit}:search:${searchKeyWord}:sort:${sortBy}:${sortOrder}`;
  await redis.setSession(key, users, "user-app", ttl);
};

/**
 * Handles caching the total users count in Redis.
 *
 * Workflow:
 * 1. Constructs a Redis key using search term, sortBy, and sortOrder.
 *
 * @param search - Optional search term or null for no search.
 * @param sortBy - The field to sort by (default: "createdAt").
 * @param sortOrder - The sort order (default: "desc").
 * @param total - The total users count to cache.
 * @param ttl - Optional time-to-live in seconds(1 hr) (default: 3600).
 * @returns A promise resolving when the count is cached.
 */
export const setUsersCountInRedis = async (
  search: string | null,
  sortBy: string = "createdAt",
  sortOrder: string = "desc",
  total: number,
  ttl: number = 3600
): Promise<void> => {
  const searchKeyWord = search ? search.toLowerCase().trim() : "none";
  const key = `${PREFIX.USERS}count:search:${searchKeyWord}:sort:${sortBy}:${sortOrder}`;
  await redis.setSession(key, total.toString(), "user-app", ttl);
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
 * Handles caching user token session data in Redis by session ID.
 *
 * Workflow:
 * 1. Maps the provided user session data to a token format using mapUserToTokenData.
 * 2. Stores the mapped data in Redis with the session token prefix, session ID, and specified TTL.
 *
 * @param sessionId - The ID of the session.
 * @param data - The UserSession data to cache.
 * @param ttl - Time-to-live in seconds.
 * @returns A promise resolving when the token data is cached.
 */
export const setUserTokenInfoByUserSessionIdInRedis = async (
  sessionId: string,
  data: UserSession,
  ttl: number
): Promise<void> => {
  const sessionData = await mapUserToTokenData(data);
  await redis.setSession(
    `${PREFIX.SESSION}token:${sessionId}`,
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
 * Handles removal of cached username data from Redis.
 *
 * Workflow:
 * 1. Deletes the username data from Redis using the username prefix and username.
 *
 * @param username - The username of the user.
 * @returns A promise resolving when the username data is removed.
 */
export const removeUserUsernameFromRedis = async (
  username: string
): Promise<void> => {
  await redis.deleteSession(`${PREFIX.USERNAME}${username}`, "user-app");
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
 * Handles removal of user token session data from Redis by session ID.
 *
 * Workflow:
 * 1. Deletes the token session data from Redis using the session token prefix and session ID.
 *
 * @param sessionId - The ID of the session.
 * @returns A promise resolving when the token data is removed.
 */
export const removeUserTokenInfoByUserSessionIdFromRedis = async (
  sessionId: string
): Promise<void> => {
  await redis.deleteSession(
    `${PREFIX.SESSION}token:${sessionId}`,
    "user-session"
  );
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

/**
 * Deletes all Redis cache entries related to user list and count.
 *
 * Order of deletion:
 * 1. Delete list-related keys (paginated data)
 * 2. Delete count-related keys (total counts)
 */
export const clearAllUserSearchCache = async (): Promise<void> => {
  const keys = await redis.getAllSessionKey("user-app");

  const listKeys = keys.filter((key) => key.startsWith(PREFIX.USERS));

  // Delete list and count keys
  await Promise.all(
    listKeys.map((key) => redis.deleteSession(key, "user-app"))
  );
};
