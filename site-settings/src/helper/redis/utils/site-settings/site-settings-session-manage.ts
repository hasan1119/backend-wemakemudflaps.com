import { SiteSettings } from "../../../../types";
import { redis } from "../../redis";

// Defines prefixes for Redis keys used for site settings caching
const PREFIX = {
  SITE_SETTINGS: "site-settings",
};

/**
 * Retrieves site settings from Redis.
 *
 * @returns A promise resolving to SiteSettings or null if not found.
 */
export const getSiteSettingsFromRedis =
  async (): Promise<SiteSettings | null> => {
    return redis.getSession<SiteSettings | null>(
      `${PREFIX.SITE_SETTINGS}`,
      "site-settings"
    );
  };

/**
 * Sets site settings in Redis.
 *
 * @param siteSettings - The SiteSettings object to cache.
 * @returns A promise that resolves when the operation is complete.
 */
export const setSiteSettingsToRedis = async (
  siteSettings: SiteSettings
): Promise<void> => {
  await redis.setSession(
    `${PREFIX.SITE_SETTINGS}`,
    siteSettings,
    "site-settings"
  );
};
