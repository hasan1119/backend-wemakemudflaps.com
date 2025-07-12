import { Brand } from "../../../../entities";
import { BrandPaginationDataSession } from "../../../../types";
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
 * Retrieves a paginated list of brands from Redis cache.
 *
 * @param page - Current page number.
 * @param limit - Number of brands per page.
 * @param search - Search query (optional).
 * @param sortBy - Field to sort by (default is 'createdAt').
 * @param sortOrder - Sort order ('asc' or 'desc', default is 'desc').
 * @returns A promise resolving to an array of Brand or null.
 */
export const getBrandsFromRedis = async (
  page: number,
  limit: number,
  search: string = "",
  sortBy: string = "createdAt",
  sortOrder: string = "desc"
): Promise<BrandPaginationDataSession[] | null> => {
  const key = `${PREFIX.LIST}${page}:${limit}:${search}:${sortBy}:${sortOrder}`;
  return redis.getSession<BrandPaginationDataSession[] | null>(
    key,
    "product-app"
  );
};

/**
 * Retrieves the total count of brands from Redis cache.
 *
 * @param search - Search query (optional).
 * @param sortBy - Field used for sorting.
 * @param sortOrder - Sort order.
 * @returns A promise resolving to the count of brands.
 */
export const getBrandsCountFromRedis = async (
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
): Promise<Brand | null> => {
  return redis.getSession<Brand | null>(
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
 * Caches a paginated list of brands in Redis.
 *
 * @param page - Current page number.
 * @param limit - Number of brands per page.
 * @param search - Search query.
 * @param sortBy - Field to sort by.
 * @param sortOrder - Sort order ('asc' or 'desc').
 * @param ttl - Optional time-to-live in seconds(1 hr) (default: 3600).
 * @param brands - Array of Brand objects to cache.
 */
export const setBrandsInRedis = async (
  page: number,
  limit: number,
  search: string,
  sortBy: string,
  sortOrder: string,
  brands: BrandPaginationDataSession[],
  ttl: number = 3600
): Promise<void> => {
  const key = `${PREFIX.LIST}${page}:${limit}:${search}:${sortBy}:${sortOrder}`;
  await redis.setSession(key, brands, "product-app", ttl);
};

/**
 * Caches the total brand count in Redis.
 *
 * @param search - Search query.
 * @param sortBy - Field used for sorting.
 * @param sortOrder - Sort order.
 * @param count - Total number of brands.
 * @param ttl - Optional time-to-live in seconds(1 hr) (default: 3600).
 */
export const setBrandsCountInRedis = async (
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
  data: Brand
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
 * Removes the existence flag for a brand slug from Redis.
 *
 * @param brandSlug - The slug of the brand.
 * @returns A promise that resolves when the flag is removed.
 */
export const removeBrandSlugExistFromRedis = async (
  brandSlug: string
): Promise<void> => {
  await redis.deleteSession(
    `${PREFIX.SLUG_EXISTS}${brandSlug.toLowerCase().trim()}`,
    "product-app"
  );
};

/**
 * Deletes all Redis cache entries related to brand list and count.
 *
 * Order of deletion:
 * 1. Delete list-related keys (paginated data)
 * 2. Delete count-related keys (total counts)
 */
export const clearAllBrandSearchCache = async (): Promise<void> => {
  const keys = await redis.getAllSessionKey("product-app");

  const listKeys = keys.filter((key) => key.startsWith(PREFIX.LIST));
  const countKeys = keys.filter((key) => key.startsWith(PREFIX.COUNT));

  // Delete list keys first
  if (listKeys.length > 0) {
    await Promise.all(
      listKeys.map((key) => redis.deleteSession(key, "product-app"))
    );
  }

  // Then delete count keys
  if (countKeys.length > 0) {
    await Promise.all(
      countKeys.map((key) => redis.deleteSession(key, "product-app"))
    );
  }
};

/**
 * Deletes all Redis cache entries related to brand counts.
 */
export const clearAllBrandCountCache = async (): Promise<void> => {
  const keys = await redis.getAllSessionKey("product-app");
  const countKeys = keys.filter((key) => key.startsWith(PREFIX.COUNT));

  if (countKeys.length > 0) {
    await Promise.all(
      countKeys.map((key) => redis.deleteSession(key, "product-app"))
    );
  }
};
