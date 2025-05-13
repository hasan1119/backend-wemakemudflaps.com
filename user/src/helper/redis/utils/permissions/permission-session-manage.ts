import { CachedUserPermissionsInputs } from "../../../../types";
import { redis } from "../../redis";

// Prefix for Redis keys
const PREFIX = {
  PERMISSIONS: "permissions:",
};

//
// ===================== SETTERS =====================
//

/**
 * Set user permissions data in Redis by user ID.
 */
export const setUserPermissionsInRedis = async (
  userId: string,
  permissions: CachedUserPermissionsInputs[]
): Promise<void> => {
  await redis.setSession(`${PREFIX.PERMISSIONS}${userId}`, permissions);
};

//
// ===================== GETTERS =====================
//

/**
 * Get user permissions data from Redis by user ID.
 */
export const getUserPermissionsFromRedis = async (
  userId: string
): Promise<CachedUserPermissionsInputs[] | null> => {
  return redis.getSession<CachedUserPermissionsInputs[] | null>(
    `${PREFIX.PERMISSIONS}${userId}`
  );
};

//
// ===================== REMOVERS =====================
//

/**
 * Remove user permissions data from Redis by user ID.
 */
export const removeUserPermissionsFromRedis = async (
  userId: string
): Promise<void> => {
  return redis.deleteSession(`${PREFIX.PERMISSIONS}${userId}`);
};
