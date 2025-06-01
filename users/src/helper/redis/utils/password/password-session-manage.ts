import { redis } from "../../redis";

// Defines prefix for Redis keys used for password reset session caching
const PREFIX = {
  RESET_LAST_SENT: "reset-password-last-sent:",
};

/**
 * Handles retrieval of the last password reset request timestamp from Redis.
 *
 * Workflow:
 * 1. Queries Redis using the reset last sent prefix and user email.
 * 2. Converts the stored timestamp string to a number or returns null if not found.
 *
 * @param email - The email address of the user.
 * @returns A promise resolving to the timestamp of the last reset request or null if not found.
 */
export const getLastResetRequestFromRedis = async (
  email: string
): Promise<number | null> => {
  const timestamp = await redis.getSession<string | null>(
    `${PREFIX.RESET_LAST_SENT}${email}`
  );
  return timestamp ? Number(timestamp) : null;
};

/**
 * Handles storing the last password reset request timestamp in Redis.
 *
 * Workflow:
 * 1. Stores the current timestamp in Redis with the reset last sent prefix and user email.
 * 2. Applies an optional time-to-live (TTL) for the stored data.
 *
 * @param email - The email address of the user.
 * @param ttl - Optional time-to-live in seconds (default: 60).
 * @returns A promise resolving when the timestamp is stored.
 */
export const setLastResetRequestInRedis = async (
  email: string,
  ttl: number = 60
): Promise<void> => {
  await redis.setSession(
    `${PREFIX.RESET_LAST_SENT}${email}`,
    Date.now().toString(),
    ttl
  );
};
