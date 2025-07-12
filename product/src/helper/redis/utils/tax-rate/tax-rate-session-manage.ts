import { TaxRate } from "../../../../types";
import { redis } from "../../redis";

const PREFIX = {
  RATE: "tax-rate:info:",
  EXISTS: "tax-rate-exists:",
  COUNT: "tax-rate-count:",
  LIST: "tax-rate-list:",
};

/**
 * Retrieves a paginated list of tax rates for a specific tax class from Redis cache.
 */
export const getTaxRatesFromRedis = async (
  taxClassId: string,
  page: number,
  limit: number,
  search: string = "",
  sortBy: string = "createdAt",
  sortOrder: string = "desc"
): Promise<TaxRate[] | null> => {
  const key = `${PREFIX.LIST}${taxClassId}:${page}:${limit}:${search}:${sortBy}:${sortOrder}`;
  return redis.getSession<TaxRate[] | null>(key, "product-app");
};

/**
 * Retrieves the total count of tax rates for a specific tax class from Redis cache.
 */
export const getTaxRateCountFromRedis = async (
  taxClassId: string,
  search: string = "",
  sortBy: string = "createdAt",
  sortOrder: string = "desc"
): Promise<number> => {
  const key = `${PREFIX.COUNT}${taxClassId}:${search}:${sortBy}:${sortOrder}`;
  const result = await redis.getSession<number | null>(key, "product-app");
  const count = Number(result);
  return isNaN(count) ? 0 : count;
};

/**
 * Checks if a tax rate label exists in Redis for a specific tax class.
 */
export const getTaxRateLabelExistFromRedis = async (
  taxClassId: string,
  label: string
): Promise<boolean> => {
  const key = `${PREFIX.EXISTS}${taxClassId}:${label.toLowerCase().trim()}`;
  const result = await redis.getSession<string | null>(key, "product-app");
  return result === "exists";
};

/**
 * Retrieves tax rate information from Redis by rate ID (without taxClassId in key).
 */
export const getTaxRateInfoByIdFromRedis = async (
  rateId: string
): Promise<TaxRate | null> => {
  const key = `${PREFIX.RATE}${rateId}`;
  return redis.getSession<TaxRate | null>(key, "product-app");
};

/**
 * Caches a paginated list of tax rates for a specific tax class in Redis.
 */
export const setTaxRatesInRedis = async (
  taxClassId: string,
  page: number,
  limit: number,
  search: string,
  sortBy: string,
  sortOrder: string,
  rates: TaxRate[],
  ttl: number = 3600
): Promise<void> => {
  const key = `${PREFIX.LIST}${taxClassId}:${page}:${limit}:${search}:${sortBy}:${sortOrder}`;
  await redis.setSession(key, rates, "product-app", ttl);
};

/**
 * Caches the total tax rate count for a specific tax class in Redis.
 */
export const setTaxRateCountInRedis = async (
  taxClassId: string,
  search: string,
  sortBy: string,
  sortOrder: string,
  count: number,
  ttl: number = 3600
): Promise<void> => {
  const key = `${PREFIX.COUNT}${taxClassId}:${search}:${sortBy}:${sortOrder}`;
  await redis.setSession(key, count.toString(), "product-app", ttl);
};

/**
 * Caches tax rate information in Redis by rate ID (without taxClassId in key).
 */
export const setTaxRateInfoByIdInRedis = async (
  rateId: string,
  data: TaxRate
): Promise<void> => {
  const key = `${PREFIX.RATE}${rateId}`;
  await redis.setSession(key, data, "product-app");
};

/**
 * Sets an existence flag for a tax rate label in Redis by tax class ID.
 */
export const setTaxRateLabelExistInRedis = async (
  taxClassId: string,
  label: string
): Promise<void> => {
  const key = `${PREFIX.EXISTS}${taxClassId}:${label.toLowerCase().trim()}`;
  await redis.setSession(key, "exists", "product-app");
};

/**
 * Removes cached tax rate information by rate ID (without taxClassId in key) from Redis.
 */
export const removeTaxRateInfoByIdFromRedis = async (
  rateId: string
): Promise<void> => {
  const key = `${PREFIX.RATE}${rateId}`;
  await redis.deleteSession(key, "product-app");
};

/**
 * Removes the existence flag for a tax rate label by tax class ID from Redis.
 */
export const removeTaxRateLabelExistFromRedis = async (
  taxClassId: string,
  label: string
): Promise<void> => {
  const key = `${PREFIX.EXISTS}${taxClassId}:${label.toLowerCase().trim()}`;
  await redis.deleteSession(key, "product-app");
};

/**
 * Deletes all Redis cache entries related to tax rate list and count for a specific tax class.
 */
export const clearAllTaxRateSearchCacheByTaxClass = async (
  taxClassId: string
): Promise<void> => {
  const keys = await redis.getAllSessionKey("product-app");

  const listKeys = keys.filter((key) =>
    key.startsWith(`${PREFIX.LIST}${taxClassId}:`)
  );
  const countKeys = keys.filter((key) =>
    key.startsWith(`${PREFIX.COUNT}${taxClassId}:`)
  );

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

/**
 * Deletes all Redis cache entries related to tax rate counts for a specific tax class.
 */
export const clearTaxRateCountCacheByTaxClass = async (
  taxClassId: string
): Promise<void> => {
  const keys = await redis.getAllSessionKey("product-app");

  const countKeys = keys.filter((key) =>
    key.startsWith(`${PREFIX.COUNT}${taxClassId}:`)
  );

  if (countKeys.length > 0) {
    await Promise.all(
      countKeys.map((key) => redis.deleteSession(key, "product-app"))
    );
  }
};
