import Redis from "ioredis";
import config from "../config/config";

const redisClient = new Redis({
  host: config.REDIS_HOST,
  port: config.REDIS_PORT || 6379, // Default to 6379 if not set
  password: config.REDIS_PASSWORD || undefined,
});

redisClient.on("connect", () => console.log("Redis connected successfully."));
redisClient.on("error", (err) => console.error("Redis connection error:", err));

/**
 * Get a session from Redis
 * @param sessionId - The session ID (user ID or unique identifier)
 */
async function getSession<T>(sessionId: string): Promise<T | null> {
  try {
    const session = await redisClient.get(`session:${sessionId}`);
    return session ? (JSON.parse(session) as T) : null;
  } catch (error) {
    console.error("Error retrieving session from Redis:", error);
    return null;
  }
}

/**
 * Set a session in Redis
 * @param id - The ID
 * @param sessionData - The session data to store
 * @param ttl - Time to live in seconds (default: 3600 seconds = 1 hour)
 */
async function setSession(
  id: string,
  sessionData: object,
  ttl: number = config.REDIS_SESSION_TTL || 3600
): Promise<void> {
  try {
    await redisClient.set(
      `session:${id}`,
      JSON.stringify(sessionData),
      "EX",
      ttl
    );
  } catch (error) {
    console.error("Error setting session in Redis:", error);
  }
}

/**
 * Delete a session from Redis
 * @param id - The user ID
 */
async function deleteSession(id: string): Promise<void> {
  try {
    await redisClient.del(`session:${id}`);
  } catch (error) {
    console.error("Error deleting session from Redis:", error);
  }
}

export const redis = {
  getSession,
  setSession,
  deleteSession,
};
