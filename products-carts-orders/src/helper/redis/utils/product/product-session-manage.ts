// import { Product } from "../../../../entities";
// import { ProductPaginationDataSession } from "../../../../types";
import crypto from "crypto";
import { Product } from "../../../../types";
import { redis } from "../../redis";

// Defines prefixes for Redis keys used for product session caching
const PREFIX = {
  PRODUCT: "product:",
  EXISTS: "product-exists:",
  SLUG: "product-slug:",
  SLUG_EXISTS: "product-slug-exists:",
  COUNT: "products-count:",
  LIST: "products-list:",
};

/**
 * Creates a stable hash from query parameters for compact Redis keys.
 * - Sorts object keys for determinism.
 * - Normalizes arrays and sets (sorted, joined).
 * - Converts nested objects consistently.
 * - Produces a short SHA1-based hash (12 chars).
 */
const createQueryHash = (params: Record<string, unknown>): string => {
  const normalize = (val: unknown): string => {
    if (val === null || val === undefined) return "none";

    if (Array.isArray(val)) {
      return `[${val.map(normalize).sort().join(",")}]`;
    }

    if (val instanceof Set) {
      return `{${Array.from(val).map(normalize).sort().join(",")}}`;
    }

    if (typeof val === "object") {
      return `{${Object.keys(val as Record<string, unknown>)
        .sort()
        .map((k) => `${k}:${normalize((val as Record<string, unknown>)[k])}`)
        .join(",")}}`;
    }

    return String(val);
  };

  const normalized = Object.keys(params)
    .sort()
    .map((key) => `${key}=${normalize(params[key])}`)
    .join("|");

  return crypto
    .createHash("sha1")
    .update(normalized)
    .digest("hex")
    .slice(0, 12);
};

/**
 * Builds Redis keys for products list and count.
 */
const buildProductCacheKeys = (
  page: number,
  limit: number,
  search: string | null,
  sortBy: string,
  sortOrder: string,
  brandIds: string[] | null,
  categoryIds: string[] | null,
  tagIds: string[] | null,
  productDeliveryType: string[] | null,
  forCustomer: boolean
) => {
  const searchKeyWord = search ? search.toLowerCase().trim() : "none";
  const queryHash = createQueryHash({
    search: searchKeyWord,
    sortBy,
    sortOrder,
    forCustomer,
    brandIds,
    categoryIds,
    tagIds,
    productDeliveryType,
  });

  return {
    productsKey: `${PREFIX.LIST}page:${page}:limit:${limit}:q:${queryHash}`,
    countKey: `${PREFIX.COUNT}q:${queryHash}`,
  };
};

/**
 * Handles retrieval of cached products and total count from Redis based on query parameters.
 *
 * Workflow:
 * 1. Constructs Redis keys using page, limit, search term, sortBy, and sortOrder for products and count.
 * 2. Queries Redis to retrieve the cached products array and count concurrently.
 * 3. Returns an object containing the parsed Product array and count, or null if not found.
 *
 * @param page - The page number for pagination.
 * @param limit - The number of products per page.
 * @param search - Optional search term or null for no search.
 * @param sortBy - The field to sort by (default: "createdAt").
 * @param sortOrder - The sort order (default: "desc").
 * @param brandIds - Optional array of brand IDs to filter by.
 * @param categoryIds - Optional array of category IDs to filter by.
 * @param tagIds - Optional array of tag IDs to filter by.
 * @param productDeliveryType - Optional array of product delivery types to filter by.
 * @param forCustomer - Boolean indicating if the request is for a customer.
 * @returns A promise resolving to an object with products (Product array or null) and count (number or null).
 */
export const getProductsAndCountFromRedis = async (
  page: number,
  limit: number,
  search: string | null,
  sortBy: string = "createdAt",
  sortOrder: string = "desc",
  brandIds: string[] | null,
  categoryIds: string[] | null,
  tagIds: string[] | null,
  productDeliveryType: string[] | null,
  forCustomer: boolean
): Promise<{
  products: Product[] | null;
  count: number | null;
}> => {
  const searchKeyWord = search ? search.toLowerCase().trim() : "none";

  // Build hash for filters
  const queryHash = createQueryHash({
    search: searchKeyWord,
    sortBy,
    sortOrder,
    forCustomer,
    brandIds,
    categoryIds,
    tagIds,
    productDeliveryType,
  });

  // Shorter, stable keys
  const productsKey = `${PREFIX.LIST}page:${page}:limit:${limit}:q:${queryHash}`;
  const countKey = `${PREFIX.COUNT}q:${queryHash}`;

  const [productsResult, countResult] = await Promise.all([
    redis.getSession<Product[] | null>(productsKey, "product-app"),
    redis.getSession<string | null>(countKey, "product-app"),
  ]);

  const count =
    countResult !== null
      ? isNaN(Number(countResult))
        ? 0
        : Number(countResult)
      : null;

  return { products: productsResult, count };
};

/**
 * Handles caching of products and total count in Redis based on query parameters.
 *
 * Workflow:
 * 1. Constructs Redis keys using page, limit, search term, sortBy, and sortOrder for products and count.
 * 2. Stores the products array and count in Redis with the specified TTL.
 *
 * @param page - The page number for pagination.
 * @param limit - The number of products per page.
 * @param search - Optional search term or null for no search.
 * @param sortBy - The field to sort by (default: "createdAt").
 * @param sortOrder - The sort order (default: "desc").
 * @param products - The array of Product data to cache.
 * @param total - The total products count to cache.
 * @param brandIds - Optional array of brand IDs to filter by.
 * @param categoryIds - Optional array of category IDs to filter by.
 * @param tagIds - Optional array of tag IDs to filter by.
 * @param productDeliveryType - Optional array of product delivery types to filter by.
 * @param forCustomer - Boolean indicating if the request is for a customer.
 * @param ttl - Optional time-to-live in seconds (default: 3600).
 * @returns A promise resolving when the products and count are cached.
 */
export const setProductsAndCountInRedis = async (
  page: number,
  limit: number,
  search: string | null,
  sortBy: string,
  sortOrder: string,
  brandIds: string[] | null,
  categoryIds: string[] | null,
  tagIds: string[] | null,
  productDeliveryType: string[] | null,
  forCustomer: boolean,
  products: Product[],
  count: number,
  ttl: number = 3600 // Default TTL of 1 hour
): Promise<void> => {
  const { productsKey, countKey } = buildProductCacheKeys(
    page,
    limit,
    search,
    sortBy,
    sortOrder,
    brandIds,
    categoryIds,
    tagIds,
    productDeliveryType,
    forCustomer
  );

  await Promise.all([
    redis.setSession(productsKey, products, "product-app", ttl),
    redis.setSession(countKey, count.toString(), "product-app", ttl),
  ]);
};

/**
 * Handles removal of cached products and count data from Redis.
 *
 * Workflow:
 * 1. Retrieves all keys in the "product-app" namespace.
 * 2. Filters keys that start with the products list or count prefix.
 * 3. Deletes all matching keys concurrently.
 *
 * @returns A promise resolving when the products and count data are removed.
 */
export const clearProductsAndCountCache = async (): Promise<void> => {
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
 * Handles retrieval of product information from Redis by product ID.
 *
 * Workflow:
 * 1. Queries Redis using the PRODUCT prefix and product ID.
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
 * Handles caching product information in Redis by product ID.
 *
 * Workflow:
 * 1. Stores the data in Redis with the PRODUCT prefix and product ID.
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
 * Handles removal of product information from Redis by product ID.
 *
 * Workflow:
 * 1. Deletes the product data from Redis using the PRODUCT prefix and product ID.
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
 * Handles caching product information in Redis by product slug.
 *
 * Workflow:
 * 1. Stores the data in Redis with the SLUG prefix and normalized product slug.
 *
 * @param productSlug - The slug of the product.
 * @param data - The Product entity to cache.
 * @returns A promise resolving when the product is cached.
 */
export const setProductInfoBySlugInRedis = async (
  productSlug: string,
  data: Product
): Promise<void> => {
  await redis.setSession(
    `${PREFIX.SLUG}${productSlug.toLowerCase().trim()}`,
    data,
    "product-app"
  );
};

/**
 * Handles retrieval of product information from Redis by product slug.
 *
 * Workflow:
 * 1. Queries Redis using the SLUG prefix and normalized product slug.
 * 2. Returns the parsed Product or null if not found.
 *
 * @param productSlug - The slug of the product.
 * @returns A promise resolving to the Product or null if not found.
 */
export const getProductInfoBySlugFromRedis = async (
  productSlug: string
): Promise<Product | null> => {
  return redis.getSession<Product | null>(
    `${PREFIX.SLUG}${productSlug.toLowerCase().trim()}`,
    "product-app"
  );
};

/**
 * Handles removal of product information from Redis by product slug.
 *
 * Workflow:
 * 1. Deletes the product data from Redis using the SLUG prefix and normalized product slug.
 *
 * @param productSlug - The slug of the product.
 * @returns A promise resolving when the product data is removed.
 */
export const removeProductInfoBySlugFromRedis = async (
  productSlug: string
): Promise<void> => {
  await redis.deleteSession(
    `${PREFIX.SLUG}${productSlug.toLowerCase().trim()}`,
    "product-app"
  );
};
