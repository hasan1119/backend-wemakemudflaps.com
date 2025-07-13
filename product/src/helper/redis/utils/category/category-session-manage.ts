// import {
//   CategoryDataResponse,
//   CategoryPaginationDataSession,
//   SubCategoryDataResponse,
// } from "../../../../types";
// import { redis } from "../../redis";

// // Defines prefixes for Redis keys used for category session and user count caching
// const PREFIX = {
//   CATEGORY: "category:",
//   SUB_CATEGORY: "sub-category:",
//   EXISTS: "category-exists:",
//   SLUG_EXISTS: "category-slug-exists:",
//   COUNT: "categories-count:",
//   LIST: "category-list:",
//   SUBCATEGORY_SLUG_EXISTS: "subcategory-slug-exists:",
//   SUBCATEGORY_EXISTS: "subcategory-exists:",
// };

// /**
//  * Generates the Redis key for sub-category name existence.
//  *
//  * If parentId is provided, namespaces the key by parent ID to ensure uniqueness within the parent.
//  * If not, treats it as a top-level subcategory.
//  *
//  * @param subCategoryName - The name of the subcategory.
//  * @param parentId - (Optional) ID of the parent category or subcategory.
//  * @returns Redis key string.
//  */
// export const getSubCategoryNameKey = (
//   subCategoryName: string,
//   parentId?: string
// ): string => {
//   const name = subCategoryName.toLowerCase().trim();
//   return parentId
//     ? `${PREFIX.SUBCATEGORY_EXISTS}${parentId}:${name}`
//     : `${PREFIX.SUBCATEGORY_EXISTS}${name}`;
// };

// /**
//  * Generates the Redis key for sub-category slug existence.
//  *
//  * If parentId is provided, the key is namespaced by parent ID to support nested subcategories.
//  * If not, the key is flat (useful for top-level subcategories).
//  *
//  * @param subCategorySlug - The slug of the subcategory.
//  * @param parentId - (Optional) ID of the parent category or subcategory.
//  * @returns Redis key string.
//  */
// const getSubCategorySlugKey = (
//   subCategorySlug: string,
//   parentId?: string
// ): string => {
//   const slug = subCategorySlug.toLowerCase().trim();
//   return parentId
//     ? `${PREFIX.SUBCATEGORY_SLUG_EXISTS}${parentId}:${slug}`
//     : `${PREFIX.SUBCATEGORY_SLUG_EXISTS}${slug}`;
// };

// /**
//  * Handles retrieval of cached categories and total count from Redis based on query parameters.
//  *
//  * Workflow:
//  * 1. Constructs Redis keys using page, limit, search term, sortBy, and sortOrder for categories and count.
//  * 2. Queries Redis to retrieve the cached categories array and count concurrently.
//  * 3. Returns an object containing the parsed Category array and count, or null if not found.
//  *
//  * @param page - The page number for pagination.
//  * @param limit - The number of categories per page.
//  * @param search - Optional search term or null for no search.
//  * @param sortBy - The field to sort by (default: "createdAt").
//  * @param sortOrder - The sort order (default: "desc").
//  * @returns A promise resolving to an object with categories (Category array or null) and count (number or null).
//  */
// export const getCategoriesAndCountFromRedis = async (
//   page: number,
//   limit: number,
//   search: string | null,
//   sortBy: string = "createdAt",
//   sortOrder: string = "desc"
// ): Promise<{
//   categories: CategoryPaginationDataSession[] | null;
//   count: number | null;
// }> => {
//   const searchKeyWord = search ? search.toLowerCase().trim() : "none";
//   const categoriesKey = `${PREFIX.LIST}page:${page}:limit:${limit}:search:${searchKeyWord}:sort:${sortBy}:${sortOrder}`;
//   const countKey = `${PREFIX.COUNT}search:${searchKeyWord}:sort:${sortBy}:${sortOrder}`;

//   const [categoriesResult, countResult] = await Promise.all([
//     redis.getSession<CategoryPaginationDataSession[] | null>(
//       categoriesKey,
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

//   return { categories: categoriesResult, count };
// };

// /**
//  * Handles caching of categories and total count in Redis based on query parameters.
//  *
//  * Workflow:
//  * 1. Constructs Redis keys using page, limit, search term, sortBy, and sortOrder for categories and count.
//  * 2. Stores the categories array and count in Redis with the specified TTL.
//  *
//  * @param page - The page number for pagination.
//  * @param limit - The number of categories per page.
//  * @param search - Optional search term or null for no search.
//  * @param sortBy - The field to sort by (default: "createdAt").
//  * @param sortOrder - The sort order (default: "desc").
//  * @param categories - The array of Category data to cache.
//  * @param total - The total categories count to cache.
//  * @param ttl - Optional time-to-live in seconds (default: 3600).
//  * @returns A promise resolving when the categories and count are cached.
//  */
// export const setCategoriesAndCountInRedis = async (
//   page: number,
//   limit: number,
//   search: string | null,
//   sortBy: string = "createdAt",
//   sortOrder: string = "desc",
//   categories: CategoryPaginationDataSession[],
//   total: number,
//   ttl: number = 3600
// ): Promise<void> => {
//   const searchKeyWord = search ? search.toLowerCase().trim() : "none";
//   const categoriesKey = `${PREFIX.LIST}page:${page}:limit:${limit}:search:${searchKeyWord}:sort:${sortBy}:${sortOrder}`;
//   const countKey = `${PREFIX.COUNT}search:${searchKeyWord}:sort:${sortBy}:${sortOrder}`;

//   await Promise.all([
//     redis.setSession(categoriesKey, categories, "product-app", ttl),
//     redis.setSession(countKey, total.toString(), "product-app", ttl),
//   ]);
// };

// /**
//  * Handles removal of cached categories and count data from Redis.
//  *
//  * Workflow:
//  * 1. Retrieves all keys in the "product-app" namespace.
//  * 2. Filters keys that start with the categories list or count prefix.
//  * 3. Deletes all matching keys concurrently.
//  *
//  * @returns A promise resolving when the categories and count data are removed.
//  */
// export const clearCategoriesAndCountCache = async (): Promise<void> => {
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
//  * Handles checking if a category slug exists in Redis.
//  *
//  * Workflow:
//  * 1. Queries Redis using the SLUG_EXISTS prefix and normalized category slug.
//  * 2. Returns true if the slug exists, false otherwise.
//  *
//  * @param categorySlug - The slug of the category.
//  * @returns A promise resolving to a boolean indicating if the category slug exists.
//  */
// export const getCategorySlugExistFromRedis = async (
//   categorySlug: string
// ): Promise<boolean> => {
//   const result = await redis.getSession<string | null>(
//     `${PREFIX.SLUG_EXISTS}${categorySlug.toLowerCase().trim()}`,
//     "product-app"
//   );
//   return result === "exists";
// };

// /**
//  * Checks if a sub-category slug exists in Redis (optionally within a parent).
//  *
//  * Workflow:
//  * 1. Constructs the Redis key using the SLUG_EXISTS prefix, optionally namespaced by parent ID.
//  * 2. Queries Redis and checks if the result is "exists".
//  * 3. Returns true if the slug exists, false otherwise.
//  *
//  * @param subCategorySlug - The slug of the subcategory.
//  * @param parentId - (Optional) ID of the parent category or subcategory.
//  * @returns A promise resolving to a boolean indicating if the slug exists.
//  */
// export const getSubCategorySlugExistFromRedis = async (
//   subCategorySlug: string,
//   parentId?: string
// ): Promise<boolean> => {
//   const key = getSubCategorySlugKey(subCategorySlug, parentId);
//   const result = await redis.getSession<string | null>(key, "product-app");
//   return result === "exists";
// };

// /**
//  * Handles retrieval of category information from Redis by category ID.
//  *
//  * Workflow:
//  * 1. Queries Redis using the category prefix and category ID.
//  * 2. Returns the parsed Category or null if not found.
//  *
//  * @param categoryId - The ID of the category.
//  * @returns A promise resolving to the Category or null if not found.
//  */
// export const getCategoryInfoByIdFromRedis = async (
//   categoryId: string
// ): Promise<CategoryDataResponse | null> => {
//   return redis.getSession<CategoryDataResponse | null>(
//     `${PREFIX.CATEGORY}${categoryId}`,
//     "product-app"
//   );
// };

// /**
//  * Retrieves subcategory information from Redis using subcategory ID.
//  *
//  * Workflow:
//  * 1. Constructs the Redis key using the SUB_CATEGORY prefix and subcategory ID.
//  * 2. Queries Redis and parses the result as a SubCategory entity.
//  * 3. Returns the subcategory or null if not found.
//  *
//  * @param id - The unique ID of the subcategory.
//  * @returns A promise resolving to a SubCategoryResponse object or null.
//  */
// export const getSubCategoryInfoByIdFromRedis = async (
//   id: string
// ): Promise<SubCategoryDataResponse | null> => {
//   return redis.getSession<SubCategoryDataResponse | null>(
//     `${PREFIX.SUB_CATEGORY}${id}`,
//     "product-app"
//   );
// };

// /**
//  * Handles checking if a category name exists in Redis.
//  *
//  * Workflow:
//  * 1. Queries Redis using the EXISTS prefix and normalized category name.
//  * 2. Returns true if the category exists, false otherwise.
//  *
//  * @param categoryName - The name of the category.
//  * @returns A promise resolving to a boolean indicating if the category exists.
//  */
// export const getCategoryNameExistFromRedis = async (
//   categoryName: string
// ): Promise<boolean> => {
//   const result = await redis.getSession<string | null>(
//     `${PREFIX.EXISTS}${categoryName.toLowerCase().trim()}`,
//     "product-app"
//   );
//   return result === "exists";
// };

// /**
//  * Checks if a sub-category name exists in Redis (optionally within a parent).
//  *
//  * Workflow:
//  * 1. Constructs the Redis key using the SUBCATEGORY_EXISTS prefix, optionally namespaced by parent ID.
//  * 2. Queries Redis and checks if the result is "exists".
//  * 3. Returns true if the name exists, false otherwise.
//  *
//  * @param subCategoryName - The name of the subcategory.
//  * @param parentId - (Optional) ID of the parent category or subcategory.
//  * @returns A promise resolving to a boolean indicating if the name exists.
//  */
// export const getSubCategoryNameExistFromRedis = async (
//   subCategoryName: string,
//   parentId?: string
// ): Promise<boolean> => {
//   const key = getSubCategoryNameKey(subCategoryName, parentId);
//   const result = await redis.getSession<string | null>(key, "product-app");
//   return result === "exists";
// };

// /**
//  * Handles setting an existence flag for a category slug in Redis.
//  *
//  * Workflow:
//  * 1. Stores an "exists" flag in Redis with the SLUG_EXISTS prefix and normalized category slug.
//  *
//  * @param categorySlug - The slug of the category.
//  * @returns A promise resolving when the flag is set.
//  */
// export const setCategorySlugExistInRedis = async (
//   categorySlug: string
// ): Promise<void> => {
//   await redis.setSession(
//     `${PREFIX.SLUG_EXISTS}${categorySlug.toLowerCase().trim()}`,
//     "exists",
//     "product-app"
//   );
// };

// /**
//  * Sets an existence flag for a sub-category slug in Redis (optionally within a parent).
//  *
//  * Workflow:
//  * 1. Constructs the Redis key using the SUBCATEGORY_SLUG_EXISTS prefix, optionally namespaced by parent ID.
//  * 2. Stores an "exists" flag in Redis.
//  *
//  * @param subCategorySlug - The slug of the subcategory.
//  * @param parentId - (Optional) ID of the parent category or subcategory.
//  * @returns A promise resolving when the flag is set.
//  */
// export const setSubCategorySlugExistInRedis = async (
//   subCategorySlug: string,
//   parentId?: string
// ): Promise<void> => {
//   const key = getSubCategorySlugKey(subCategorySlug, parentId);
//   await redis.setSession(key, "exists", "product-app");
// };

// /**
//  * Handles caching category information in Redis by category ID.
//  *
//  * Workflow:
//  * 1. Stores the category data in Redis with the CATEGORY prefix and category ID.
//  *
//  * @param categoryId - The ID of the category.
//  * @param data - The Category entity to cache.
//  * @returns A promise resolving when the category is cached.
//  */
// export const setCategoryInfoByIdInRedis = async (
//   categoryId: string,
//   data: CategoryDataResponse
// ): Promise<void> => {
//   await redis.setSession(
//     `${PREFIX.CATEGORY}${categoryId}`,
//     data,
//     "product-app"
//   );
// };

// /**
//  * Caches subcategory data in Redis by subcategory ID.
//  *
//  * Workflow:
//  * 1. Constructs the Redis key using the SUB_CATEGORY prefix and subcategory ID.
//  * 2. Stores the SubCategory entity as a session in Redis.
//  *
//  * @param id - The unique ID of the subcategory.
//  * @param data - The SubCategory entity to cache.
//  * @returns A promise resolving when the subcategory is cached.
//  */
// export const setSubCategoryInfoByIdInRedis = async (
//   id: string,
//   data: SubCategoryDataResponse
// ): Promise<void> => {
//   await redis.setSession(`${PREFIX.SUB_CATEGORY}${id}`, data, "product-app");
// };

// /**
//  * Handles setting an existence flag for a category name in Redis.
//  *
//  * Workflow:
//  * 1. Stores an "exists" flag in Redis with the EXISTS prefix and normalized category name.
//  *
//  * @param categoryName - The name of the category.
//  * @returns A promise resolving when the flag is set.
//  */
// export const setCategoryNameExistInRedis = async (
//   categoryName: string
// ): Promise<void> => {
//   await redis.setSession(
//     `${PREFIX.EXISTS}${categoryName.toLowerCase().trim()}`,
//     "exists",
//     "product-app"
//   );
// };

// /**
//  * Sets an existence flag for a sub-category name in Redis (optionally within a parent).
//  *
//  * Workflow:
//  * 1. Constructs the Redis key using the SUBCATEGORY_EXISTS prefix, optionally namespaced by parent ID.
//  * 2. Stores an "exists" flag in Redis.
//  *
//  * @param subCategoryName - The name of the subcategory.
//  * @param parentId - (Optional) ID of the parent category or subcategory.
//  * @returns A promise resolving when the flag is set.
//  */
// export const setSubCategoryNameExistInRedis = async (
//   subCategoryName: string,
//   parentId?: string
// ): Promise<void> => {
//   const key = getSubCategoryNameKey(subCategoryName, parentId);
//   await redis.setSession(key, "exists", "product-app");
// };

// /**
//  * Handles removal of category information from Redis by category ID.
//  *
//  * Workflow:
//  * 1. Deletes the category data from Redis using the CATEGORY prefix and category ID.
//  *
//  * @param categoryId - The ID of the category.
//  * @returns A promise resolving when the category data is removed.
//  */
// export const removeCategoryInfoByIdFromRedis = async (
//   categoryId: string
// ): Promise<void> => {
//   await redis.deleteSession(`${PREFIX.CATEGORY}${categoryId}`, "product-app");
// };

// /**
//  * Removes cached subcategory information from Redis using subcategory ID.
//  *
//  * Workflow:
//  * 1. Constructs the Redis key using the SUB_CATEGORY prefix and subcategory ID.
//  * 2. Deletes the Redis session associated with the subcategory.
//  *
//  * @param id - The unique ID of the subcategory.
//  * @returns A promise resolving when the subcategory data is removed.
//  */
// export const removeSubCategoryInfoByIdFromRedis = async (
//   id: string
// ): Promise<void> => {
//   await redis.deleteSession(`${PREFIX.SUB_CATEGORY}${id}`, "product-app");
// };

// /**
//  * Handles removal of the existence flag for a category name from Redis.
//  *
//  * Workflow:
//  * 1. Deletes the existence flag from Redis using the EXISTS prefix and normalized category name.
//  *
//  * @param categoryName - The name of the category.
//  * @returns A promise resolving when the flag is removed.
//  */
// export const removeCategoryNameExistFromRedis = async (
//   categoryName: string
// ): Promise<void> => {
//   await redis.deleteSession(
//     `${PREFIX.EXISTS}${categoryName.toLowerCase().trim()}`,
//     "product-app"
//   );
// };

// /**
//  * Removes the existence flag for a sub-category name from Redis (optionally within a parent).
//  *
//  * Workflow:
//  * 1. Constructs the Redis key using the SUBCATEGORY_EXISTS prefix, optionally namespaced by parent ID.
//  * 2. Deletes the existence flag from Redis.
//  *
//  * @param subCategoryName - The name of the subcategory.
//  * @param parentId - (Optional) ID of the parent category or subcategory.
//  * @returns A promise resolving when the flag is removed.
//  */
// export const removeSubCategoryNameExistFromRedis = async (
//   subCategoryName: string,
//   parentId?: string
// ): Promise<void> => {
//   const key = getSubCategoryNameKey(subCategoryName, parentId);
//   await redis.deleteSession(key, "product-app");
// };

// /**
//  * Handles removal of the existence flag for a category slug from Redis.
//  *
//  * Workflow:
//  * 1. Deletes the existence flag from Redis using the SLUG_EXISTS prefix and normalized category slug.
//  *
//  * @param categorySlug - The slug of the category.
//  * @returns A promise resolving when the flag is removed.
//  */
// export const removeCategorySlugExistFromRedis = async (
//   categorySlug: string
// ): Promise<void> => {
//   await redis.deleteSession(
//     `${PREFIX.SLUG_EXISTS}${categorySlug.toLowerCase().trim()}`,
//     "product-app"
//   );
// };

// /**
//  * Removes the existence flag for a sub-category slug from Redis (optionally within a parent).
//  *
//  * Workflow:
//  * 1. Constructs the Redis key using the SUBCATEGORY_SLUG_EXISTS prefix, optionally namespaced by parent ID.
//  * 2. Deletes the existence flag from Redis.
//  *
//  * @param subCategorySlug - The slug of the subcategory.
//  * @param parentId - (Optional) ID of the parent category or subcategory.
//  * @returns A promise resolving when the flag is removed.
//  */
// export const removeSubCategorySlugExistFromRedis = async (
//   subCategorySlug: string,
//   parentId?: string
// ): Promise<void> => {
//   const key = getSubCategorySlugKey(subCategorySlug, parentId);
//   await redis.deleteSession(key, "product-app");
// };
