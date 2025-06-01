import { PermissionSession, RolePermissionSession } from "../../../../types";
import { redis } from "../../redis";

// Defines prefixes for Redis keys used for permission session caching
const PREFIX = {
  PERMISSIONS_USER: "permissions:user:",
};

/**
 * Handles retrieval of user permissions data from Redis by user ID.
 *
 * Workflow:
 * 1. Queries Redis using the user permissions prefix and user ID.
 * 2. Returns the parsed permissions data or null if not found.
 *
 * @param userId - The ID of the user.
 * @returns A promise resolving to the RolePermissionSession or PermissionSession array or null if not found.
 */
export const getUserPermissionsByUserIdFromRedis = async (
  userId: string
): Promise<RolePermissionSession[] | PermissionSession[] | null> => {
  return redis.getSession<RolePermissionSession[] | null>(
    `${PREFIX.PERMISSIONS_USER}${userId}`
  );
};
