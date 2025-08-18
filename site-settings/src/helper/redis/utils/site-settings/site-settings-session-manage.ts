import { ShopAddress, SiteSettings } from "../../../../types";
import { redis } from "../../redis";

// Defines prefixes for Redis keys used for site settings caching
const PREFIX = {
  SITE_SETTINGS: "site-settings",
  SHOP_ADDRESSES_LIST: "shop-addresses-list:",
  SHOP_ADDRESSES_COUNT: "shop-addresses-count:",
  SHOP_ADDRESS: "shop-address:",
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

/**
 * Retrieves cached shop addresses list and count from Redis.
 *
 * @param page - Page number for pagination
 * @param limit - Number of items per page
 * @param search - Search string or null
 * @returns Object containing shopAddresses array or null, and count number or null
 */
export const getShopAddressesFromRedis = async (
  page: number,
  limit: number,
  search: string | null,
  forCustomer: boolean
): Promise<{ shopAddresses: ShopAddress[] | null; count: number | null }> => {
  const searchKey = search ? search.toLowerCase().trim() : "none";
  const listKey = `${PREFIX.SHOP_ADDRESSES_LIST}page:${page}:limit:${limit}:search:${searchKey}:forCustomer:${forCustomer}`;
  const countKey = `${PREFIX.SHOP_ADDRESSES_COUNT}search:${searchKey}:forCustomer:${forCustomer}`;

  const [listResult, countResult] = await Promise.all([
    redis.getSession<ShopAddress[] | null>(listKey, "site-settings"),
    redis.getSession<string | null>(countKey, "site-settings"),
  ]);

  const count =
    countResult !== null
      ? isNaN(Number(countResult))
        ? 0
        : Number(countResult)
      : null;

  return { shopAddresses: listResult, count };
};

/**
 * Caches shop addresses list and count in Redis.
 *
 * @param page - Page number for pagination
 * @param limit - Number of items per page
 * @param search - Search string or null
 * @param shopAddresses - Array of shop address objects to cache
 * @param total - Total count of shop addresses
 * @param ttl - Time to live in seconds (default 3600)
 */
export const setShopAddressesToRedis = async (
  page: number,
  limit: number,
  search: string | null,
  shopAddresses: ShopAddress[],
  total: number,
  ttl: number = 3600,
  forCustomer: boolean
): Promise<void> => {
  const searchKey = search ? search.toLowerCase().trim() : "none";
  const listKey = `${PREFIX.SHOP_ADDRESSES_LIST}page:${page}:limit:${limit}:search:${searchKey}:forCustomer:${forCustomer}`;
  const countKey = `${PREFIX.SHOP_ADDRESSES_COUNT}search:${searchKey}:forCustomer:${forCustomer}`;

  await Promise.all([
    redis.setSession(listKey, shopAddresses, "site-settings", ttl),
    redis.setSession(countKey, total.toString(), "site-settings", ttl),
  ]);
};

/**
 * Clears cached shop addresses list and count from Redis.
 */
export const clearShopAddressesCache = async (): Promise<void> => {
  const keys = await redis.getAllSessionKey("site-settings");
  const relevantKeys = keys.filter(
    (key) =>
      key.startsWith(PREFIX.SHOP_ADDRESSES_LIST) ||
      key.startsWith(PREFIX.SHOP_ADDRESSES_COUNT)
  );

  if (relevantKeys.length > 0) {
    await Promise.all(
      relevantKeys.map((key) => redis.deleteSession(key, "site-settings"))
    );
  }
};
