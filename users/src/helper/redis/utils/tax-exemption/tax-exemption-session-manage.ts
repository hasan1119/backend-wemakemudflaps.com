import { TaxExemption } from "../../../../types";
import { redis } from "../../redis";

// Defines prefixes for Redis keys used for tax exemption caching
const PREFIX = {
  TAX_EXEMPTION: "tax-exemption:",
};

/**
 * Caches all tax exemption records for a user in Redis.
 *
 * @param userId - The user's ID.
 * @param data - The TaxExemption data to cache.
 */
export const setTaxExemptionByUserIdInRedis = async (
  userId: string,
  data: TaxExemption
): Promise<void> => {
  await redis.setSession(
    `${PREFIX.TAX_EXEMPTION}user:${userId}`,
    data,
    "user-app"
  );
};

/**
 * Retrieves all cached tax exemption records for a user.
 *
 * @param userId - The user's ID.
 * @returns An array of TaxExemption entities or null if not found.
 */
export const getTaxExemptionsByUserIdFromRedis = async (
  userId: string
): Promise<TaxExemption | null> => {
  return redis.getSession<TaxExemption | null>(
    `${PREFIX.TAX_EXEMPTION}user:${userId}`,
    "user-app"
  );
};

/**
 * Removes all cached tax exemption records for a user.
 *
 * @param userId - The user's ID.
 */
export const removeAllTaxExemptionByUserIdFromRedis = async (
  userId: string
): Promise<void> => {
  await redis.deleteSession(
    `${PREFIX.TAX_EXEMPTION}user:${userId}`,
    "user-app"
  );
};
