// import { Product } from "../../../../entities";
// import { ProductPaginationDataSession } from "../../../../types";
// import { redis } from "../../redis";

// // Defines prefixes for Redis keys used for product session caching
// const PREFIX = {
//   PRODUCT: "product:",
//   EXISTS: "product-exists:",
//   SLUG_EXISTS: "product-slug-exists:",
//   COUNT: "products-count:",
//   LIST: "products-list:",
// };

// /**
//  * Handles retrieval of cached products and total count from Redis based on query parameters.
//  *
//  * Workflow:
//  * 1. Constructs Redis keys using page, limit, search term, sortBy, and sortOrder for products and count.
//  * 2. Queries Redis to retrieve the cached products array and count concurrently.
//  * 3. Returns an object containing the parsed Product array and count, or null if not found.
//  *
//  * @param page - The page number for pagination.
//  * @param limit - The number of products per page.
//  * @param search - Optional search term or null for no search.
//  * @param sortBy - The field to sort by (default: "createdAt").
//  * @param sortOrder - The sort order (default: "desc").
//  * @returns A promise resolving to an object with products (Product array or null) and count (number or null).
//  */
// export const getProductsAndCountFromRedis = async (
//   page: number,
//   limit: number,
//   search: string | null,
//   sortBy: string = "createdAt",
//   sortOrder: string = "desc"
// ): Promise<{
//   products: ProductPaginationDataSession[] | null;
//   count: number | null;
// }> => {
//   const searchKeyWord = search ? search.toLowerCase().trim() : "none";
//   const productsKey = `${PREFIX.LIST}page:${page}:limit:${limit}:search:${searchKeyWord}:sort:${sortBy}:${sortOrder}`;
//   const countKey = `${PREFIX.COUNT}search:${searchKeyWord}:sort:${sortBy}:${sortOrder}`;

//   const [productsResult, countResult] = await Promise.all([
//     redis.getSession<ProductPaginationDataSession[] | null>(
//       productsKey,
//       "product-app"
//     ),
//     redis.getSession<string | null>(countKey, "product-app"),
//   ]);

//   const count =
//     countResult !== null
//       ? isNaN(Number(countResult))
//         ? 0
//         : Number(countResult)
//       : null;

//   return { products: productsResult, count };
// };

// /**
//  * Handles caching of products and total count in Redis based on query parameters.
//  *
//  * Workflow:
//  * 1. Constructs Redis keys using page, limit, search term, sortBy, and sortOrder for products and count.
//  * 2. Stores the products array and count in Redis with the specified TTL.
//  *
//  * @param page - The page number for pagination.
//  * @param limit - The number of products per page.
//  * @param search - Optional search term or null for no search.
//  * @param sortBy - The field to sort by (default: "createdAt").
//  * @param sortOrder - The sort order (default: "desc").
//  * @param products - The array of Product data to cache.
//  * @param total - The total products count to cache.
//  * @param ttl - Optional time-to-live in seconds (default: 3600).
//  * @returns A promise resolving when the products and count are cached.
//  */
// export const setProductsAndCountInRedis = async (
//   page: number,
//   limit: number,
//   search: string | null,
//   sortBy: string = "createdAt",
//   sortOrder: string = "desc",
//   products: ProductPaginationDataSession[],
//   total: number,
//   ttl: number = 3600
// ): Promise<void> => {
//   const searchKeyWord = search ? search.toLowerCase().trim() : "none";
//   const productsKey = `${PREFIX.LIST}page:${page}:limit:${limit}:search:${searchKeyWord}:sort:${sortBy}:${sortOrder}`;
//   const countKey = `${PREFIX.COUNT}search:${searchKeyWord}:sort:${sortBy}:${sortOrder}`;

//   await Promise.all([
//     redis.setSession(productsKey, products, "product-app", ttl),
//     redis.setSession(countKey, total.toString(), "product-app", ttl),
//   ]);
// };

// /**
//  * Handles removal of cached products and count data from Redis.
//  *
//  * Workflow:
//  * 1. Retrieves all keys in the "product-app" namespace.
//  * 2. Filters keys that start with the products list or count prefix.
//  * 3. Deletes all matching keys concurrently.
//  *
//  * @returns A promise resolving when the products and count data are removed.
//  */
// export const clearProductsAndCountCache = async (): Promise<void> => {
//   const keys = await redis.getAllSessionKey("product-app");
//   const relevantKeys = keys.filter(
//     (key) => key.startsWith(PREFIX.LIST) || key.startsWith(PREFIX.COUNT)
//   );

//   if (relevantKeys.length > 0) {
//     await Promise.all(
//       relevantKeys.map((key) => redis.deleteSession(key, "product-app"))
//     );
//   }
// };

// /**
//  * Handles checking if a product slug exists in Redis.
//  *
//  * Workflow:
//  * 1. Queries Redis using the SLUG_EXISTS prefix and normalized product slug.
//  * 2. Returns true if the slug exists, false otherwise.
//  *
//  * @param productSlug - The slug of the product.
//  * @returns A promise resolving to a boolean indicating if the product slug exists.
//  */
// export const getProductSlugExistFromRedis = async (
//   productSlug: string
// ): Promise<boolean> => {
//   const result = await redis.getSession<string | null>(
//     `${PREFIX.SLUG_EXISTS}${productSlug.toLowerCase().trim()}`,
//     "product-app"
//   );
//   return result === "exists";
// };

// /**
//  * Handles retrieval of product information from Redis by product ID.
//  *
//  * Workflow:
//  * 1. Queries Redis using the PRODUCT prefix and product ID.
//  * 2. Returns the parsed Product or null if not found.
//  *
//  * @param productId - The ID of the product.
//  * @returns A promise resolving to the Product or null if not found.
//  */
// export const getProductInfoByIdFromRedis = async (
//   productId: string
// ): Promise<Product | null> => {
//   return redis.getSession<Product | null>(
//     `${PREFIX.PRODUCT}${productId}`,
//     "product-app"
//   );
// };

// /**
//  * Handles checking if a product name exists in Redis.
//  *
//  * Workflow:
//  * 1. Queries Redis using the EXISTS prefix and normalized product name.
//  * 2. Returns true if the product exists, false otherwise.
//  *
//  * @param productName - The name of the product.
//  * @returns A promise resolving to a boolean indicating if the product exists.
//  */
// export const getProductNameExistFromRedis = async (
//   productName: string
// ): Promise<boolean> => {
//   const result = await redis.getSession<string | null>(
//     `${PREFIX.EXISTS}${productName.toLowerCase().trim()}`,
//     "product-app"
//   );
//   return result === "exists";
// };

// /**
//  * Handles setting an existence flag for a product slug in Redis.
//  *
//  * Workflow:
//  * 1. Stores an "exists" flag in Redis with the SLUG_EXISTS prefix and normalized product slug.
//  *
//  * @param productSlug - The slug of the product.
//  * @returns A promise resolving when the flag is set.
//  */
// export const setProductSlugExistInRedis = async (
//   productSlug: string
// ): Promise<void> => {
//   await redis.setSession(
//     `${PREFIX.SLUG_EXISTS}${productSlug.toLowerCase().trim()}`,
//     "exists",
//     "product-app"
//   );
// };

// /**
//  * Handles caching product information in Redis by product ID.
//  *
//  * Workflow:
//  * 1. Stores the data in Redis with the PRODUCT prefix and product ID.
//  *
//  * @param productId - The ID of the product.
//  * @param data - The Product entity to cache.
//  * @returns A promise resolving when the product is cached.
//  */
// export const setProductInfoByIdInRedis = async (
//   productId: string,
//   data: Product
// ): Promise<void> => {
//   await redis.setSession(`${PREFIX.PRODUCT}${productId}`, data, "product-app");
// };

// /**
//  * Handles setting an existence flag for a product name in Redis.
//  *
//  * Workflow:
//  * 1. Stores an "exists" flag in Redis with the EXISTS prefix and normalized product name.
//  *
//  * @param productName - The name of the product.
//  * @returns A promise resolving when the flag is set.
//  */
// export const setProductNameExistInRedis = async (
//   productName: string
// ): Promise<void> => {
//   await redis.setSession(
//     `${PREFIX.EXISTS}${productName.toLowerCase().trim()}`,
//     "exists",
//     "product-app"
//   );
// };

// /**
//  * Handles removal of product information from Redis by product ID.
//  *
//  * Workflow:
//  * 1. Deletes the product data from Redis using the PRODUCT prefix and product ID.
//  *
//  * @param productId - The ID of the product.
//  * @returns A promise resolving when the product data is removed.
//  */
// export const removeProductInfoByIdFromRedis = async (
//   productId: string
// ): Promise<void> => {
//   await redis.deleteSession(`${PREFIX.PRODUCT}${productId}`, "product-app");
// };

// /**
//  * Handles removal of the existence flag for a product name from Redis.
//  *
//  * Workflow:
//  * 1. Deletes the existence flag from Redis using the EXISTS prefix and normalized product name.
//  *
//  * @param productName - The name of the product.
//  * @returns A promise resolving when the flag is removed.
//  */
// export const removeProductNameExistFromRedis = async (
//   productName: string
// ): Promise<void> => {
//   await redis.deleteSession(
//     `${PREFIX.EXISTS}${productName.toLowerCase().trim()}`,
//     "product-app"
//   );
// };

// /**
//  * Handles removal of the existence flag for a product slug from Redis.
//  *
//  * Workflow:
//  * 1. Deletes the existence flag from Redis using the SLUG_EXISTS prefix and normalized product slug.
//  *
//  * @param productSlug - The slug of the product.
//  * @returns A promise resolving when the flag is removed.
//  */
// export const removeProductSlugExistFromRedis = async (
//   productSlug: string
// ): Promise<void> => {
//   await redis.deleteSession(
//     `${PREFIX.SLUG_EXISTS}${productSlug.toLowerCase().trim()}`,
//     "product-app"
//   );
// };
