import { TaxRate } from "../../../../entities";
import { TaxRateSession } from "../../../../types";
import { redis } from "../../redis";

// Defines prefixes for Redis keys used for tax rate session caching
const PREFIX = {
  RATE: "tax-rate:info:",
  EXISTS: "tax-rate-exists:",
  COUNT: "tax-rate-count:",
  LIST: "tax-rate-list:",
};

/**
 * Handles retrieval of cached tax rates and total count for a specific tax class from Redis based on query parameters.
 *
 * Workflow:
 * 1. Constructs Redis keys using taxClassId, page, limit, search term, sortBy, and sortOrder for tax rates and count.
 * 2. Queries Redis to retrieve the cached tax rates array and count concurrently.
 * 3. Returns an object containing the parsed TaxRate array and count, or null if not found.
 *
 * @param taxClassId - The ID of the tax class.
 * @param page - The page number for pagination.
 * @param limit - The number of tax rates per page.
 * @param search - Optional search term or null for no search.
 * @param sortBy - The field to sort by (default: "createdAt").
 * @param sortOrder - The sort order (default: "desc").
 * @returns A promise resolving to an object with tax rates (TaxRate array or null) and count (number or null).
 */
export const getTaxRatesAndCountFromRedis = async (
  taxClassId: string,
  page: number,
  limit: number,
  search: string | null,
  sortBy: string = "createdAt",
  sortOrder: string = "desc"
): Promise<{ rates: TaxRate[] | null; count: number | null }> => {
  const searchKeyWord = search ? search.toLowerCase().trim() : "none";
  const ratesKey = `${PREFIX.LIST}${taxClassId}:page:${page}:limit:${limit}:search:${searchKeyWord}:sort:${sortBy}:${sortOrder}`;
  const countKey = `${PREFIX.COUNT}${taxClassId}:search:${searchKeyWord}:sort:${sortBy}:${sortOrder}`;

  const [ratesResult, countResult] = await Promise.all([
    redis.getSession<TaxRate[] | null>(ratesKey, "product-app"),
    redis.getSession<string | null>(countKey, "product-app"),
  ]);

  const count =
    countResult !== null
      ? isNaN(Number(countResult))
        ? 0
        : Number(countResult)
      : null;

  return { rates: ratesResult, count };
};

/**
 * Handles caching of tax rates and total count for a specific tax class in Redis based on query parameters.
 *
 * Workflow:
 * 1. Constructs Redis keys using taxClassId, page, limit, search term, sortBy, and sortOrder for tax rates and count.
 * 2. Stores the tax rates array and count in Redis with the specified TTL.
 *
 * @param taxClassId - The ID of the tax class.
 * @param page - The page number for pagination.
 * @param limit - The number of tax rates per page.
 * @param search - Optional search term or null for no search.
 * @param sortBy - The field to sort by (default: "createdAt").
 * @param sortOrder - The sort order (default: "desc").
 * @param rates - The array of TaxRate data to cache.
 * @param total - The total tax rates count to cache.
 * @param ttl - Optional time-to-live in seconds (default: 3600).
 * @returns A promise resolving when the tax rates and count are cached.
 */
export const setTaxRatesAndCountInRedis = async (
  taxClassId: string,
  page: number,
  limit: number,
  search: string | null,
  sortBy: string = "createdAt",
  sortOrder: string = "desc",
  rates: TaxRate[],
  total: number,
  ttl: number = 3600
): Promise<void> => {
  const searchKeyWord = search ? search.toLowerCase().trim() : "none";
  const ratesKey = `${PREFIX.LIST}${taxClassId}:page:${page}:limit:${limit}:search:${searchKeyWord}:sort:${sortBy}:${sortOrder}`;
  const countKey = `${PREFIX.COUNT}${taxClassId}:search:${searchKeyWord}:sort:${sortBy}:${sortOrder}`;

  await Promise.all([
    redis.setSession(ratesKey, rates, "product-app", ttl),
    redis.setSession(countKey, total.toString(), "product-app", ttl),
  ]);
};

/**
 * Handles removal of cached tax rates and count data for a specific tax class from Redis.
 *
 * Workflow:
 * 1. Retrieves all keys in the "product-app" namespace.
 * 2. Filters keys that start with the tax rates list or count prefix for the given taxClassId.
 * 3. Deletes all matching keys concurrently.
 *
 * @param taxClassId - The ID of the tax class.
 * @returns A promise resolving when the tax rates and count data are removed.
 */
export const clearTaxRatesAndCountCacheByTaxClass = async (
  taxClassId: string
): Promise<void> => {
  const keys = await redis.getAllSessionKey("product-app");
  const relevantKeys = keys.filter(
    (key) =>
      key.startsWith(`${PREFIX.LIST}${taxClassId}:`) ||
      key.startsWith(`${PREFIX.COUNT}${taxClassId}:`)
  );

  if (relevantKeys.length > 0) {
    await Promise.all(
      relevantKeys.map((key) => redis.deleteSession(key, "product-app"))
    );
  }
};

/**
 * Retrieves tax rate information from Redis by rate ID (without taxClassId in key).
 *
 * Workflow:
 * 1. Queries Redis using the RATE prefix and rate ID.
 * 2. Returns the parsed TaxRate or null if not found.
 *
 * @param rateId - The ID of the tax rate.
 * @returns A promise resolving to the TaxRate or null if not found.
 */
export const getTaxRateInfoByIdFromRedis = async (
  rateId: string
): Promise<TaxRateSession | null> => {
  const key = `${PREFIX.RATE}${rateId}`;
  return redis.getSession<TaxRateSession | null>(key, "product-app");
};

/*
 * Caches tax rate information in Redis by rate ID (without taxClassId in key).
 *
 * Workflow:
 * 1. Stores the tax rate data in Redis with the RATE prefix and rate ID.
 *
 * @param rateId - The ID of the tax rate.
 * @param data - The TaxRate entity to cache.
 * @returns A promise resolving when the tax rate is cached.
 */
export const setTaxRateInfoByIdInRedis = async (
  rateId: string,
  data: TaxRateSession
): Promise<void> => {
  const key = `${PREFIX.RATE}${rateId}`;
  await redis.setSession(key, data, "product-app");
};

/**
 * Removes cached tax rate information by rate ID (without taxClassId in key) from Redis.
 *
 * Workflow:
 * 1. Deletes the tax rate data from Redis using the RATE prefix and rate ID.
 *
 * @param rateId - The ID of the tax rate.
 * @returns A promise resolving when the tax rate data is removed.
 */
export const removeTaxRateInfoByIdFromRedis = async (
  rateId: string
): Promise<void> => {
  const key = `${PREFIX.RATE}${rateId}`;
  await redis.deleteSession(key, "product-app");
};
