import { Role } from "../../../../entities";
import { RoleSession } from "../../../../types";
import { mapRoleToResponse } from "../../../../utils/mapper";
import { redis } from "../../redis";

// Defines prefixes for Redis keys used for role session and user count caching
const PREFIX = {
  ROLE: "role:",
  EXISTS: "role-exists:",
  ROLE_USER_COUNT: "role-user-count:",
  ROLES: "roles:",
  ROLES_COUNT: "roles-count:",
};

/**
 * Handles retrieval of cached roles and total count from Redis based on query parameters.
 *
 * Workflow:
 * 1. Constructs Redis keys using page, limit, search term, sortBy, and sortOrder for roles and count.
 * 2. Queries Redis to retrieve the cached roles array and count concurrently.
 * 3. Returns an object containing the parsed Role array and count, or null if not found.
 *
 * @param page - The page number for pagination.
 * @param limit - The number of roles per page.
 * @param search - Optional search term or null for no search.
 * @param sortBy - The field to sort by (default: "createdAt").
 * @param sortOrder - The sort order (default: "desc").
 * @returns A promise resolving to an object with roles (Role array or null) and count (number or null).
 */
export const getRolesAndCountFromRedis = async (
  page: number,
  limit: number,
  search: string | null,
  sortBy: string = "createdAt",
  sortOrder: string = "desc"
): Promise<{ roles: Role[] | null; count: number | null }> => {
  const searchKeyWord = search ? search.toLowerCase().trim() : "none";
  const rolesKey = `${PREFIX.ROLES}page:${page}:limit:${limit}:search:${searchKeyWord}:sort:${sortBy}:${sortOrder}`;
  const countKey = `${PREFIX.ROLES_COUNT}search:${searchKeyWord}:sort:${sortBy}:${sortOrder}`;

  const [rolesResult, countResult] = await Promise.all([
    redis.getSession<Role[] | null>(rolesKey, "user-app"),
    redis.getSession<string | null>(countKey, "user-app"),
  ]);

  const count =
    countResult !== null
      ? isNaN(Number(countResult))
        ? 0
        : Number(countResult)
      : null;

  return { roles: rolesResult, count };
};

/**
 * Handles caching of roles and total count in Redis based on query parameters.
 *
 * Workflow:
 * 1. Constructs Redis keys using page, limit, search term, sortBy, and sortOrder for roles and count.
 * 2. Stores the roles array and count in Redis with the specified TTL.
 *
 * @param page - The page number for pagination.
 * @param limit - The number of roles per page.
 * @param search - Optional search term or null for no search.
 * @param sortBy - The field to sort by (default: "createdAt").
 * @param sortOrder - The sort order (default: "desc").
 * @param roles - The array of Role data to cache.
 * @param total - The total roles count to cache.
 * @param ttl - Optional time-to-live in seconds (default: 3600).
 * @returns A promise resolving when the roles and count are cached.
 */
export const setRolesAndCountInRedis = async (
  page: number,
  limit: number,
  search: string | null,
  sortBy: string = "createdAt",
  sortOrder: string = "desc",
  roles: Role[],
  total: number,
  ttl: number = 3600
): Promise<void> => {
  const searchKeyWord = search ? search.toLowerCase().trim() : "none";
  const rolesKey = `${PREFIX.ROLES}page:${page}:limit:${limit}:search:${searchKeyWord}:sort:${sortBy}:${sortOrder}`;
  const countKey = `${PREFIX.ROLES_COUNT}search:${searchKeyWord}:sort:${sortBy}:${sortOrder}`;

  await Promise.all([
    redis.setSession(rolesKey, roles, "user-app", ttl),
    redis.setSession(countKey, total.toString(), "user-app", ttl),
  ]);
};

/**
 * Handles removal of cached roles and count data from Redis.
 *
 * Workflow:
 * 1. Retrieves all keys in the "user-app" namespace.
 * 2. Filters keys that start with the roles or roles count prefix.
 * 3. Deletes all matching keys concurrently.
 *
 * @returns A promise resolving when the roles and count data are removed.
 */
export const clearRolesAndCountCache = async (): Promise<void> => {
  const keys = await redis.getAllSessionKey("user-app");
  const relevantKeys = keys.filter(
    (key) => key.startsWith(PREFIX.ROLES) || key.startsWith(PREFIX.ROLES_COUNT)
  );

  if (relevantKeys.length > 0) {
    await Promise.all(
      relevantKeys.map((key) => redis.deleteSession(key, "user-app"))
    );
  }
};

/**
 * Handles retrieval of role information from Redis by role name.
 *
 * Workflow:
 * 1. Queries Redis using the role prefix and normalized role name.
 * 2. Returns the parsed RoleSession or null if not found.
 *
 * @param roleName - The name of the role.
 * @returns A promise resolving to the RoleSession or null if not found.
 */
export const getRoleInfoByRoleNameFromRedis = async (
  roleName: string
): Promise<RoleSession | null> => {
  return redis.getSession<RoleSession | null>(
    `${PREFIX.ROLE}${roleName.toLowerCase().trim()}`,
    "user-app"
  );
};

/**
 * Handles retrieval of role information from Redis by role ID.
 *
 * Workflow:
 * 1. Queries Redis using the role prefix and role ID.
 * 2. Returns the parsed RoleSession or null if not found.
 *
 * @param roleId - The ID of the role.
 * @returns A promise resolving to the RoleSession or null if not found.
 */
export const getRoleInfoByRoleIdFromRedis = async (
  roleId: string
): Promise<RoleSession | null> => {
  return redis.getSession<RoleSession | null>(
    `${PREFIX.ROLE}${roleId}`,
    "user-app"
  );
};

/**
 * Handles checking if a role name exists in Redis.
 *
 * Workflow:
 * 1. Queries Redis using the exists prefix and normalized role name.
 * 2. Returns true if the role exists, false otherwise.
 *
 * @param roleName - The name of the role.
 * @returns A promise resolving to a boolean indicating if the role exists.
 */
export const getRoleNameExistFromRedis = async (
  roleName: string
): Promise<boolean> => {
  const result = await redis.getSession<string | null>(
    `${PREFIX.EXISTS}${roleName.toLowerCase().trim()}`,
    "user-app"
  );
  return result === "exists";
};

/**
 * Handles retrieval of the total user count for a role from Redis by role ID.
 *
 * Workflow:
 * 1. Queries Redis using the role user count prefix and role ID.
 * 2. Converts the result to a number, returning 0 if invalid or not found.
 *
 * @param roleId - The ID of the role.
 * @returns A promise resolving to the user count or 0 if not found.
 */
export const getTotalUserCountByRoleIdFromRedis = async (
  roleId: string
): Promise<number> => {
  const result = await redis.getSession<number | null>(
    `${PREFIX.ROLE_USER_COUNT}${roleId}`,
    "user-app"
  );

  const count = Number(result);
  return isNaN(count) ? 0 : count;
};

/**
 * Handles caching role information in Redis by role name.
 *
 * Workflow:
 * 1. Maps the provided role data to a response format using mapRoleToResponse.
 * 2. Stores the mapped data in Redis with the role prefix and normalized role name.
 *
 * @param roleName - The name of the role.
 * @param data - The Role entity to cache.
 * @returns A promise resolving when the role is cached.
 */
export const setRoleInfoByRoleNameInRedis = async (
  roleName: string,
  data: Role
): Promise<void> => {
  const sessionData = await mapRoleToResponse(data);
  await redis.setSession(
    `${PREFIX.ROLE}${roleName.toLowerCase().trim()}`,
    sessionData,
    "user-app"
  );
};

/**
 * Handles caching role information in Redis by role ID.
 *
 * Workflow:
 * 1. Maps the provided role data to a response format using mapRoleToResponse.
 * 2. Stores the mapped data in Redis with the role prefix and role ID.
 *
 * @param roleId - The ID of the role.
 * @param data - The Role entity to cache.
 * @returns A promise resolving when the role is cached.
 */
export const setRoleInfoByRoleIdInRedis = async (
  roleId: string,
  data: Role
): Promise<void> => {
  const sessionData = await mapRoleToResponse(data);
  await redis.setSession(`${PREFIX.ROLE}${roleId}`, sessionData, "user-app");
};

/**
 * Handles setting an existence flag for a role name in Redis.
 *
 * Workflow:
 * 1. Stores an "exists" flag in Redis with the exists prefix and normalized role name.
 *
 * @param roleName - The name of the role.
 * @returns A promise resolving when the flag is set.
 */
export const setRoleNameExistInRedis = async (
  roleName: string
): Promise<void> => {
  await redis.setSession(
    `${PREFIX.EXISTS}${roleName.toLowerCase().trim()}`,
    "exists",
    "user-app"
  );
};

/**
 * Handles caching the total user count for a role in Redis by role ID.
 *
 * Workflow:
 * 1. Stores the user count as a string in Redis with the role user count prefix and role ID.
 *
 * @param roleId - The ID of the role.
 * @param count - The user count to cache.
 * @returns A promise resolving when the count is cached.
 */
export const setTotalUserCountByRoleIdInRedis = async (
  roleId: string,
  count: number
): Promise<void> => {
  await redis.setSession(
    `${PREFIX.ROLE_USER_COUNT}${roleId}`,
    count.toString(),
    "user-app"
  );
};

/**
 * Handles removal of role information from Redis by role name.
 *
 * Workflow:
 * 1. Deletes the role data from Redis using the role prefix and normalized role name.
 *
 * @param roleName - The name of the role.
 * @returns A promise resolving when the role data is removed.
 */
export const removeRoleInfoByRoleNameFromRedis = async (
  roleName: string
): Promise<void> => {
  await redis.deleteSession(
    `${PREFIX.ROLE}${roleName.toLowerCase().trim()}`,
    "user-app"
  );
};

/**
 * Handles removal of role information from Redis by role ID.
 *
 * Workflow:
 * 1. Deletes the role data from Redis using the role prefix and role ID.
 *
 * @param roleId - The ID of the role.
 * @returns A promise resolving when the role data is removed.
 */
export const removeRoleInfoByRoleIdFromRedis = async (
  roleId: string
): Promise<void> => {
  await redis.deleteSession(`${PREFIX.ROLE}${roleId}`, "user-app");
};

/**
 * Handles removal of the existence flag for a role name from Redis.
 *
 * Workflow:
 * 1. Deletes the existence flag from Redis using the exists prefix and normalized role name.
 *
 * @param roleName - The name of the role.
 * @returns A promise resolving when the flag is removed.
 */
export const removeRoleNameExistFromRedis = async (
  roleName: string
): Promise<void> => {
  await redis.deleteSession(
    `${PREFIX.EXISTS}${roleName.toLowerCase().trim()}`,
    "user-app"
  );
};

/**
 * Handles removal of the cached user count for a role from Redis.
 *
 * Workflow:
 * 1. Deletes the user count from Redis using the role user count prefix and role ID.
 *
 * @param roleId - The ID of the role.
 * @returns A promise resolving when the count is removed.
 */
export const removeTotalUserCountByRoleIdFromRedis = async (
  roleId: string
): Promise<void> => {
  await redis.deleteSession(`${PREFIX.ROLE_USER_COUNT}${roleId}`, "user-app");
};
