import Redis from "ioredis";
import config from "../../config/config";

/**
 * Creates and configures a Redis client instance.
 */
const redisClient = new Redis({
  host: config.REDIS_HOST,
  port: config.REDIS_PORT || 6379, // Default to 6379 if not set
  password: config.REDIS_PASSWORD || undefined,
});

redisClient.on("connect", () => console.log("Redis connected successfully."));
redisClient.on("error", (err) => console.error("Redis connection error:", err));

// ===================== SESSION OPERATIONS =====================

/**
 * Retrieves a session from Redis.
 *
 * @template T
 * @param {string} sessionId - The session ID (user ID or unique identifier).
 * @returns {Promise<T | null>} - The session data parsed as the specified type, or null if not found.
 */
async function getSession<T>(sessionId: string): Promise<T | null> {
  try {
    const session = await redisClient.get(`${sessionId}`);
    return session ? (JSON.parse(session) as T) : null;
  } catch (error) {
    console.error("Error retrieving session from Redis:", error);
    return null;
  }
}

/**
 * Stores a session in Redis.
 *
 * @param {string} id - The session ID (user ID or unique identifier).
 * @param {object | string} sessionData - The session data to store.
 * @param {number} [ttl] - Optional time-to-live (TTL) in seconds.
 * @returns {Promise<void>}
 */
async function setSession(
  id: string,
  sessionData: object | string,
  ttl?: number
): Promise<void> {
  try {
    if (ttl) {
      await redisClient.set(`${id}`, JSON.stringify(sessionData), "EX", ttl);
    } else {
      await redisClient.set(`${id}`, JSON.stringify(sessionData));
    }
  } catch (error) {
    console.error("Error setting session in Redis:", error);
  }
}

/**
 * Deletes a session from Redis.
 *
 * @param {string} id - The session ID (user ID or unique identifier).
 * @returns {Promise<void>}
 */
async function deleteSession(id: string): Promise<void> {
  try {
    await redisClient.del(`${id}`);
  } catch (error) {
    console.error("Error deleting session from Redis:", error);
  }
}

export const redis = {
  getSession,
  setSession,
  deleteSession,
};
