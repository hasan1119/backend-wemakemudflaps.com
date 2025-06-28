import { ShippingClass } from "../../../../entities";
import { ShippingClassPaginationDataSession } from "../../../../types";
import { redis } from "../../redis";

// Defines prefixes for Redis keys used for shipping class session and value existence caching
const PREFIX = {
  CLASS: "shipping-class:",
  EXISTS: "shipping-class-exists:",
  COUNT: "shipping-class-count:",
  LIST: "shipping-class-list:",
};

/**
 * Retrieves a paginated list of shipping classes from Redis cache.
 *
 * @param page - Current page number.
 * @param limit - Number of classes per page.
 * @param search - Search query (optional).
 * @param sortBy - Field to sort by (default is 'createdAt').
 * @param sortOrder - Sort order ('asc' or 'desc', default is 'desc').
 * @returns A promise resolving to an array of ShippingClassPaginationDataSession or null.
 */
export const getShippingClassesFromRedis = async (
  page: number,
  limit: number,
  search: string = "",
  sortBy: string = "createdAt",
  sortOrder: string = "desc"
): Promise<ShippingClassPaginationDataSession[] | null> => {
  const key = `${PREFIX.LIST}${page}:${limit}:${search}:${sortBy}:${sortOrder}`;
  return redis.getSession<ShippingClassPaginationDataSession[] | null>(
    key,
    "product-app"
  );
};

/**
 * Retrieves the total count of shipping classes from Redis cache.
 *
 * @param search - Search query (optional).
 * @param sortBy - Field used for sorting.
 * @param sortOrder - Sort order.
 * @returns A promise resolving to the count of shipping classes.
 */
export const getShippingClassCountFromRedis = async (
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
 * Checks if a shipping class value exists in Redis.
 *
 * Workflow:
 * 1. Queries Redis using the EXISTS prefix and normalized value.
 * 2. Returns true if the value exists, false otherwise.
 *
 * @param value - The value of the shipping class.
 * @returns A promise resolving to a boolean indicating existence.
 */
export const getShippingClassValueExistFromRedis = async (
  value: string
): Promise<boolean> => {
  const result = await redis.getSession<string | null>(
    `${PREFIX.EXISTS}${value.toLowerCase().trim()}`,
    "product-app"
  );
  return result === "exists";
};

/**
 * Retrieves shipping class information from Redis by class ID.
 *
 * @param classId - The ID of the shipping class.
 * @returns A promise resolving to the ShippingClass or null if not found.
 */
export const getShippingClassInfoByIdFromRedis = async (
  classId: string
): Promise<ShippingClass | null> => {
  return redis.getSession<ShippingClass | null>(
    `${PREFIX.CLASS}${classId}`,
    "product-app"
  );
};

/**
 * Caches a paginated list of shipping classes in Redis.
 *
 * @param page - Current page number.
 * @param limit - Number of classes per page.
 * @param search - Search query.
 * @param sortBy - Field to sort by.
 * @param sortOrder - Sort order ('asc' or 'desc').
 * @param classes - Array of ShippingClassPaginationDataSession to cache.
 * @param ttl - Optional time-to-live in seconds (default: 3600).
 */
export const setShippingClassesInRedis = async (
  page: number,
  limit: number,
  search: string,
  sortBy: string,
  sortOrder: string,
  classes: ShippingClassPaginationDataSession[],
  ttl: number = 3600
): Promise<void> => {
  const key = `${PREFIX.LIST}${page}:${limit}:${search}:${sortBy}:${sortOrder}`;
  await redis.setSession(key, classes, "product-app", ttl);
};

/**
 * Caches the total shipping class count in Redis.
 *
 * @param search - Search query.
 * @param sortBy - Field used for sorting.
 * @param sortOrder - Sort order.
 * @param count - Total number of shipping classes.
 * @param ttl - Optional time-to-live in seconds (default: 3600).
 */
export const setShippingClassCountInRedis = async (
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
 * Caches shipping class information in Redis by class ID.
 *
 * @param classId - The ID of the shipping class.
 * @param data - The ShippingClass entity to cache.
 */
export const setShippingClassInfoByIdInRedis = async (
  classId: string,
  data: ShippingClass
): Promise<void> => {
  await redis.setSession(`${PREFIX.CLASS}${classId}`, data, "product-app");
};

/**
 * Sets an existence flag for a shipping class value in Redis.
 *
 * Workflow:
 * 1. Stores "exists" in Redis with the EXISTS prefix and normalized value.
 *
 * @param value - The value of the shipping class.
 */
export const setShippingClassValueExistInRedis = async (
  value: string
): Promise<void> => {
  await redis.setSession(
    `${PREFIX.EXISTS}${value.toLowerCase().trim()}`,
    "exists",
    "product-app"
  );
};

/**
 * Removes cached shipping class information by class ID from Redis.
 *
 * @param classId - The ID of the shipping class.
 */
export const removeShippingClassInfoByIdFromRedis = async (
  classId: string
): Promise<void> => {
  await redis.deleteSession(`${PREFIX.CLASS}${classId}`, "product-app");
};

/**
 * Removes the existence flag for a shipping class value from Redis.
 *
 * @param value - The value of the shipping class.
 */
export const removeShippingClassValueExistFromRedis = async (
  value: string
): Promise<void> => {
  await redis.deleteSession(
    `${PREFIX.EXISTS}${value.toLowerCase().trim()}`,
    "product-app"
  );
};

/**
 * Deletes all Redis cache entries related to shipping class list and count.
 *
 * Order of deletion:
 * 1. Delete list-related keys (paginated data).
 * 2. Delete count-related keys (total counts).
 */
export const clearAllShippingClassSearchCache = async (): Promise<void> => {
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
