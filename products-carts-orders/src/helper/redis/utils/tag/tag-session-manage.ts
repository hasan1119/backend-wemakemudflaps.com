import { Tag } from "../../../../entities";
import { TagPaginationDataSession } from "../../../../types";
import { redis } from "../../redis";

// Defines prefixes for Redis keys used for tag session caching
const PREFIX = {
  TAG: "tag:",
  EXISTS: "tag-exists:",
  SLUG_EXISTS: "tag-slug-exists:",
  COUNT: "tags-count:",
  LIST: "tags-list:",
};

/**
 * Handles retrieval of cached tags and total count from Redis based on query parameters.
 *
 * Workflow:
 * 1. Constructs Redis keys using page, limit, search term, sortBy, and sortOrder for tags and count.
 * 2. Queries Redis to retrieve the cached tags array and count concurrently.
 * 3. Returns an object containing the parsed Tag array and count, or null if not found.
 *
 * @param page - The page number for pagination.
 * @param limit - The number of tags per page.
 * @param search - Optional search term or null for no search.
 * @param sortBy - The field to sort by (default: "createdAt").
 * @param sortOrder - The sort order (default: "desc").
 * @returns A promise resolving to an object with tags (Tag array or null) and count (number or null).
 */
export const getTagsAndCountFromRedis = async (
  page: number,
  limit: number,
  search: string | null,
  sortBy: string = "createdAt",
  sortOrder: string = "desc"
): Promise<{
  tags: TagPaginationDataSession[] | null;
  count: number | null;
}> => {
  const searchKeyWord = search ? search.toLowerCase().trim() : "none";
  const tagsKey = `${PREFIX.LIST}page:${page}:limit:${limit}:search:${searchKeyWord}:sort:${sortBy}:${sortOrder}`;
  const countKey = `${PREFIX.COUNT}search:${searchKeyWord}:sort:${sortBy}:${sortOrder}`;

  const [tagsResult, countResult] = await Promise.all([
    redis.getSession<TagPaginationDataSession[] | null>(tagsKey, "product-app"),
    redis.getSession<string | null>(countKey, "product-app"),
  ]);

  const count =
    countResult !== null
      ? isNaN(Number(countResult))
        ? 0
        : Number(countResult)
      : null;

  return { tags: tagsResult, count };
};

/**
 * Handles caching of tags and total count in Redis based on query parameters.
 *
 * Workflow:
 * 1. Constructs Redis keys using page, limit, search term, sortBy, and sortOrder for tags and count.
 * 2. Stores the tags array and count in Redis with the specified TTL.
 *
 * @param page - The page number for pagination.
 * @param limit - The number of tags per page.
 * @param search - Optional search term or null for no search.
 * @param sortBy - The field to sort by (default: "createdAt").
 * @param sortOrder - The sort order (default: "desc").
 * @param tags - The array of Tag data to cache.
 * @param total - The total tags count to cache.
 * @param ttl - Optional time-to-live in seconds (default: 3600).
 * @returns A promise resolving when the tags and count are cached.
 */
export const setTagsAndCountInRedis = async (
  page: number,
  limit: number,
  search: string | null,
  sortBy: string = "createdAt",
  sortOrder: string = "desc",
  tags: TagPaginationDataSession[],
  total: number,
  ttl: number = 3600
): Promise<void> => {
  const searchKeyWord = search ? search.toLowerCase().trim() : "none";
  const tagsKey = `${PREFIX.LIST}page:${page}:limit:${limit}:search:${searchKeyWord}:sort:${sortBy}:${sortOrder}`;
  const countKey = `${PREFIX.COUNT}search:${searchKeyWord}:sort:${sortBy}:${sortOrder}`;

  await Promise.all([
    redis.setSession(tagsKey, tags, "product-app", ttl),
    redis.setSession(countKey, total.toString(), "product-app", ttl),
  ]);
};

/**
 * Handles removal of cached tags and count data from Redis.
 *
 * Workflow:
 * 1. Retrieves all keys in the "product-app" namespace.
 * 2. Filters keys that start with the tags list or count prefix.
 * 3. Deletes all matching keys concurrently.
 *
 * @returns A promise resolving when the tags and count data are removed.
 */
export const clearTagsAndCountCache = async (): Promise<void> => {
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
 * Handles checking if a tag slug exists in Redis.
 *
 * Workflow:
 * 1. Queries Redis using the SLUG_EXISTS prefix and normalized tag slug.
 * 2. Returns true if the slug exists, false otherwise.
 *
 * @param tagSlug - The slug of the tag.
 * @returns A promise resolving to a boolean indicating if the tag slug exists.
 */
export const getTagSlugExistFromRedis = async (
  tagSlug: string
): Promise<boolean> => {
  const result = await redis.getSession<string | null>(
    `${PREFIX.SLUG_EXISTS}${tagSlug.toLowerCase().trim()}`,
    "product-app"
  );
  return result === "exists";
};

/**
 * Handles retrieval of tag information from Redis by tag ID.
 *
 * Workflow:
 * 1. Queries Redis using the TAG prefix and tag ID.
 * 2. Returns the parsed Tag or null if not found.
 *
 * @param tagId - The ID of the tag.
 * @returns A promise resolving to the Tag or null if not found.
 */
export const getTagInfoByIdFromRedis = async (
  tagId: string
): Promise<Tag | null> => {
  return redis.getSession<Tag | null>(`${PREFIX.TAG}${tagId}`, "product-app");
};

/**
 * Handles checking if a tag name exists in Redis.
 *
 * Workflow:
 * 1. Queries Redis using the EXISTS prefix and normalized tag name.
 * 2. Returns true if the tag exists, false otherwise.
 *
 * @param tagName - The name of the tag.
 * @returns A promise resolving to a boolean indicating if the tag exists.
 */
export const getTagNameExistFromRedis = async (
  tagName: string
): Promise<boolean> => {
  const result = await redis.getSession<string | null>(
    `${PREFIX.EXISTS}${tagName.toLowerCase().trim()}`,
    "product-app"
  );
  return result === "exists";
};

/**
 * Handles setting an existence flag for a tag slug in Redis.
 *
 * Workflow:
 * 1. Stores an "exists" flag in Redis with the SLUG_EXISTS prefix and normalized tag slug.
 *
 * @param tagSlug - The slug of the tag.
 * @returns A promise resolving when the flag is set.
 */
export const setTagSlugExistInRedis = async (
  tagSlug: string
): Promise<void> => {
  await redis.setSession(
    `${PREFIX.SLUG_EXISTS}${tagSlug.toLowerCase().trim()}`,
    "exists",
    "product-app"
  );
};

/**
 * Handles caching tag information in Redis by tag ID.
 *
 * Workflow:
 * 1. Stores the tag data in Redis with the TAG prefix and tag ID.
 *
 * @param tagId - The ID of the tag.
 * @param data - The Tag entity to cache.
 * @returns A promise resolving when the tag is cached.
 */
export const setTagInfoByIdInRedis = async (
  tagId: string,
  data: Tag
): Promise<void> => {
  await redis.setSession(`${PREFIX.TAG}${tagId}`, data, "product-app");
};

/**
 * Handles setting an existence flag for a tag name in Redis.
 *
 * Workflow:
 * 1. Stores an "exists" flag in Redis with the EXISTS prefix and normalized tag name.
 *
 * @param tagName - The name of the tag.
 * @returns A promise resolving when the flag is set.
 */
export const setTagNameExistInRedis = async (
  tagName: string
): Promise<void> => {
  await redis.setSession(
    `${PREFIX.EXISTS}${tagName.toLowerCase().trim()}`,
    "exists",
    "product-app"
  );
};

/**
 * Handles removal of tag information from Redis by tag ID.
 *
 * Workflow:
 * 1. Deletes the tag data from Redis using the TAG prefix and tag ID.
 *
 * @param tagId - The ID of the tag.
 * @returns A promise resolving when the tag data is removed.
 */
export const removeTagInfoByIdFromRedis = async (
  tagId: string
): Promise<void> => {
  await redis.deleteSession(`${PREFIX.TAG}${tagId}`, "product-app");
};

/**
 * Handles removal of the existence flag for a tag name from Redis.
 *
 * Workflow:
 * 1. Deletes the existence flag from Redis using the EXISTS prefix and normalized tag name.
 *
 * @param tagName - The name of the tag.
 * @returns A promise resolving when the flag is removed.
 */
export const removeTagNameExistFromRedis = async (
  tagName: string
): Promise<void> => {
  await redis.deleteSession(
    `${PREFIX.EXISTS}${tagName.toLowerCase().trim()}`,
    "product-app"
  );
};

/**
 * Handles removal of the existence flag for a tag slug from Redis.
 *
 * Workflow:
 * 1. Deletes the existence flag from Redis using the SLUG_EXISTS prefix and normalized tag slug.
 *
 * @param tagSlug - The slug of the tag.
 * @returns A promise resolving when the flag is removed.
 */
export const removeTagSlugExistFromRedis = async (
  tagSlug: string
): Promise<void> => {
  await redis.deleteSession(
    `${PREFIX.SLUG_EXISTS}${tagSlug.toLowerCase().trim()}`,
    "product-app"
  );
};
