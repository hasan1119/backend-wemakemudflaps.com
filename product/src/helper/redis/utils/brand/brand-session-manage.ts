import {
  BrandPaginationDataSession,
  BrandResponseSession,
} from "../../../../types";
import { redis } from "../../redis";

// Defines prefixes for Redis keys used for brand session and user count caching
const PREFIX = {
  BRAND: "brand:",
  EXISTS: "brand-exists:",
  SLUG_EXISTS: "brand-slug-exists:",
  COUNT: "brands-count:",
  LIST: "brands-list:",
};

/**
 * Handles retrieval of cached brands and total count from Redis based on query parameters.
 *
 * Workflow:
 * 1. Constructs Redis keys using page, limit, search term, sortBy, and sortOrder for brands and count.
 * 2. Queries Redis to retrieve the cached brands array and count concurrently.
 * 3. Returns an object containing the parsed Brand array and count, or null if not found.
 *
 * @param page - The page number for pagination.
 * @param limit - The number of brands per page.
 * @param search - Optional search term or null for no search.
 * @param sortBy - The field to sort by (default: "createdAt").
 * @param sortOrder - The sort order (default: "desc").
 * @returns A promise resolving to an object with brands (Brand array or null) and count (number or null).
 */
export const getBrandsAndCountFromRedis = async (
  page: number,
  limit: number,
  search: string | null,
  sortBy: string = "createdAt",
  sortOrder: string = "desc"
): Promise<{
  brands: BrandPaginationDataSession[] | null;
  count: number | null;
}> => {
  const searchKeyWord = search ? search.toLowerCase().trim() : "none";
  const brandsKey = `${PREFIX.LIST}page:${page}:limit:${limit}:search:${searchKeyWord}:sort:${sortBy}:${sortOrder}`;
  const countKey = `${PREFIX.COUNT}search:${searchKeyWord}:sort:${sortBy}:${sortOrder}`;

  const [brandsResult, countResult] = await Promise.all([
    redis.getSession<BrandPaginationDataSession[] | null>(
      brandsKey,
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

  return { brands: brandsResult, count };
};

/**
 * Handles caching of brands and total count in Redis based on query parameters.
 *
 * Workflow:
 * 1. Constructs Redis keys using page, limit, search term, sortBy, and sortOrder for brands and count.
 * 2. Stores the brands array and count in Redis with the specified TTL.
 *
 * @param page - The page number for pagination.
 * @param limit - The number of brands per page.
 * @param search - Optional search term or null for no search.
 * @param sortBy - The field to sort by (default: "createdAt").
 * @param sortOrder - The sort order (default: "desc").
 * @param brands - The array of Brand data to cache.
 * @param total - The total brands count to cache.
 * @param ttl - Optional time-to-live in seconds (default: 3600).
 * @returns A promise resolving when the brands and count are cached.
 */
export const setBrandsAndCountInRedis = async (
  page: number,
  limit: number,
  search: string | null,
  sortBy: string = "createdAt",
  sortOrder: string = "desc",
  brands: BrandPaginationDataSession[],
  total: number,
  ttl: number = 3600
): Promise<void> => {
  const searchKeyWord = search ? search.toLowerCase().trim() : "none";
  const brandsKey = `${PREFIX.LIST}page:${page}:limit:${limit}:search:${searchKeyWord}:sort:${sortBy}:${sortOrder}`;
  const countKey = `${PREFIX.COUNT}search:${searchKeyWord}:sort:${sortBy}:${sortOrder}`;

  await Promise.all([
    redis.setSession(brandsKey, brands, "product-app", ttl),
    redis.setSession(countKey, total.toString(), "product-app", ttl),
  ]);
};

/**
 * Handles removal of cached brands and count data from Redis.
 *
 * Workflow:
 * 1. Retrieves all keys in the "product-app" namespace.
 * 2. Filters keys that start with the brands list or count prefix.
 * 3. Deletes all matching keys concurrently.
 *
 * @returns A promise resolving when the brands and count data are removed.
 */
export const clearBrandsAndCountCache = async (): Promise<void> => {
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
 * Handles checking if a brand slug exists in Redis.
 *
 * Workflow:
 * 1. Queries Redis using the SLUG_EXISTS prefix and normalized brand slug.
 * 2. Returns true if the slug exists, false otherwise.
 *
 * @param brandSlug - The slug of the brand.
 * @returns A promise resolving to a boolean indicating if the brand slug exists.
 */
export const getBrandSlugExistFromRedis = async (
  brandSlug: string
): Promise<boolean> => {
  const result = await redis.getSession<string | null>(
    `${PREFIX.SLUG_EXISTS}${brandSlug.toLowerCase().trim()}`,
    "product-app"
  );
  return result === "exists";
};

/**
 * Handles retrieval of brand information from Redis by brand ID.
 *
 * Workflow:
 * 1. Queries Redis using the brand prefix and brand ID.
 * 2. Returns the parsed Brand or null if not found.
 *
 * @param brandId - The ID of the brand.
 * @returns A promise resolving to the Brand or null if not found.
 */
export const getBrandInfoByIdFromRedis = async (
  brandId: string
): Promise<BrandResponseSession | null> => {
  return redis.getSession<BrandResponseSession | null>(
    `${PREFIX.BRAND}${brandId}`,
    "product-app"
  );
};

/**
 * Handles checking if a brand name exists in Redis.
 *
 * Workflow:
 * 1. Queries Redis using the exists prefix and normalized brand name.
 * 2. Returns true if the brand exists, false otherwise.
 *
 * @param brandName - The name of the brand.
 * @returns A promise resolving to a boolean indicating if the brand exists.
 */
export const getBrandNameExistFromRedis = async (
  brandName: string
): Promise<boolean> => {
  const result = await redis.getSession<string | null>(
    `${PREFIX.EXISTS}${brandName.toLowerCase().trim()}`,
    "product-app"
  );
  return result === "exists";
};

/**
 * Handles setting an existence flag for a brand slug in Redis.
 *
 * Workflow:
 * 1. Stores an "exists" flag in Redis with the SLUG_EXISTS prefix and normalized brand slug.
 *
 * @param brandSlug - The slug of the brand.
 * @returns A promise resolving when the flag is set.
 */
export const setBrandSlugExistInRedis = async (
  brandSlug: string
): Promise<void> => {
  await redis.setSession(
    `${PREFIX.SLUG_EXISTS}${brandSlug.toLowerCase().trim()}`,
    "exists",
    "product-app"
  );
};

/**
 * Handles caching brand information in Redis by brand ID.
 *
 * Workflow:
 * 1. Stores the data in Redis with the brand prefix and brand ID.
 *
 * @param brandId - The ID of the brand.
 * @param data - The Brand entity to cache.
 * @returns A promise resolving when the brand is cached.
 */
export const setBrandInfoByIdInRedis = async (
  brandId: string,
  data: BrandResponseSession
): Promise<void> => {
  await redis.setSession(`${PREFIX.BRAND}${brandId}`, data, "product-app");
};

/**
 * Handles setting an existence flag for a brand name in Redis.
 *
 * Workflow:
 * 1. Stores an "exists" flag in Redis with the exists prefix and normalized brand name.
 *
 * @param brandName - The name of the brand.
 * @returns A promise resolving when the flag is set.
 */
export const setBrandNameExistInRedis = async (
  brandName: string
): Promise<void> => {
  await redis.setSession(
    `${PREFIX.EXISTS}${brandName.toLowerCase().trim()}`,
    "exists",
    "product-app"
  );
};

/**
 * Handles removal of brand information from Redis by brand ID.
 *
 * Workflow:
 * 1. Deletes the brand data from Redis using the brand prefix and brand ID.
 *
 * @param brandId - The ID of the brand.
 * @returns A promise resolving when the brand data is removed.
 */
export const removeBrandInfoByIdFromRedis = async (
  brandId: string
): Promise<void> => {
  await redis.deleteSession(`${PREFIX.BRAND}${brandId}`, "product-app");
};

/**
 * Handles removal of the existence flag for a brand name from Redis.
 *
 * Workflow:
 * 1. Deletes the existence flag from Redis using the exists prefix and normalized brand name.
 *
 * @param brandName - The name of the brand.
 * @returns A promise resolving when the flag is removed.
 */
export const removeBrandNameExistFromRedis = async (
  brandName: string
): Promise<void> => {
  await redis.deleteSession(
    `${PREFIX.EXISTS}${brandName.toLowerCase().trim()}`,
    "product-app"
  );
};

/**
 * Handles removal of the existence flag for a brand slug from Redis.
 *
 * Workflow:
 * 1. Deletes the existence flag from Redis using the SLUG_EXISTS prefix and normalized brand slug.
 *
 * @param brandSlug - The slug of the brand.
 * @returns A promise resolving when the flag is removed.
 */
export const removeBrandSlugExistFromRedis = async (
  brandSlug: string
): Promise<void> => {
  await redis.deleteSession(
    `${PREFIX.SLUG_EXISTS}${brandSlug.toLowerCase().trim()}`,
    "product-app"
  );
};
