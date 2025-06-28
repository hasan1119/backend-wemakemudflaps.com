import { Role } from "../../../../types";
import { redis } from "../../redis";

// Defines prefixes for Redis keys used for role caching
const PREFIX = {
  ROLES: "roles:",
  ROLES_COUNT: "roles-count:",
};

/**
 * Handles retrieval of cached roles from Redis based on query parameters.
 *
 * Workflow:
 * 1. Constructs a Redis key using page, limit, search term, sortBy, and sortOrder.
 * 2. Queries Redis to retrieve the cached roles array.
 * 3. Returns the parsed Role array or null if not found.
 *
 * @param page - The page number for pagination.
 * @param limit - The number of roles per page.
 * @param search - Optional search term or null for no search.
 * @param sortBy - The field to sort by (default: "createdAt").
 * @param sortOrder - The sort order (default: "desc").
 * @returns A promise resolving to the Role array or null if not found.
 */
export const getRolesFromRedis = async (
  page: number,
  limit: number,
  search: string | null,
  sortBy: string = "createdAt",
  sortOrder: string = "desc"
): Promise<Role[] | null> => {
  const searchKeyWord = search ? search.toLowerCase().trim() : "none";
  const key = `${PREFIX.ROLES}page:${page}:limit:${limit}:search:${searchKeyWord}:sort:${sortBy}:${sortOrder}`;
  return redis.getSession<Role[] | null>(key, "user-app");
};

/**
 * Handles retrieval of the cached total roles count from Redis.
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
export const getRolesCountFromRedis = async (
  search: string | null,
  sortBy: string = "createdAt",
  sortOrder: string = "desc"
): Promise<number | null> => {
  const searchKeyWord = search ? search.toLowerCase().trim() : "none";
  const key = `${PREFIX.ROLES_COUNT}search:${searchKeyWord}:sort:${sortBy}:${sortOrder}`;

  const result = await redis.getSession<string | null>(key, "user-app");

  if (result === null) {
    return null;
  }

  const count = Number(result);
  return isNaN(count) ? 0 : count;
};

/**
 * Handles caching roles in Redis based on query parameters.
 *
 * Workflow:
 * 1. Constructs a Redis key using page, limit, search term, sortBy, and sortOrder.
 * 2. Stores the provided roles array in Redis with an optional time-to-live (TTL).
 *
 * @param page - The page number for pagination.
 * @param limit - The number of roles per page.
 * @param search - Optional search term or null for no search.
 * @param sortBy - The field to sort by (default: "createdAt").
 * @param sortOrder - The sort order (default: "desc").
 * @param roles - The array of Role data to cache.
 * @returns A promise resolving when the roles are cached.
 */
export const setRolesInRedis = async (
  page: number,
  limit: number,
  search: string | null,
  sortBy: string = "createdAt",
  sortOrder: string = "desc",
  roles: Role[]
): Promise<void> => {
  const searchKeyWord = search ? search.toLowerCase().trim() : "none";
  const key = `${PREFIX.ROLES}page:${page}:limit:${limit}:search:${searchKeyWord}:sort:${sortBy}:${sortOrder}`;
  await redis.setSession(key, roles, "user-app");
};

/**
 * Handles caching the total roles count in Redis.
 *
 * Workflow:
 * 1. Constructs a Redis key using search term, sortBy, and sortOrder.
 * 2. Stores the total count as a string in Redis with an optional time-to-live (TTL).
 *
 * @param search - Optional search term or null for no search.
 * @param sortBy - The field to sort by (default: "createdAt").
 * @param sortOrder - The sort order (default: "desc").
 * @param total - The total roles count to cache.
 * @returns A promise resolving when the count is cached.
 */
export const setRolesCountInRedis = async (
  search: string | null,
  sortBy: string = "createdAt",
  sortOrder: string = "desc",
  total: number
): Promise<void> => {
  const searchKeyWord = search ? search.toLowerCase().trim() : "none";
  const key = `${PREFIX.ROLES_COUNT}search:${searchKeyWord}:sort:${sortBy}:${sortOrder}`;
  await redis.setSession(key, total.toString(), "user-app");
};

/**
 * Deletes all Redis cache entries related to role list and count.
 *
 * Order of deletion:
 * 1. Delete list-related keys (paginated data)
 * 2. Delete count-related keys (total counts)
 */
export const clearAllRoleSearchCache = async (): Promise<void> => {
  const keys = await redis.getAllSessionKey("user-app");

  const listKeys = keys.filter((key) => key.startsWith(PREFIX.ROLES));
  const countKeys = keys.filter((key) => key.startsWith(PREFIX.ROLES_COUNT));

  // Delete list keys first
  if (listKeys.length > 0) {
    await Promise.all(
      listKeys.map((key) => redis.deleteSession(key, "user-app"))
    );
  }

  // Then delete count keys
  if (countKeys.length > 0) {
    await Promise.all(
      countKeys.map((key) => redis.deleteSession(key, "user-app"))
    );
  }
};
