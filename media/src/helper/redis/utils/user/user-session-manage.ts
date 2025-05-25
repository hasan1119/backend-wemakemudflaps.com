import { UserSession } from "../../../../types";
import { redis } from "../../redis";

// Prefixes for Redis keys
const PREFIX = {
  SESSION: "session:",
};

//
// ===================== GETTERS =====================
//

/**
 * Get user token session data by user ID.
 */
export const getUserTokenInfoByUserIdFromRedis = async (
  userId: string
): Promise<UserSession | null> => {
  return redis.getSession<UserSession | null>(
    `${PREFIX.SESSION}token:${userId}`
  );
};

//
// ===================== SETTERS =====================
//

/**
 * Set user token session data in Redis by user ID with optional TTL.
 */
export const setUserTokenInfoByUserIdInRedis = async (
  userId: string,
  data: UserSession,
  ttl: number
): Promise<void> => {
  await redis.setSession(`${PREFIX.SESSION}token:${userId}`, data, ttl);
};
