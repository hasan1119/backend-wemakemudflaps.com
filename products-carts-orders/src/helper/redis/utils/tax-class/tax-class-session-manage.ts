import { TaxClass } from "../../../../entities";
import { TaxClassPaginationDataSession } from "../../../../types";
import { redis } from "../../redis";

// Defines prefixes for Redis keys used for tax class session caching
const PREFIX = {
  CLASS: "tax-class:",
  EXISTS: "tax-class-exists:",
  COUNT: "tax-class-count:",
  LIST: "tax-class-list:",
};

/**
 * Handles retrieval of cached tax classes and total count from Redis based on query parameters.
 *
 * Workflow:
 * 1. Constructs Redis keys using page, limit, search term, sortBy, and sortOrder for tax classes and count.
 * 2. Queries Redis to retrieve the cached tax classes array and count concurrently.
 * 3. Returns an object containing the parsed TaxClass array and count, or null if not found.
 *
 * @param page - The page number for pagination.
 * @param limit - The number of tax classes per page.
 * @param search - Optional search term or null for no search.
 * @param sortBy - The field to sort by (default: "createdAt").
 * @param sortOrder - The sort order (default: "desc").
 * @returns A promise resolving to an object with tax classes (TaxClass array or null) and count (number or null).
 */
export const getTaxClassesAndCountFromRedis = async (
  page: number,
  limit: number,
  search: string | null,
  sortBy: string = "createdAt",
  sortOrder: string = "desc"
): Promise<{
  classes: TaxClassPaginationDataSession[] | null;
  count: number | null;
}> => {
  const searchKeyWord = search ? search.toLowerCase().trim() : "none";
  const classesKey = `${PREFIX.LIST}page:${page}:limit:${limit}:search:${searchKeyWord}:sort:${sortBy}:${sortOrder}`;
  const countKey = `${PREFIX.COUNT}search:${searchKeyWord}:sort:${sortBy}:${sortOrder}`;

  const [classesResult, countResult] = await Promise.all([
    redis.getSession<TaxClassPaginationDataSession[] | null>(
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
 * Handles caching of tax classes and total count in Redis based on query parameters.
 *
 * Workflow:
 * 1. Constructs Redis keys using page, limit, search term, sortBy, and sortOrder for tax classes and count.
 * 2. Stores the tax classes array and count in Redis with the specified TTL.
 *
 * @param page - The page number for pagination.
 * @param limit - The number of tax classes per page.
 * @param search - Optional search term or null for no search.
 * @param sortBy - The field to sort by (default: "createdAt").
 * @param sortOrder - The sort order (default: "desc").
 * @param classes - The array of TaxClass data to cache.
 * @param total - The total tax classes count to cache.
 * @param ttl - Optional time-to-live in seconds (default: 3600).
 * @returns A promise resolving when the tax classes and count are cached.
 */
export const setTaxClassesAndCountInRedis = async (
  page: number,
  limit: number,
  search: string | null,
  sortBy: string = "createdAt",
  sortOrder: string = "desc",
  classes: TaxClassPaginationDataSession[],
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
 * Handles removal of cached tax classes and count data from Redis.
 *
 * Workflow:
 * 1. Retrieves all keys in the "product-app" namespace.
 * 2. Filters keys that start with the tax classes list or count prefix.
 * 3. Deletes all matching keys concurrently.
 *
 * @returns A promise resolving when the tax classes and count data are removed.
 */
export const clearTaxClassesAndCountCache = async (): Promise<void> => {
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
 * Checks if a tax class value exists in Redis.
 *
 * Workflow:
 * 1. Queries Redis using the EXISTS prefix and normalized value.
 * 2. Returns true if the value exists, false otherwise.
 *
 * @param value - The value of the tax class.
 * @returns A promise resolving to a boolean indicating existence.
 */
export const getTaxClassValueExistFromRedis = async (
  value: string
): Promise<boolean> => {
  const result = await redis.getSession<string | null>(
    `${PREFIX.EXISTS}${value.toLowerCase().trim()}`,
    "product-app"
  );
  return result === "exists";
};

/**
 * Retrieves tax class information from Redis by class ID.
 *
 * Workflow:
 * 1. Queries Redis using the CLASS prefix and class ID.
 * 2. Returns the parsed TaxClass or null if not found.
 *
 * @param classId - The ID of the tax class.
 * @returns A promise resolving to the TaxClass or null if not found.
 */
export const getTaxClassInfoByIdFromRedis = async (
  classId: string
): Promise<TaxClass | null> => {
  return redis.getSession<TaxClass | null>(
    `${PREFIX.CLASS}${classId}`,
    "product-app"
  );
};

/**
 * Caches tax class information in Redis by class ID.
 *
 * Workflow:
 * 1. Stores the tax class data in Redis with the CLASS prefix and class ID.
 *
 * @param classId - The ID of the tax class.
 * @param data - The TaxClass entity to cache.
 * @returns A promise resolving when the tax class is cached.
 */
export const setTaxClassInfoByIdInRedis = async (
  classId: string,
  data: TaxClass
): Promise<void> => {
  await redis.setSession(`${PREFIX.CLASS}${classId}`, data, "product-app");
};

/**
 * Sets an existence flag for a tax class value in Redis.
 *
 * Workflow:
 * 1. Stores "exists" in Redis with the EXISTS prefix and normalized value.
 *
 * @param value - The value of the tax class.
 * @returns A promise resolving when the flag is set.
 */
export const setTaxClassValueExistInRedis = async (
  value: string
): Promise<void> => {
  await redis.setSession(
    `${PREFIX.EXISTS}${value.toLowerCase().trim()}`,
    "exists",
    "product-app"
  );
};

/**
 * Removes cached tax class information by class ID from Redis.
 *
 * Workflow:
 * 1. Deletes the tax class data from Redis using the CLASS prefix and class ID.
 *
 * @param classId - The ID of the tax class.
 * @returns A promise resolving when the tax class data is removed.
 */
export const removeTaxClassInfoByIdFromRedis = async (
  classId: string
): Promise<void> => {
  await redis.deleteSession(`${PREFIX.CLASS}${classId}`, "product-app");
};

/**
 * Removes the existence flag for a tax class value from Redis.
 *
 * Workflow:
 * 1. Deletes the existence flag from Redis using the EXISTS prefix and normalized value.
 *
 * @param value - The value of the tax class.
 * @returns A promise resolving when the flag is removed.
 */
export const removeTaxClassValueExistFromRedis = async (
  value: string
): Promise<void> => {
  await redis.deleteSession(
    `${PREFIX.EXISTS}${value.toLowerCase().trim()}`,
    "product-app"
  );
};
