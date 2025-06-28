import { User } from "../../../../types";
import { redis } from "../../redis";

// Defines prefix for Redis keys used for user caching
const PREFIX = {
  USERS: "users:",
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
 * @returns A promise resolving when the users are cached.
 */
export const setUsersInRedis = async (
  page: number,
  limit: number,
  search: string | null,
  sortBy: string = "createdAt",
  sortOrder: string = "desc",
  users: User[]
): Promise<void> => {
  const searchKeyWord = search ? search.toLowerCase().trim() : "none";
  const key = `${PREFIX.USERS}page:${page}:limit:${limit}:search:${searchKeyWord}:sort:${sortBy}:${sortOrder}`;
  await redis.setSession(key, users, "user-app");
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
 * @returns A promise resolving when the count is cached.
 */
export const setUsersCountInRedis = async (
  search: string | null,
  sortBy: string = "createdAt",
  sortOrder: string = "desc",
  total: number
): Promise<void> => {
  const searchKeyWord = search ? search.toLowerCase().trim() : "none";
  const key = `${PREFIX.USERS}count:search:${searchKeyWord}:sort:${sortBy}:${sortOrder}`;
  await redis.setSession(key, total.toString(), "user-app");
};

/**
 * Handles removal of cached users and user count from Redis.
 *
 * Workflow:
 * 1. Constructs Redis keys for users and count using page, limit, search term, sortBy, and sortOrder.
 * 2. Deletes both the users array and count from Redis concurrently.
 *
 * @param page - The page number for pagination.
 * @param limit - The number of users per page.
 * @param search - Optional search term or null for no search.
 * @param sortBy - The field to sort by (default: "createdAt").
 * @param sortOrder - The sort order (default: "desc").
 * @returns A promise resolving when the data is removed.
 */
export const removeUsersFromRedis = async (
  page: number,
  limit: number,
  search: string | null,
  sortBy: string = "createdAt",
  sortOrder: string = "desc"
): Promise<void> => {
  const searchKeyWord = search ? search.toLowerCase().trim() : "none";

  const usersKey = `${PREFIX.USERS}page:${page}:limit:${limit}:search:${searchKeyWord}:sort:${sortBy}:${sortOrder}`;
  const countKey = `${PREFIX.USERS}count:search:${searchKeyWord}:sort:${sortBy}:${sortOrder}`;

  await Promise.all([
    redis.deleteSession(usersKey, "user-app"),
    redis.deleteSession(countKey, "user-app"),
  ]);
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
