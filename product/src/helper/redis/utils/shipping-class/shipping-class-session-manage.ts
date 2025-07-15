import {
  ShippingClass,
  ShippingClassPaginationDataSession,
} from "../../../../types";
import { redis } from "../../redis";

// Defines prefixes for Redis keys used for shipping class session and value existence caching
const PREFIX = {
  CLASS: "shipping-class:",
  EXISTS: "shipping-class-exists:",
  COUNT: "shipping-class-count:",
  LIST: "shipping-class-list:",
};

/**
 * Handles retrieval of cached shipping classes and total count from Redis based on query parameters.
 *
 * Workflow:
 * 1. Constructs Redis keys using page, limit, search term, sortBy, and sortOrder for shipping classes and count.
 * 2. Queries Redis to retrieve the cached shipping classes array and count concurrently.
 * 3. Returns an object containing the parsed ShippingClass array and count, or null if not found.
 *
 * @param page - The page number for pagination.
 * @param limit - The number of shipping classes per page.
 * @param search - Optional search term or null for no search.
 * @param sortBy - The field to sort by (default: "createdAt").
 * @param sortOrder - The sort order (default: "desc").
 * @returns A promise resolving to an object with shipping classes (ShippingClass array or null) and count (number or null).
 */
export const getShippingClassesAndCountFromRedis = async (
  page: number,
  limit: number,
  search: string | null,
  sortBy: string = "createdAt",
  sortOrder: string = "desc"
): Promise<{
  classes: ShippingClassPaginationDataSession[] | null;
  count: number | null;
}> => {
  const searchKeyWord = search ? search.toLowerCase().trim() : "none";
  const classesKey = `${PREFIX.LIST}page:${page}:limit:${limit}:search:${searchKeyWord}:sort:${sortBy}:${sortOrder}`;
  const countKey = `${PREFIX.COUNT}search:${searchKeyWord}:sort:${sortBy}:${sortOrder}`;

  const [classesResult, countResult] = await Promise.all([
    redis.getSession<ShippingClassPaginationDataSession[] | null>(
      classesKey,
      "product-app"
    ),
    redis.getSession<string | null>(countKey, "product-app"),
  ]);

  const count =
    countResult !== null
      ? isNaN(Number(countResult))
        ? 0
        : Number(countResult)
      : null;

  return { classes: classesResult, count };
};

/**
 * Handles caching of shipping classes and total count in Redis based on query parameters.
 *
 * Workflow:
 * 1. Constructs Redis keys using page, limit, search term, sortBy, and sortOrder for shipping classes and count.
 * 2. Stores the shipping classes array and count in Redis with the specified TTL.
 *
 * @param page - The page number for pagination.
 * @param limit - The number of shipping classes per page.
 * @param search - Optional search term or null for no search.
 * @param sortBy - The field to sort by (default: "createdAt").
 * @param sortOrder - The sort order (default: "desc").
 * @param classes - The array of ShippingClass data to cache.
 * @param total - The total shipping classes count to cache.
 * @param ttl - Optional time-to-live in seconds (default: 3600).
 * @returns A promise resolving when the shipping classes and count are cached.
 */
export const setShippingClassesAndCountInRedis = async (
  page: number,
  limit: number,
  search: string | null,
  sortBy: string = "createdAt",
  sortOrder: string = "desc",
  classes: ShippingClassPaginationDataSession[],
  total: number,
  ttl: number = 3600
): Promise<void> => {
  const searchKeyWord = search ? search.toLowerCase().trim() : "none";
  const classesKey = `${PREFIX.LIST}page:${page}:limit:${limit}:search:${searchKeyWord}:sort:${sortBy}:${sortOrder}`;
  const countKey = `${PREFIX.COUNT}search:${searchKeyWord}:sort:${sortBy}:${sortOrder}`;

  await Promise.all([
    redis.setSession(classesKey, classes, "product-app", ttl),
    redis.setSession(countKey, total.toString(), "product-app", ttl),
  ]);
};

/**
 * Handles removal of cached shipping classes and count data from Redis.
 *
 * Workflow:
 * 1. Retrieves all keys in the "product-app" namespace.
 * 2. Filters keys that start with the shipping classes list or count prefix.
 * 3. Deletes all matching keys concurrently.
 *
 * @returns A promise resolving when the shipping classes and count data are removed.
 */
export const clearShippingClassesAndCountCache = async (): Promise<void> => {
  const keys = await redis.getAllSessionKey("product-app");
  const relevantKeys = keys.filter(
    (key) => key.startsWith(PREFIX.LIST) || key.startsWith(PREFIX.COUNT)
  );

  if (relevantKeys.length > 0) {
    await Promise.all(
      relevantKeys.map((key) => redis.deleteSession(key, "product-app"))
    );
  }
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
 * Workflow:
 * 1. Queries Redis using the CLASS prefix and class ID.
 * 2. Returns the parsed ShippingClass or null if not found.
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
 * Caches shipping class information in Redis by class ID.
 *
 * Workflow:
 * 1. Stores the data in Redis with the CLASS prefix and class ID.
 *
 * @param classId - The ID of the shipping class.
 * @param data - The ShippingClass entity to cache.
 * @returns A promise resolving when the shipping class is cached.
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
 * @returns A promise resolving when the flag is set.
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
 * Workflow:
 * 1. Deletes the shipping class data from Redis using the CLASS prefix and class ID.
 *
 * @param classId - The ID of the shipping class.
 * @returns A promise resolving when the shipping class data is removed.
 */
export const removeShippingClassInfoByIdFromRedis = async (
  classId: string
): Promise<void> => {
  await redis.deleteSession(`${PREFIX.CLASS}${classId}`, "product-app");
};

/**
 * Removes the existence flag for a shipping class value from Redis.
 *
 * Workflow:
 * 1. Deletes the existence flag from Redis using the EXISTS prefix and normalized value.
 *
 * @param value - The value of the shipping class.
 * @returns A promise resolving when the flag is removed.
 */
export const removeShippingClassValueExistFromRedis = async (
  value: string
): Promise<void> => {
  await redis.deleteSession(
    `${PREFIX.EXISTS}${value.toLowerCase().trim()}`,
    "product-app"
  );
};
