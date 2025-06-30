import {
  Category as CategoryPaginationDataSession,
  CategoryResponse,
  SubCategoryResponse,
} from "../../../../types";
import { redis } from "../../redis";

// Defines prefixes for Redis keys used for category session and user count caching
const PREFIX = {
  CATEGORY: "category:",
  SUB_CATEGORY: "sub-category:",
  EXISTS: "category-exists:",
  SLUG_EXISTS: "category-slug-exists:",
  COUNT: "categories-count:",
  LIST: "category-list:",
  SUBCATEGORY_SLUG_EXISTS: "subcategory-slug-exists:",
  SUBCATEGORY_EXISTS: "subcategory-exists:",
};

/**
 * Generates the Redis key for sub-category name existence.
 *
 * If parentId is provided, namespaces the key by parent ID to ensure uniqueness within the parent.
 * If not, treats it as a top-level subcategory.
 *
 * @param subCategoryName - The name of the subcategory.
 * @param parentId - (Optional) ID of the parent category or subcategory.
 * @returns Redis key string.
 */
export const getSubCategoryNameKey = (
  subCategoryName: string,
  parentId?: string
): string => {
  const name = subCategoryName.toLowerCase().trim();
  return parentId
    ? `${PREFIX.SUBCATEGORY_EXISTS}${parentId}:${name}`
    : `${PREFIX.SUBCATEGORY_EXISTS}${name}`;
};

/**
 * Generates the Redis key for sub-category slug existence.
 *
 * If parentId is provided, the key is namespaced by parent ID to support nested subcategories.
 * If not, the key is flat (useful for top-level subcategories).
 *
 * @param subCategorySlug - The slug of the subcategory.
 * @param parentId - (Optional) ID of the parent category or subcategory.
 * @returns Redis key string.
 */
const getSubCategorySlugKey = (
  subCategorySlug: string,
  parentId?: string
): string => {
  const slug = subCategorySlug.toLowerCase().trim();
  return parentId
    ? `${PREFIX.SUBCATEGORY_SLUG_EXISTS}${parentId}:${slug}`
    : `${PREFIX.SUBCATEGORY_SLUG_EXISTS}${slug}`;
};

/**
 * Retrieves a paginated list of categories from Redis cache.
 *
 * @param page - Current page number.
 * @param limit - Number of categories per page.
 * @param search - Search query (optional).
 * @param sortBy - Field to sort by (default is 'createdAt').
 * @param sortOrder - Sort order ('asc' or 'desc', default is 'desc').
 * @returns A promise resolving to an array of Category or null.
 */
export const getCategoriesFromRedis = async (
  page: number,
  limit: number,
  search: string = "",
  sortBy: string = "createdAt",
  sortOrder: string = "desc"
): Promise<CategoryPaginationDataSession[] | null> => {
  const key = `${PREFIX.LIST}${page}:${limit}:${search}:${sortBy}:${sortOrder}`;
  return redis.getSession<CategoryPaginationDataSession[] | null>(
    key,
    "product-app"
  );
};

/**
 * Retrieves the total count of categories from Redis cache.
 *
 * @param search - Search query (optional).
 * @param sortBy - Field used for sorting.
 * @param sortOrder - Sort order.
 * @returns A promise resolving to the count of categories.
 */
export const getCategoriesCountFromRedis = async (
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
 * Handles checking if a category slug exists in Redis.
 *
 * Workflow:
 * 1. Queries Redis using the SLUG_EXISTS prefix and normalized category slug.
 * 2. Returns true if the slug exists, false otherwise.
 *
 * @param categorySlug - The slug of the category.
 * @returns A promise resolving to a boolean indicating if the category slug exists.
 */
export const getCategorySlugExistFromRedis = async (
  categorySlug: string
): Promise<boolean> => {
  const result = await redis.getSession<string | null>(
    `${PREFIX.SLUG_EXISTS}${categorySlug.toLowerCase().trim()}`,
    "product-app"
  );
  return result === "exists";
};

/**
 * Checks if a sub-category slug exists in Redis (optionally within a parent).
 *
 * @param subCategorySlug - The slug of the subcategory.
 * @param parentId - (Optional) ID of the parent category or subcategory.
 * @returns A promise resolving to a boolean indicating if the slug exists.
 */
export const getSubCategorySlugExistFromRedis = async (
  subCategorySlug: string,
  parentId?: string
): Promise<boolean> => {
  const key = getSubCategorySlugKey(subCategorySlug, parentId);
  const result = await redis.getSession<string | null>(key, "product-app");
  return result === "exists";
};

/**
 * Handles retrieval of category information from Redis by category ID.
 *
 * Workflow:
 * 1. Queries Redis using the category prefix and category ID.
 * 2. Returns the parsed Category or null if not found.
 *
 * @param categoryId - The ID of the category.
 * @returns A promise resolving to the Category or null if not found.
 */
export const getCategoryInfoByIdFromRedis = async (
  categoryId: string
): Promise<CategoryResponse | null> => {
  return redis.getSession<CategoryResponse | null>(
    `${PREFIX.CATEGORY}${categoryId}`,
    "product-app"
  );
};

/**
 * Retrieves subcategory information from Redis using subcategory ID.
 *
 * Workflow:
 * 1. Constructs the Redis key using the INFO prefix and subcategory ID.
 * 2. Queries Redis and parses the result as a SubCategory entity.
 * 3. Returns the subcategory or null if not found.
 *
 * @param id - The unique ID of the subcategory.
 * @returns A promise resolving to a SubCategoryResponse object or null.
 */
export const getSubCategoryInfoByIdFromRedis = async (
  id: string
): Promise<SubCategoryResponse | null> => {
  return redis.getSession<SubCategoryResponse | null>(
    `${PREFIX.SUB_CATEGORY}${id}`,
    "product-app"
  );
};

/**
 * Handles checking if a category name exists in Redis.
 *
 * Workflow:
 * 1. Queries Redis using the exists prefix and normalized category name.
 * 2. Returns true if the category exists, false otherwise.
 *
 * @param categoryName - The name of the category.
 * @returns A promise resolving to a boolean indicating if the category exists.
 */
export const getCategoryNameExistFromRedis = async (
  categoryName: string
): Promise<boolean> => {
  const result = await redis.getSession<string | null>(
    `${PREFIX.EXISTS}${categoryName.toLowerCase().trim()}`,
    "product-app"
  );
  return result === "exists";
};

/**
 * Checks if a sub-category name exists in Redis (optionally within a parent).
 *
 * @param subCategoryName - The name of the subcategory.
 * @param parentId - (Optional) ID of the parent category or subcategory.
 * @returns A promise resolving to a boolean indicating if the name exists.
 */
export const getSubCategoryNameExistFromRedis = async (
  subCategoryName: string,
  parentId?: string
): Promise<boolean> => {
  const key = getSubCategoryNameKey(subCategoryName, parentId);
  const result = await redis.getSession<string | null>(key, "product-app");
  return result === "exists";
};

/**
 * Caches a paginated list of categories in Redis.
 *
 * @param page - Current page number.
 * @param limit - Number of categories per page.
 * @param search - Search query.
 * @param sortBy - Field to sort by.
 * @param sortOrder - Sort order ('asc' or 'desc').
 * @param ttl - Optional time-to-live in seconds(1 hr) (default: 3600).
 * @param categories - Array of Category objects to cache.
 */
export const setCategoriesInRedis = async (
  page: number,
  limit: number,
  search: string,
  sortBy: string,
  sortOrder: string,
  categories: CategoryPaginationDataSession[],
  ttl: number = 3600
): Promise<void> => {
  const key = `${PREFIX.LIST}${page}:${limit}:${search}:${sortBy}:${sortOrder}`;
  await redis.setSession(key, categories, "product-app", ttl);
};

/**
 * Caches the total category count in Redis.
 *
 * @param search - Search query.
 * @param sortBy - Field used for sorting.
 * @param sortOrder - Sort order.
 * @param count - Total number of categories.
 * @param ttl - Optional time-to-live in seconds(1 hr) (default: 3600).
 */
export const setCategoriesCountInRedis = async (
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
 * Handles setting an existence flag for a category slug in Redis.
 *
 * Workflow:
 * 1. Stores an "exists" flag in Redis with the SLUG_EXISTS prefix and normalized category slug.
 *
 * @param categorySlug - The slug of the category.
 * @returns A promise resolving when the flag is set.
 */
export const setCategorySlugExistInRedis = async (
  categorySlug: string
): Promise<void> => {
  await redis.setSession(
    `${PREFIX.SLUG_EXISTS}${categorySlug.toLowerCase().trim()}`,
    "exists",
    "product-app"
  );
};

/**
 * Sets an existence flag for a sub-category slug in Redis (optionally within a parent).
 *
 * @param subCategorySlug - The slug of the subcategory.
 * @param parentId - (Optional) ID of the parent category or subcategory.
 */
export const setSubCategorySlugExistInRedis = async (
  subCategorySlug: string,
  parentId?: string
): Promise<void> => {
  const key = getSubCategorySlugKey(subCategorySlug, parentId);
  await redis.setSession(key, "exists", "product-app");
};

/**
 * Handles caching category information in Redis by category ID.
 *
 * Workflow:
 * 1. Maps the provided category data to a response format using mapCategoryToResponse.
 * 2. Stores the mapped data in Redis with the category prefix and category ID.
 *
 * @param categoryId - The ID of the category.
 * @param data - The Category entity to cache.
 * @returns A promise resolving when the category is cached.
 */
export const setCategoryInfoByIdInRedis = async (
  categoryId: string,
  data: CategoryResponse
): Promise<void> => {
  await redis.setSession(
    `${PREFIX.CATEGORY}${categoryId}`,
    data,
    "product-app"
  );
};

/**
 * Caches subcategory data in Redis by subcategory ID.
 *
 * Workflow:
 * 1. Constructs the Redis key using the INFO prefix and subcategory ID.
 * 2. Stores the SubCategory entity as a session in Redis.
 *
 * @param id - The unique ID of the subcategory.
 * @param data - The SubCategory entity to cache.
 */
export const setSubCategoryInfoByIdInRedis = async (
  id: string,
  data: SubCategoryResponse
): Promise<void> => {
  await redis.setSession(`${PREFIX.SUB_CATEGORY}${id}`, data, "product-app");
};

/**
 * Handles setting an existence flag for a category name in Redis.
 *
 * Workflow:
 * 1. Stores an "exists" flag in Redis with the exists prefix and normalized category name.
 *
 * @param categoryName - The name of the category.
 * @returns A promise resolving when the flag is set.
 */
export const setCategoryNameExistInRedis = async (
  categoryName: string
): Promise<void> => {
  await redis.setSession(
    `${PREFIX.EXISTS}${categoryName.toLowerCase().trim()}`,
    "exists",
    "product-app"
  );
};

/**
 * Sets an existence flag for a sub-category name in Redis (optionally within a parent).
 *
 * @param subCategoryName - The name of the subcategory.
 * @param parentId - (Optional) ID of the parent category or subcategory.
 */
export const setSubCategoryNameExistInRedis = async (
  subCategoryName: string,
  parentId?: string
): Promise<void> => {
  const key = getSubCategoryNameKey(subCategoryName, parentId);
  await redis.setSession(key, "exists", "product-app");
};

/**
 * Handles removal of category information from Redis by category ID.
 *
 * Workflow:
 * 1. Deletes the category data from Redis using the category prefix and category ID.
 *
 * @param categoryId - The ID of the category.
 * @returns A promise resolving when the category data is removed.
 */
export const removeCategoryInfoByIdFromRedis = async (
  categoryId: string
): Promise<void> => {
  await redis.deleteSession(`${PREFIX.CATEGORY}${categoryId}`, "product-app");
};

/**
 * Removes cached subcategory information from Redis using subcategory ID.
 *
 * Workflow:
 * 1. Constructs the Redis key using the INFO prefix and subcategory ID.
 * 2. Deletes the Redis session associated with the subcategory.
 *
 * @param id - The unique ID of the subcategory.
 */
export const removeSubCategoryInfoByIdFromRedis = async (
  id: string
): Promise<void> => {
  await redis.deleteSession(`${PREFIX.SUB_CATEGORY}${id}`, "product-app");
};

/**
 * Handles removal of the existence flag for a category name from Redis.
 *
 * Workflow:
 * 1. Deletes the existence flag from Redis using the exists prefix and normalized category name.
 *
 * @param categoryName - The name of the category.
 * @returns A promise resolving when the flag is removed.
 */
export const removeCategoryNameExistFromRedis = async (
  categoryName: string
): Promise<void> => {
  await redis.deleteSession(
    `${PREFIX.EXISTS}${categoryName.toLowerCase().trim()}`,
    "product-app"
  );
};

/**
 * Removes the existence flag for a sub-category name from Redis (optionally within a parent).
 *
 * @param subCategoryName - The name of the subcategory.
 * @param parentId - (Optional) ID of the parent category or subcategory.
 */
export const removeSubCategoryNameExistFromRedis = async (
  subCategoryName: string,
  parentId?: string
): Promise<void> => {
  const key = getSubCategoryNameKey(subCategoryName, parentId);
  await redis.deleteSession(key, "product-app");
};

/**
 * Removes the existence flag for a category slug from Redis.
 *
 * @param categorySlug - The slug of the category.
 * @returns A promise that resolves when the flag is removed.
 */
export const removeCategorySlugExistFromRedis = async (
  categorySlug: string
): Promise<void> => {
  await redis.deleteSession(
    `${PREFIX.SLUG_EXISTS}${categorySlug.toLowerCase().trim()}`,
    "product-app"
  );
};

/**
 * Removes the existence flag for a sub-category slug from Redis (optionally within a parent).
 *
 * @param subCategorySlug - The slug of the subcategory.
 * @param parentId - (Optional) ID of the parent category or subcategory.
 */
export const removeSubCategorySlugExistFromRedis = async (
  subCategorySlug: string,
  parentId?: string
): Promise<void> => {
  const key = getSubCategorySlugKey(subCategorySlug, parentId);
  await redis.deleteSession(key, "product-app");
};

/**
 * Deletes all Redis cache entries related to category list and count.
 *
 * Order of deletion:
 * 1. Delete list-related keys (paginated data)
 * 2. Delete count-related keys (total counts)
 */
export const clearAllCategorySearchCache = async (): Promise<void> => {
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
