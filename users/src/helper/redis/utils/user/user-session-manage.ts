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
 * Handles retrieval of cached users and total count from Redis based on query parameters.
 * Workflow:
 * Constructs a Redis key using page, limit, search term, sortBy, and sortOrder for users.
 * Constructs a Redis key using search term, sortBy, and sortOrder for count.
 * Queries Redis to retrieve the cached users array and count concurrently.
 * Returns an object containing the parsed User array and count, or null if not found.
 * @param page - The page number for pagination.
 * @param limit - The number of users per page.
 * @param search - Optional search term or null for no search.
 * @param sortBy - The field to sort by (default: "createdAt").
 * @param sortOrder - The sort order (default: "desc").
 * @returns A promise resolving to an object with users (User array or null) and count (number or null).
 */
export const getUsersAndCountFromRedis = async (
  page: number,
  limit: number,
  search: string | null,
  sortBy: string = "createdAt",
  sortOrder: string = "desc"
): Promise<{ users: User[] | null; count: number | null }> => {
  const searchKeyWord = search ? search.toLowerCase().trim() : "none";
  const usersKey = `${PREFIX.USERS}page:${page}:limit:${limit}:search:${searchKeyWord}:sort:${sortBy}:${sortOrder}`;
  const countKey = `${PREFIX.USERS}count:search:${searchKeyWord}:sort:${sortBy}:${sortOrder}`;

  const [usersResult, countResult] = await Promise.all([
    redis.getSession<User[] | null>(usersKey, "user-app"),
    redis.getSession<string | null>(countKey, "user-app"),
  ]);

  const count =
    countResult !== null
      ? isNaN(Number(countResult))
        ? 0
        : Number(countResult)
      : null;

  return { users: usersResult, count };
};

/**
 * Handles caching of users and total count in Redis based on query parameters.
 * Workflow:
 * Constructs a Redis key using page, limit, search term, sortBy, and sortOrder for users.
 * Constructs a Redis key using search term, sortBy, and sortOrder for count.
 * Stores the users array and count in Redis with the specified TTL.
 * @param page - The page number for pagination.
 * @param limit - The number of users per page.
 * @param search - Optional search term or null for no search.
 * @param sortBy - The field to sort by (default: "createdAt").
 * @param sortOrder - The sort order (default: "desc").
 * @param users - The array of User data to cache.
 * @param total - The total users count to cache.
 * @param ttl - Optional time-to-live in seconds (default: 3600).
 * @returns A promise resolving when the users and count are cached.
 */
export const setUsersAndCountInRedis = async (
  page: number,
  limit: number,
  search: string | null,
  sortBy: string = "createdAt",
  sortOrder: string = "desc",
  users: User[],
  total: number,
  ttl: number = 3600
): Promise<void> => {
  const searchKeyWord = search ? search.toLowerCase().trim() : "none";
  const usersKey = `${PREFIX.USERS}page:${page}:limit:${limit}:search:${searchKeyWord}:sort:${sortBy}:${sortOrder}`;
  const countKey = `${PREFIX.USERS}count:search:${searchKeyWord}:sort:${sortBy}:${sortOrder}`;

  await Promise.all([
    redis.setSession(usersKey, users, "user-app", ttl),
    redis.setSession(countKey, total.toString(), "user-app", ttl),
  ]);
};

/**
 * Handles removal of cached users and count data from Redis.
 * Workflow:
 * Retrieves all keys in the "user-app" namespace.
 * Filters keys that start with the users or users count prefix.
 * Deletes all matching keys concurrently.
 * @returns A promise resolving when the users and count data are removed.
 */
export const clearUsersAndCountCache = async (): Promise<void> => {
  const keys = await redis.getAllSessionKey("user-app");
  const relevantKeys = keys.filter(
    (key) =>
      key.startsWith(PREFIX.USERS) || key.startsWith(`${PREFIX.USERS}count:`)
  );

  if (relevantKeys.length > 0) {
    await Promise.all(
      relevantKeys.map((key) => redis.deleteSession(key, "user-app"))
    );
  }
};

/**
 * Handles retrieval of cached user email data from Redis.
 * Workflow:
 * Queries Redis using the email prefix and user email.
 * Returns the cached email data or null if not found.
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
 * Workflow:
 * Queries Redis using the count prefix for users.
 * Converts the result to a number or returns null if not found.
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
 * Workflow:
 * Queries Redis using the session token prefix and session ID.
 * Returns the parsed UserSession or null if not found.
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
 * Workflow:
 * Queries Redis using the session user prefix and user ID.
 * Returns the parsed UserSessionById or null if not found.
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
 * Workflow:
 * Queries Redis using the session email prefix and user email.
 * Returns the parsed UserSessionByEmail or null if not found.
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
 * Workflow:
 * Stores the provided email data in Redis with the email prefix and user email.
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
 * Workflow:
 * Stores the user count as a string in Redis with the count prefix for users.
 * @param count - The user count to cache.
 * @returns A promise resolving when the count is cached.
 */
export const setUserCountInDBInRedis = async (count: number): Promise<void> => {
  await redis.setSession(`${PREFIX.COUNT}user`, count.toString(), "user-app");
};

/**
 * Handles caching user session data in Redis by user ID.
 * Workflow:
 * Maps the provided user data to a response format using mapUserToResponseById.
 * Stores the mapped data in Redis with the session user prefix and user ID.
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
 * Workflow:
 * Maps the provided user session data to a token format using mapUserToTokenData.
 * Stores the mapped data in Redis with the session token prefix, session ID, and specified TTL.
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
 * Workflow:
 * Maps the provided user data to a response format using mapUserToResponseByEmail.
 * Stores the mapped data in Redis with the session email prefix and user email.
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
 * Workflow:
 * Deletes the username data from Redis using the username prefix and username.
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
 * Workflow:
 * Deletes the user session data from Redis using the session user prefix and user ID.
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
 * Workflow:
 * Deletes the token session data from Redis using the session token prefix and session ID.
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
 * Workflow:
 * Deletes the user session data from Redis using the session email prefix and user email.
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
 * Workflow:
 * Deletes the email data from Redis using the email prefix and user email.
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
 * Workflow:
 * Deletes the user count from Redis using the count prefix for users.
 * @returns A promise resolving when the count is removed.
 */
export const removeUserCountInDBFromRedis = async (): Promise<void> => {
  await redis.deleteSession(`${PREFIX.COUNT}user`, "user-app");
};
