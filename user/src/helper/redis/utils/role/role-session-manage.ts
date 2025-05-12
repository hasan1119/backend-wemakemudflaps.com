import { CachedRoleInputs } from "../../../../types";
import { redis } from "../../redis";

// Prefix for Redis keys
const PREFIX = {
  ROLE: "role:",
  EXISTS: "role-exists:",
};

//
// ===================== GETTERS =====================
//

/**
 * Get role info from Redis by role name.
 */
export const getRoleInfoByRoleNameFromRedis = async (
  roleName: string
): Promise<CachedRoleInputs | null> => {
  return redis.getSession<CachedRoleInputs | null>(
    `${PREFIX.ROLE}${roleName.toLowerCase().trim()}`
  );
};

/**
 * Get role info from Redis by role ID.
 */
export const getRoleInfoByRoleIdFromRedis = async (
  roleId: string
): Promise<CachedRoleInputs | null> => {
  return redis.getSession<CachedRoleInputs | null>(`${PREFIX.ROLE}${roleId}`);
};

/**
 * Get if a role name exists in Redis.
 */
export const getRoleNameExistFromRedis = async (
  roleName: string
): Promise<boolean> => {
  const result = await redis.getSession<string | null>(
    `${PREFIX.EXISTS}${roleName.toLowerCase().trim()}`
  );
  return result === "exists";
};

//
// ===================== SETTERS =====================
//

/**
 * Set role info in Redis by role name.
 */
export const setRoleInfoByRoleNameInRedis = async (
  roleName: string,
  data: CachedRoleInputs
): Promise<void> => {
  await redis.setSession(
    `${PREFIX.ROLE}${roleName.toLowerCase().trim()}`,
    data
  );
};

/**
 * Set role info in Redis by role ID.
 */
export const setRoleInfoByRoleIdInRedis = async (
  roleId: string,
  data: CachedRoleInputs
): Promise<void> => {
  await redis.setSession(`${PREFIX.ROLE}${roleId}`, data);
};

/**
 * Set existence flag in Redis for a given role name.
 */
export const setRoleNameExistInRedis = async (
  roleName: string
): Promise<void> => {
  await redis.setSession(
    `${PREFIX.EXISTS}${roleName.toLowerCase().trim()}`,
    "exists"
  );
};
