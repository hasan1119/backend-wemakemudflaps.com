import { Product } from "../../../../entities";
// import {
//any
//  } from "../../../../types";
import { redis } from "../../redis";

// Defines prefixes for Redis keys used for product session and user count caching
const PREFIX = {
  PRODUCT: "product:",
  EXISTS: "product-exists:",
  SLUG_EXISTS: "product-slug-exists:",
  COUNT: "products-count:",
  LIST: "products-list:",
};

/**
 * Retrieves a paginated list of products from Redis cache.
 *
 * @param page - Current page number.
 * @param limit - Number of products per page.
 * @param search - Search query (optional).
 * @param sortBy - Field to sort by (default is 'createdAt').
 * @param sortOrder - Sort order ('asc' or 'desc', default is 'desc').
 * @returns A promise resolving to an array of Product or null.
 */
export const getProductsFromRedis = async (
  page: number,
  limit: number,
  search: string = "",
  sortBy: string = "createdAt",
  sortOrder: string = "desc"
): Promise<any[] | null> => {
  const key = `${PREFIX.LIST}${page}:${limit}:${search}:${sortBy}:${sortOrder}`;
  return redis.getSession<any[] | null>(key, "product-app");
};

/**
 * Retrieves the total count of products from Redis cache.
 *
 * @param search - Search query (optional).
 * @param sortBy - Field used for sorting.
 * @param sortOrder - Sort order.
 * @returns A promise resolving to the count of products.
 */
export const getProductsCountFromRedis = async (
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
 * Handles checking if a product slug exists in Redis.
 *
 * Workflow:
 * 1. Queries Redis using the SLUG_EXISTS prefix and normalized product slug.
 * 2. Returns true if the slug exists, false otherwise.
 *
 * @param productSlug - The slug of the product.
 * @returns A promise resolving to a boolean indicating if the product slug exists.
 */
export const getProductSlugExistFromRedis = async (
  productSlug: string
): Promise<boolean> => {
  const result = await redis.getSession<string | null>(
    `${PREFIX.SLUG_EXISTS}${productSlug.toLowerCase().trim()}`,
    "product-app"
  );
  return result === "exists";
};

/**
 * Handles retrieval of product information from Redis by product ID.
 *
 * Workflow:
 * 1. Queries Redis using the product prefix and product ID.
 * 2. Returns the parsed Product or null if not found.
 *
 * @param productId - The ID of the product.
 * @returns A promise resolving to the Product or null if not found.
 */
export const getProductInfoByIdFromRedis = async (
  productId: string
): Promise<Product | null> => {
  return redis.getSession<Product | null>(
    `${PREFIX.PRODUCT}${productId}`,
    "product-app"
  );
};

/**
 * Handles checking if a product name exists in Redis.
 *
 * Workflow:
 * 1. Queries Redis using the exists prefix and normalized product name.
 * 2. Returns true if the product exists, false otherwise.
 *
 * @param productName - The name of the product.
 * @returns A promise resolving to a boolean indicating if the product exists.
 */
export const getProductNameExistFromRedis = async (
  productName: string
): Promise<boolean> => {
  const result = await redis.getSession<string | null>(
    `${PREFIX.EXISTS}${productName.toLowerCase().trim()}`,
    "product-app"
  );
  return result === "exists";
};

/**
 * Caches a paginated list of products in Redis.
 *
 * @param page - Current page number.
 * @param limit - Number of products per page.
 * @param search - Search query.
 * @param sortBy - Field to sort by.
 * @param sortOrder - Sort order ('asc' or 'desc').
 * @param ttl - Optional time-to-live in seconds(1 hr) (default: 3600).
 * @param products - Array of Product objects to cache.
 */
export const setProductsInRedis = async (
  page: number,
  limit: number,
  search: string,
  sortBy: string,
  sortOrder: string,
  products: any[],
  ttl: number = 3600
): Promise<void> => {
  const key = `${PREFIX.LIST}${page}:${limit}:${search}:${sortBy}:${sortOrder}`;
  await redis.setSession(key, products, "product-app", ttl);
};

/**
 * Caches the total product count in Redis.
 *
 * @param search - Search query.
 * @param sortBy - Field used for sorting.
 * @param sortOrder - Sort order.
 * @param count - Total number of products.
 * @param ttl - Optional time-to-live in seconds(1 hr) (default: 3600).
 */
export const setProductsCountInRedis = async (
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
 * Handles setting an existence flag for a product slug in Redis.
 *
 * Workflow:
 * 1. Stores an "exists" flag in Redis with the SLUG_EXISTS prefix and normalized product slug.
 *
 * @param productSlug - The slug of the product.
 * @returns A promise resolving when the flag is set.
 */
export const setProductSlugExistInRedis = async (
  productSlug: string
): Promise<void> => {
  await redis.setSession(
    `${PREFIX.SLUG_EXISTS}${productSlug.toLowerCase().trim()}`,
    "exists",
    "product-app"
  );
};

/**
 * Handles caching product information in Redis by product ID.
 *
 * Workflow:
 * 1. Stores the data in Redis with the product prefix and product ID.
 *
 * @param productId - The ID of the product.
 * @param data - The Product entity to cache.
 * @returns A promise resolving when the product is cached.
 */
export const setProductInfoByIdInRedis = async (
  productId: string,
  data: Product
): Promise<void> => {
  await redis.setSession(`${PREFIX.PRODUCT}${productId}`, data, "product-app");
};

/**
 * Handles setting an existence flag for a product name in Redis.
 *
 * Workflow:
 * 1. Stores an "exists" flag in Redis with the exists prefix and normalized product name.
 *
 * @param productName - The name of the product.
 * @returns A promise resolving when the flag is set.
 */
export const setProductNameExistInRedis = async (
  productName: string
): Promise<void> => {
  await redis.setSession(
    `${PREFIX.EXISTS}${productName.toLowerCase().trim()}`,
    "exists",
    "product-app"
  );
};

/**
 * Handles removal of product information from Redis by product ID.
 *
 * Workflow:
 * 1. Deletes the product data from Redis using the product prefix and product ID.
 *
 * @param productId - The ID of the product.
 * @returns A promise resolving when the product data is removed.
 */
export const removeProductInfoByIdFromRedis = async (
  productId: string
): Promise<void> => {
  await redis.deleteSession(`${PREFIX.PRODUCT}${productId}`, "product-app");
};

/**
 * Handles removal of the existence flag for a product name from Redis.
 *
 * Workflow:
 * 1. Deletes the existence flag from Redis using the exists prefix and normalized product name.
 *
 * @param productName - The name of the product.
 * @returns A promise resolving when the flag is removed.
 */
export const removeProductNameExistFromRedis = async (
  productName: string
): Promise<void> => {
  await redis.deleteSession(
    `${PREFIX.EXISTS}${productName.toLowerCase().trim()}`,
    "product-app"
  );
};

/**
 * Removes the existence flag for a product slug from Redis.
 *
 * @param productSlug - The slug of the product.
 * @returns A promise that resolves when the flag is removed.
 */
export const removeProductSlugExistFromRedis = async (
  productSlug: string
): Promise<void> => {
  await redis.deleteSession(
    `${PREFIX.SLUG_EXISTS}${productSlug.toLowerCase().trim()}`,
    "product-app"
  );
};

/**
 * Deletes all Redis cache entries related to product list and count.
 *
 * Order of deletion:
 * 1. Delete list-related keys (paginated data)
 * 2. Delete count-related keys (total counts)
 */
export const clearAllProductSearchCache = async (): Promise<void> => {
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
 * Deletes all Redis cache entries related to product counts only.
 */
export const clearAllProductCountCache = async (): Promise<void> => {
  const keys = await redis.getAllSessionKey("product-app");

  const countKeys = keys.filter((key) => key.startsWith(PREFIX.COUNT));

  if (countKeys.length > 0) {
    await Promise.all(
      countKeys.map((key) => redis.deleteSession(key, "product-app"))
    );
  }
};
