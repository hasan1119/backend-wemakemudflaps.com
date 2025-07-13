import { Category } from "../../../../entities";
import { CategoryPaginationDataSession } from "../../../../types";
import { redis } from "../../redis";

// Defines prefixes for Redis keys used for category session and user count caching
const PREFIX = {
  CATEGORY: "category:",
  EXISTS: "category-exists:",
  SLUG_EXISTS: "category-slug-exists:",
  COUNT: "categories-count:",
  LIST: "categories-list:",
};

/**
 * Handles retrieval of cached categories and total count from Redis based on query parameters.
 *
 * Workflow:
 * 1. Constructs Redis keys using page, limit, search term, sortBy, and sortOrder for categories and count.
 * 2. Queries Redis to retrieve the cached categories array and count concurrently.
 * 3. Returns an object containing the parsed Category array and count, or null if not found.
 *
 * @param page - The page number for pagination.
 * @param limit - The number of categories per page.
 * @param search - Optional search term or null for no search.
 * @param sortBy - The field to sort by (default: "createdAt").
 * @param sortOrder - The sort order (default: "desc").
 * @returns A promise resolving to an object with categories (Category array or null) and count (number or null).
 */
export const getCategoriesAndCountFromRedis = async (
  page: number,
  limit: number,
  search: string | null,
  sortBy: string = "createdAt",
  sortOrder: string = "desc"
): Promise<{
  categories: CategoryPaginationDataSession[] | null;
  count: number | null;
}> => {
  const searchKeyWord = search ? search.toLowerCase().trim() : "none";
  const categoriesKey = `${PREFIX.LIST}page:${page}:limit:${limit}:search:${searchKeyWord}:sort:${sortBy}:${sortOrder}`;
  const countKey = `${PREFIX.COUNT}search:${searchKeyWord}:sort:${sortBy}:${sortOrder}`;

  const [categoriesResult, countResult] = await Promise.all([
    redis.getSession<CategoryPaginationDataSession[] | null>(
      categoriesKey,
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

  return { categories: categoriesResult, count };
};

/**
 * Handles caching of categories and total count in Redis based on query parameters.
 *
 * Workflow:
 * 1. Constructs Redis keys using page, limit, search term, sortBy, and sortOrder for categories and count.
 * 2. Stores the categories array and count in Redis with the specified TTL.
 *
 * @param page - The page number for pagination.
 * @param limit - The number of categories per page.
 * @param search - Optional search term or null for no search.
 * @param sortBy - The field to sort by (default: "createdAt").
 * @param sortOrder - The sort order (default: "desc").
 * @param categories - The array of Category data to cache.
 * @param total - The total categories count to cache.
 * @param ttl - Optional time-to-live in seconds (default: 3600).
 * @returns A promise resolving when the categories and count are cached.
 */
export const setCategoriesAndCountInRedis = async (
  page: number,
  limit: number,
  search: string | null,
  sortBy: string = "createdAt",
  sortOrder: string = "desc",
  categories: CategoryPaginationDataSession[],
  total: number,
  ttl: number = 3600
): Promise<void> => {
  const searchKeyWord = search ? search.toLowerCase().trim() : "none";
  const categoriesKey = `${PREFIX.LIST}page:${page}:limit:${limit}:search:${searchKeyWord}:sort:${sortBy}:${sortOrder}`;
  const countKey = `${PREFIX.COUNT}search:${searchKeyWord}:sort:${sortBy}:${sortOrder}`;

  await Promise.all([
    redis.setSession(categoriesKey, categories, "product-app", ttl),
    redis.setSession(countKey, total.toString(), "product-app", ttl),
  ]);
};

/**
 * Handles removal of cached categories and count data from Redis.
 *
 * Workflow:
 * 1. Retrieves all keys in the "product-app" namespace.
 * 2. Filters keys that start with the categories list or count prefix.
 * 3. Deletes all matching keys concurrently.
 *
 * @returns A promise resolving when the categories and count data are removed.
 */
export const clearCategoriesAndCountCache = async (): Promise<void> => {
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
): Promise<Category | null> => {
  return redis.getSession<Category | null>(
    `${PREFIX.CATEGORY}${categoryId}`,
    "product-app"
  );
};

/**
 * Handles checking if a category name exists in Redis.
 *
 * Workflow:
 * 1. Queries Redis using the EXISTS prefix and normalized category name.
 * 2. Returns true if the category exists, false otherwise.
 *
 * @param categoryName - The name of the category.
 * @returns A promise resolving to a boolean indicating if the category exists.
 */
export const getCategoryNameExistFromRedis = async (
  category: Pick<Category, "name" | "parentCategory"> & {
    parentCategory?: { id?: string } | null;
  }
): Promise<boolean> => {
  const parentId = category.parentCategory?.id ?? "root";
  const key = getScopedKey(PREFIX.EXISTS, category.name, parentId);
  const result = await redis.getSession<string | null>(key, "product-app");
  return result === "exists";
};

/**
 * Handles setting an existence flag for a category slug in Redis.
 *
 * Workflow:
 * 1. Stores an "exists" flag in Redis with the SLUG_EXISTS prefix and normalized category slug from the entity.
 *
 * @param category - The Category entity.
 * @returns A promise resolving when the flag is set.
 */
export const setCategorySlugExistInRedis = async (
  category: Pick<Category, "slug">
): Promise<void> => {
  await redis.setSession(
    `${PREFIX.SLUG_EXISTS}${category.slug.toLowerCase().trim()}`,
    "exists",
    "product-app"
  );
};

/**
 * Handles caching category information in Redis by category ID.
 *
 * Workflow:
 * 1. Stores the category data in Redis with the CATEGORY prefix and category ID.
 *
 * @param categoryId - The ID of the category.
 * @param data - The Category entity to cache.
 * @returns A promise resolving when the category is cached.
 */
export const setCategoryInfoByIdInRedis = async (
  categoryId: string,
  data: Category
): Promise<void> => {
  await redis.setSession(
    `${PREFIX.CATEGORY}${categoryId}`,
    data,
    "product-app"
  );
};

/**
 * Handles setting an existence flag for a category name in Redis.
 *
 * Workflow:
 * 1. Stores an "exists" flag in Redis with the EXISTS prefix and normalized category name.
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
 * Handles removal of category information from Redis by category ID.
 *
 * Workflow:
 * 1. Deletes the category data from Redis using the CATEGORY prefix and category ID.
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
 * Handles removal of the existence flag for a category name from Redis.
 *
 * Workflow:
 * 1. Deletes the existence flag from Redis using the EXISTS prefix and normalized category name.
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
 * Handles removal of the existence flag for a category slug from Redis.
 *
 * Workflow:
 * 1. Deletes the existence flag from Redis using the SLUG_EXISTS prefix and normalized category slug from the entity.
 *
 * @param category - The Category entity.
 * @returns A promise resolving when the flag is removed.
 */
export const removeCategorySlugExistFromRedis = async (
  category: Pick<Category, "slug">
): Promise<void> => {
  await redis.deleteSession(
    `${PREFIX.SLUG_EXISTS}${category.slug.toLowerCase().trim()}`,
    "product-app"
  );
};

function getScopedKey(
  base: string,
  value: string,
  parentCategoryId?: string | null
) {
  const parent = parentCategoryId ?? "root";
  return `${base}${parent}:${value.toLowerCase().trim()}`;
}
