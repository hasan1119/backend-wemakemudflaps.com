import Redis from "ioredis";
import config from "../../config/config";

/**
 * Initializes and configures a Redis client instance.
 *
 * Workflow:
 * 1. Creates a Redis client with host, port, and optional password from configuration.
 * 2. Sets up event listeners for connection success and errors.
 */
const redisClient = new Redis({
  host: config.REDIS_HOST,
  port: config.REDIS_PORT || 6379, // Default to 6379 if not set
  password: config.REDIS_PASSWORD || undefined,
});

redisClient.on("connect", () => console.log("Redis connected successfully."));
redisClient.on("error", (err) => console.error("Redis connection error:", err));

/**
 * Handles retrieval of a session from Redis.
 *
 * Workflow:
 * 1. Queries Redis for the session data by session ID.
 * 2. Parses the retrieved data as the specified type or returns null if not found.
 * 3. Catches and logs any errors during retrieval.
 *
 * @param sessionId - The session ID (user ID or unique identifier).
 * @returns A promise resolving to the parsed session data or null if not found.
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
 * Handles storing a session in Redis.
 *
 * Workflow:
 * 1. Stringifies the session data and stores it in Redis with the specified ID.
 * 2. Applies an optional time-to-live (TTL) if provided.
 * 3. Catches and logs any errors during storage.
 *
 * @param id - The session ID (user ID or unique identifier).
 * @param sessionData - The session data to store (object or string).
 * @param ttl - Optional time-to-live in seconds.
 * @returns A promise resolving when the session is stored.
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
 * Handles deletion of a session from Redis.
 *
 * Workflow:
 * 1. Deletes the session data from Redis using the specified ID.
 * 2. Catches and logs any errors during deletion.
 *
 * @param id - The session ID (user ID or unique identifier).
 * @returns A promise resolving when the session is deleted.
 */
async function deleteSession(id: string): Promise<void> {
  try {
    await redisClient.del(`${id}`);
  } catch (error) {
    console.error("Error deleting session from Redis:", error);
  }
}

/**
 * Exports Redis session management utilities.
 *
 * Workflow:
 * 1. Provides functions for getting, setting, and deleting sessions in Redis.
 */
export const redis = {
  getSession,
  setSession,
  deleteSession,
};
