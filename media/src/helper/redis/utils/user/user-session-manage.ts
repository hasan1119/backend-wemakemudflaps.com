import { UserSession, UserSessionByEmail } from "../../../../types";
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
 * Handles retrieval of user session data from Redis by email.
 *
 * Workflow:
 * 1. Queries Redis using the session email prefix and user email.
 * 2. Returns the parsed UserSessionByEmail or null if not found.
 *
 * @param email - The email address of the user.
 * @returns A promise resolving to the UserSessionByEmail or null if not found.
 */
export const getUserInfoByEmailFromRedis = async (
  email: string
): Promise<UserSessionByEmail | null> => {
  return redis.getSession<UserSessionByEmail | null>(
    `${PREFIX.SESSION}email:${email}`
  );
};
