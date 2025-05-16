import { redis } from "../../redis";

const PREFIX = {
  RESET_LAST_SENT: "reset-password-last-sent:",
};

//
// ===================== GETTERS =====================
//

/**
 * Get last password reset request timestamp from Redis.
 */
export const getLastResetRequestFromRedis = async (
  email: string
): Promise<number | null> => {
  const timestamp = await redis.getSession<string | null>(
    `${PREFIX.RESET_LAST_SENT}${email}`
  );
  return timestamp ? Number(timestamp) : null;
};

//
// ===================== SETTERS =====================
//

/**
 * Set last password reset request timestamp in Redis.
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
