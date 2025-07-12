import { TaxRate } from "../../../../types";
import { redis } from "../../redis";

// Defines prefixes for Redis keys used for tax rate session and label existence caching
const PREFIX = {
  RATE: "tax-rate:",
  EXISTS: "tax-rate-exists:",
  COUNT: "tax-rate-count:",
  LIST: "tax-rate-list:",
};

/**
 * Retrieves a paginated list of tax rates from Redis cache.
 *
 * @param page - Current page number.
 * @param limit - Number of rates per page.
 * @param search - Search query (optional).
 * @param sortBy - Field to sort by (default is 'createdAt').
 * @param sortOrder - Sort order ('asc' or 'desc', default is 'desc').
 * @returns A promise resolving to an array of TaxRate or null.
 */
export const getTaxRatesFromRedis = async (
  page: number,
  limit: number,
  search: string = "",
  sortBy: string = "createdAt",
  sortOrder: string = "desc"
): Promise<TaxRate[] | null> => {
  const key = `${PREFIX.LIST}${page}:${limit}:${search}:${sortBy}:${sortOrder}`;
  return redis.getSession<TaxRate[] | null>(key, "product-app");
};

/**
 * Retrieves the total count of tax rates from Redis cache.
 *
 * @param search - Search query (optional).
 * @param sortBy - Field used for sorting.
 * @param sortOrder - Sort order.
 * @returns A promise resolving to the count of tax rates.
 */
export const getTaxRateCountFromRedis = async (
  search: string = "",
  sortBy: string = "createdAt",
  sortOrder: string = "desc"
): Promise<number> => {
  const key = `${PREFIX.COUNT}${search}:${sortBy}:${sortOrder}`;
  const result = await redis.getSession<number | null>(key, "product-app");
  const count = Number(result);
  return isNaN(count) ? 0 : count;
};

/**
 * Checks if a tax rate label exists in Redis.
 *
 * Workflow:
 * 1. Queries Redis using the EXISTS prefix and normalized label.
 * 2. Returns true if the label exists, false otherwise.
 *
 * @param label - The label of the tax rate.
 * @returns A promise resolving to a boolean indicating existence.
 */
export const getTaxRateLabelExistFromRedis = async (
  label: string
): Promise<boolean> => {
  const result = await redis.getSession<string | null>(
    `${PREFIX.EXISTS}${label.toLowerCase().trim()}`,
    "product-app"
  );
  return result === "exists";
};

/**
 * Retrieves tax rate information from Redis by rate ID.
 *
 * @param rateId - The ID of the tax rate.
 * @returns A promise resolving to the TaxRate or null if not found.
 */
export const getTaxRateInfoByIdFromRedis = async (
  rateId: string
): Promise<TaxRate | null> => {
  return redis.getSession<TaxRate | null>(
    `${PREFIX.RATE}${rateId}`,
    "product-app"
  );
};

/**
 * Caches a paginated list of tax rates in Redis.
 *
 * @param page - Current page number.
 * @param limit - Number of rates per page.
 * @param search - Search query.
 * @param sortBy - Field to sort by.
 * @param sortOrder - Sort order ('asc' or 'desc').
 * @param rates - Array of TaxRate to cache.
 * @param ttl - Optional time-to-live in seconds (default: 3600).
 */
export const setTaxRatesInRedis = async (
  page: number,
  limit: number,
  search: string,
  sortBy: string,
  sortOrder: string,
  rates: TaxRate[],
  ttl: number = 3600
): Promise<void> => {
  const key = `${PREFIX.LIST}${page}:${limit}:${search}:${sortBy}:${sortOrder}`;
  await redis.setSession(key, rates, "product-app", ttl);
};

/**
 * Caches the total tax rate count in Redis.
 *
 * @param search - Search query.
 * @param sortBy - Field used for sorting.
 * @param sortOrder - Sort order.
 * @param count - Total number of tax rates.
 * @param ttl - Optional time-to-live in seconds (default: 3600).
 */
export const setTaxRateCountInRedis = async (
  search: string,
  sortBy: string,
  sortOrder: string,
  count: number,
  ttl: number = 3600
): Promise<void> => {
  const key = `${PREFIX.COUNT}${search}:${sortBy}:${sortOrder}`;
  await redis.setSession(key, count.toString(), "product-app", ttl);
};

/**
 * Caches tax rate information in Redis by rate ID.
 *
 * @param rateId - The ID of the tax rate.
 * @param data - The TaxRate entity to cache.
 */
export const setTaxRateInfoByIdInRedis = async (
  rateId: string,
  data: TaxRate
): Promise<void> => {
  await redis.setSession(`${PREFIX.RATE}${rateId}`, data, "product-app");
};

/**
 * Sets an existence flag for a tax rate label in Redis.
 *
 * Workflow:
 * 1. Stores "exists" in Redis with the EXISTS prefix and normalized label.
 *
 * @param label - The label of the tax rate.
 */
export const setTaxRateLabelExistInRedis = async (
  label: string
): Promise<void> => {
  await redis.setSession(
    `${PREFIX.EXISTS}${label.toLowerCase().trim()}`,
    "exists",
    "product-app"
  );
};

/**
 * Removes cached tax rate information by rate ID from Redis.
 *
 * @param rateId - The ID of the tax rate.
 */
export const removeTaxRateInfoByIdFromRedis = async (
  rateId: string
): Promise<void> => {
  await redis.deleteSession(`${PREFIX.RATE}${rateId}`, "product-app");
};

/**
 * Removes the existence flag for a tax rate label from Redis.
 *
 * @param label - The label of the tax rate.
 */
export const removeTaxRateLabelExistFromRedis = async (
  label: string
): Promise<void> => {
  await redis.deleteSession(
    `${PREFIX.EXISTS}${label.toLowerCase().trim()}`,
    "product-app"
  );
};

/**
 * Deletes all Redis cache entries related to tax rate list and count.
 *
 * Order of deletion:
 * 1. Delete list-related keys (paginated data).
 * 2. Delete count-related keys (total counts).
 */
export const clearAllTaxRateSearchCache = async (): Promise<void> => {
  const keys = await redis.getAllSessionKey("product-app");

  const listKeys = keys.filter((key) => key.startsWith(PREFIX.LIST));
  const countKeys = keys.filter((key) => key.startsWith(PREFIX.COUNT));

  if (listKeys.length > 0) {
    await Promise.all(
      listKeys.map((key) => redis.deleteSession(key, "product-app"))
    );
  }

  if (countKeys.length > 0) {
    await Promise.all(
      countKeys.map((key) => redis.deleteSession(key, "product-app"))
    );
  }
};
