import { UserSession } from "../../../../types";
import { mapUserToTokenData } from "../../../../utils/mapper";
import { redis } from "../../redis";

// Defines prefixes for Redis keys used for user session, email, and count caching
const PREFIX = {
  SESSION: "session:",
};
/**
 * Handles retrieval of user token session data from Redis by user ID.
 *
 * Workflow:
 * 1. Queries Redis using the session token prefix and user ID.
 * 2. Returns the parsed UserSession or null if not found.
 *
 * @param userId - The ID of the user.
 * @returns A promise resolving to the UserSession or null if not found.
 */
export const getUserTokenInfoByUserIdFromRedis = async (
  userId: string
): Promise<UserSession | null> => {
  return redis.getSession<UserSession | null>(
    `${PREFIX.SESSION}token:${userId}`
  );
};

/**
 * Handles caching user token session data in Redis by user ID.
 *
 * Workflow:
 * 1. Maps the provided user session data to a token format using mapUserToTokenData.
 * 2. Stores the mapped data in Redis with the session token prefix, user ID, and specified TTL.
 *
 * @param userId - The ID of the user.
 * @param data - The UserSession data to cache.
 * @param ttl - Time-to-live in seconds.
 * @returns A promise resolving when the token data is cached.
 */
export const setUserTokenInfoByUserIdInRedis = async (
  userId: string,
  data: UserSession,
  ttl: number
): Promise<void> => {
  const sessionData = await mapUserToTokenData(data);
  await redis.setSession(`${PREFIX.SESSION}token:${userId}`, sessionData, ttl);
};
