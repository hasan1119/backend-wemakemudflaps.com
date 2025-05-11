// Assuming this exists based on your usage
import { CachedUserPermissionsInputs } from "../../../types";
import { redis } from "../redis";

//
// ===================== GETTERS =====================
//

/**
 * Set user permission data by user id Redis by userId.
 */
export const setUserPermissionsInRedis = async (
  userId: string,
  permissions: CachedUserPermissionsInputs[],
  ttl?: number
): Promise<void> => {
  await redis.setSession(userId, permissions, ttl);
};

//
// ===================== SETTERS =====================
//

/**
 * Get user permission data by user id Redis by userId.
 */
export const getUserPermissionsFromRedis = async (
  userId: string
): Promise<CachedUserPermissionsInputs[] | null> => {
  const permissions = await redis.getSession<
    CachedUserPermissionsInputs[] | null
  >(userId);
  return permissions;
};
