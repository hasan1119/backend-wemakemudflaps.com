import { RoleSession } from "../../../../types";
import { redis } from "../../redis";

// Defines prefixes for Redis keys used for role session and user count caching
const PREFIX = {
  ROLE: "role:",
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
    "user-session"
  );
};
