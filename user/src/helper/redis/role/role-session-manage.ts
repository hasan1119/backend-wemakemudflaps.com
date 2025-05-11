import { CachedRoleInputs } from "../../../types";
import { redis } from "../redis";

//
// ===================== GETTERS =====================
//

/**
 * Get role info from Redis by role name.
 */
export const getRoleInfoByRoleNameFromRedis = async (
  roleName: string
): Promise<CachedRoleInputs | null> => {
  const roleInfo = await redis.getSession<CachedRoleInputs | null>(
    roleName.toLowerCase().trim()
  );
  return roleInfo;
};

/**
 * Get role info in Redis by role ID.
 */
export const getRoleInfoByRoleIdFromRedis = async (
  roleId: string
): Promise<CachedRoleInputs | null> => {
  return await redis.getSession<CachedRoleInputs | null>(roleId);
};

/**
 * Check if a role name exists in Redis.
 */
export const getRoleNameExistFromRedis = async (
  roleName: string
): Promise<boolean> => {
  const result = await redis.getSession<string | null>(
    roleName.toLowerCase().trim()
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
  data: CachedRoleInputs,
  ttl?: number
): Promise<void> => {
  await redis.setSession(roleName.toLowerCase().trim(), data, ttl);
};

/**
 * Set role info in Redis by role ID.
 */
export const setRoleInfoByRoleIdInRedis = async (
  roleId: string,
  data: CachedRoleInputs,
  ttl?: number
): Promise<void> => {
  await redis.setSession(roleId, data, ttl);
};

/**
 * Set existence flag in Redis for a given role name.
 */
export const setRoleNameExistInRedis = async (
  roleName: string,
  ttl?: number
): Promise<void> => {
  await redis.setSession(roleName.toLowerCase().trim(), "exists", ttl);
};
