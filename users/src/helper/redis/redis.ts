import Redis from "ioredis";
import config from "../../config/config";

type SessionType = "user-session" | "user-app";

// Redis instance for user session data
const userSessionRedisClient = new Redis({
  host: config.REDIS_HOST,
  port: config.REDIS_PORT || 6379,
  password: config.REDIS_PASSWORD || undefined,
});

userSessionRedisClient.on("connect", () =>
  console.log("User Session Redis connected successfully.")
);
userSessionRedisClient.on("error", (err) =>
  console.error("User Session Redis connection error:", err)
);

// Redis instance for other session-related data
const appSessionRedisClient = new Redis({
  host: config.REDIS_HOST,
  port: config.REDIS_PORT || 6379,
  password: config.REDIS_PASSWORD || undefined,
  db: 1, // Use separate DB index (optional)
});

appSessionRedisClient.on("connect", () =>
  console.log("App Session Redis connected successfully.")
);
appSessionRedisClient.on("error", (err) =>
  console.error("App Session Redis connection error:", err)
);

/**
 * Retrieves all session keys from Redis for a given session type.
 *
 * Workflow:
 * 1. Uses Redis `keys` command with pattern matching to fetch relevant keys.
 * 2. Catches and logs any errors during key retrieval.
 *
 * @param type - The Redis session type ("user-session" | "user-app").
 * @returns A promise resolving to an array of matching keys.
 */
async function getAllSessionKey(
  type: SessionType = "user-app"
): Promise<string[]> {
  try {
    const client = getRedisClient(type);
    const keys = await client.keys("*");
    return keys;
  } catch (error) {
    console.error(`Error retrieving keys for ${type}:`, error);
    return [];
  }
}

// Utility to select client
function getRedisClient(type: SessionType) {
  return type === "user-session"
    ? userSessionRedisClient
    : appSessionRedisClient;
}

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
async function getSession<T>(
  sessionId: string,
  type: SessionType = "user-app"
): Promise<T | null> {
  try {
    const client = getRedisClient(type);
    const session = await client.get(sessionId);
    return session ? (JSON.parse(session) as T) : null;
  } catch (error) {
    console.error(`Error retrieving ${type} session from Redis:`, error);
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
  type: SessionType = "user-app",
  ttl?: number
): Promise<void> {
  try {
    const client = getRedisClient(type);
    const value = JSON.stringify(sessionData);
    ttl ? await client.set(id, value, "EX", ttl) : await client.set(id, value);
  } catch (error) {
    console.error(`Error setting ${type} session in Redis:`, error);
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
async function deleteSession(
  id: string,
  type: SessionType = "user-app"
): Promise<void> {
  try {
    const client = getRedisClient(type);
    await client.del(id);
  } catch (error) {
    console.error(`Error deleting ${type} session from Redis:`, error);
  }
}

// Export utility
export const redis = {
  getAllSessionKey,
  getSession,
  setSession,
  deleteSession,
};
