import { TaxStatus } from "../../../../entities";
import { TaxStatusPaginationDataSession } from "../../../../types";
import { redis } from "../../redis";

// Defines prefixes for Redis keys used for tax status session and value existence caching
const PREFIX = {
  STATUS: "tax-status:",
  EXISTS: "tax-status-exists:",
  COUNT: "tax-status-count:",
  LIST: "tax-status-list:",
};

/**
 * Retrieves a paginated list of tax statuses from Redis cache.
 *
 * @param page - Current page number.
 * @param limit - Number of statuses per page.
 * @param search - Search query (optional).
 * @param sortBy - Field to sort by (default is 'createdAt').
 * @param sortOrder - Sort order ('asc' or 'desc', default is 'desc').
 * @returns A promise resolving to an array of TaxStatusPaginationDataSession or null.
 */
export const getTaxStatusesFromRedis = async (
  page: number,
  limit: number,
  search: string = "",
  sortBy: string = "createdAt",
  sortOrder: string = "desc"
): Promise<TaxStatusPaginationDataSession[] | null> => {
  const key = `${PREFIX.LIST}${page}:${limit}:${search}:${sortBy}:${sortOrder}`;
  return redis.getSession<TaxStatusPaginationDataSession[] | null>(
    key,
    "product-app"
  );
};

/**
 * Retrieves the total count of tax statuses from Redis cache.
 *
 * @param search - Search query (optional).
 * @param sortBy - Field used for sorting.
 * @param sortOrder - Sort order.
 * @returns A promise resolving to the count of tax statuses.
 */
export const getTaxStatusCountFromRedis = async (
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
 * Checks if a tax status value exists in Redis.
 *
 * Workflow:
 * 1. Queries Redis using the EXISTS prefix and normalized value.
 * 2. Returns true if the value exists, false otherwise.
 *
 * @param value - The value of the tax status.
 * @returns A promise resolving to a boolean indicating existence.
 */
export const getTaxStatusValueExistFromRedis = async (
  value: string
): Promise<boolean> => {
  const result = await redis.getSession<string | null>(
    `${PREFIX.EXISTS}${value.toLowerCase().trim()}`,
    "product-app"
  );
  return result === "exists";
};

/**
 * Retrieves tax status information from Redis by status ID.
 *
 * @param statusId - The ID of the tax status.
 * @returns A promise resolving to the TaxStatus or null if not found.
 */
export const getTaxStatusInfoByIdFromRedis = async (
  statusId: string
): Promise<TaxStatus | null> => {
  return redis.getSession<TaxStatus | null>(
    `${PREFIX.STATUS}${statusId}`,
    "product-app"
  );
};

/**
 * Caches a paginated list of tax statuses in Redis.
 *
 * @param page - Current page number.
 * @param limit - Number of statuses per page.
 * @param search - Search query.
 * @param sortBy - Field to sort by.
 * @param sortOrder - Sort order ('asc' or 'desc').
 * @param statuses - Array of TaxStatusPaginationDataSession to cache.
 * @param ttl - Optional time-to-live in seconds (default: 3600).
 */
export const setTaxStatusesInRedis = async (
  page: number,
  limit: number,
  search: string,
  sortBy: string,
  sortOrder: string,
  statuses: TaxStatusPaginationDataSession[],
  ttl: number = 3600
): Promise<void> => {
  const key = `${PREFIX.LIST}${page}:${limit}:${search}:${sortBy}:${sortOrder}`;
  await redis.setSession(key, statuses, "product-app", ttl);
};

/**
 * Caches the total tax status count in Redis.
 *
 * @param search - Search query.
 * @param sortBy - Field used for sorting.
 * @param sortOrder - Sort order.
 * @param count - Total number of tax statuses.
 * @param ttl - Optional time-to-live in seconds (default: 3600).
 */
export const setTaxStatusCountInRedis = async (
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
 * Caches tax status information in Redis by status ID.
 *
 * @param statusId - The ID of the tax status.
 * @param data - The TaxStatus entity to cache.
 */
export const setTaxStatusInfoByIdInRedis = async (
  statusId: string,
  data: TaxStatus
): Promise<void> => {
  await redis.setSession(`${PREFIX.STATUS}${statusId}`, data, "product-app");
};

/**
 * Sets an existence flag for a tax status value in Redis.
 *
 * Workflow:
 * 1. Stores "exists" in Redis with the EXISTS prefix and normalized value.
 *
 * @param value - The value of the tax status.
 */
export const setTaxStatusValueExistInRedis = async (
  value: string
): Promise<void> => {
  await redis.setSession(
    `${PREFIX.EXISTS}${value.toLowerCase().trim()}`,
    "exists",
    "product-app"
  );
};

/**
 * Removes cached tax status information by status ID from Redis.
 *
 * @param statusId - The ID of the tax status.
 */
export const removeTaxStatusInfoByIdFromRedis = async (
  statusId: string
): Promise<void> => {
  await redis.deleteSession(`${PREFIX.STATUS}${statusId}`, "product-app");
};

/**
 * Removes the existence flag for a tax status value from Redis.
 *
 * @param value - The value of the tax status.
 */
export const removeTaxStatusValueExistFromRedis = async (
  value: string
): Promise<void> => {
  await redis.deleteSession(
    `${PREFIX.EXISTS}${value.toLowerCase().trim()}`,
    "product-app"
  );
};

/**
 * Deletes all Redis cache entries related to tax status list and count.
 *
 * Order of deletion:
 * 1. Delete list-related keys (paginated data).
 * 2. Delete count-related keys (total counts).
 */
export const clearAllTaxStatusSearchCache = async (): Promise<void> => {
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
