import { Role } from "../../../../entities";
import { RoleSession } from "../../../../types";
import { mapRoleToResponse } from "../../../../utils/mapper";
import { redis } from "../../redis";

// Defines prefixes for Redis keys used for role session and user count caching
const PREFIX = {
  ROLE: "role:",
  EXISTS: "role-exists:",
  ROLE_USER_COUNT: "role-user-count:",
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
    `${PREFIX.ROLE}${roleName.toLowerCase().trim()}`
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
  return redis.getSession<RoleSession | null>(`${PREFIX.ROLE}${roleId}`);
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
    `${PREFIX.EXISTS}${roleName.toLowerCase().trim()}`
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
    `${PREFIX.ROLE_USER_COUNT}${roleId}`
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
    sessionData
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
  await redis.setSession(`${PREFIX.ROLE}${roleId}`, sessionData);
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
    "exists"
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
    count.toString()
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
  await redis.deleteSession(`${PREFIX.ROLE}${roleName.toLowerCase().trim()}`);
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
  await redis.deleteSession(`${PREFIX.ROLE}${roleId}`);
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
  await redis.deleteSession(`${PREFIX.EXISTS}${roleName.toLowerCase().trim()}`);
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
  await redis.deleteSession(`${PREFIX.ROLE_USER_COUNT}${roleId}`);
};
