import { Tag } from "../../../../entities";
import { TagPaginationDataSession } from "../../../../types";
import { redis } from "../../redis";

// Defines prefixes for Redis keys used for tag session and user count caching
const PREFIX = {
  TAG: "tag:",
  EXISTS: "tag-exists:",
  SLUG_EXISTS: "tag-slug-exists:",
  COUNT: "tags-count:",
  LIST: "tags-list:",
};

/**
 * Retrieves a paginated list of tags from Redis cache.
 *
 * @param page - Current page number.
 * @param limit - Number of tags per page.
 * @param search - Search query (optional).
 * @param sortBy - Field to sort by (default is 'createdAt').
 * @param sortOrder - Sort order ('asc' or 'desc', default is 'desc').
 * @returns A promise resolving to an array of Tag or null.
 */
export const getTagsFromRedis = async (
  page: number,
  limit: number,
  search: string = "",
  sortBy: string = "createdAt",
  sortOrder: string = "desc"
): Promise<TagPaginationDataSession[] | null> => {
  const key = `${PREFIX.LIST}${page}:${limit}:${search}:${sortBy}:${sortOrder}`;
  return redis.getSession<TagPaginationDataSession[] | null>(
    key,
    "product-app"
  );
};

/**
 * Retrieves the total count of tags from Redis cache.
 *
 * @param search - Search query (optional).
 * @param sortBy - Field used for sorting.
 * @param sortOrder - Sort order.
 * @returns A promise resolving to the count of tags.
 */
export const getTagsCountFromRedis = async (
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
 * Caches a paginated list of tags in Redis with optional TTL.
 *
 * @param page - Current page number.
 * @param limit - Number of tags per page.
 * @param search - Search query.
 * @param sortBy - Field to sort by.
 * @param sortOrder - Sort order ('asc' or 'desc').
 * @param tags - Array of Tag objects to cache.
 * @param ttl - Optional time-to-live in seconds (default: 30).
 */
export const setTagsInRedis = async (
  page: number,
  limit: number,
  search: string,
  sortBy: string,
  sortOrder: string,
  tags: TagPaginationDataSession[],
  ttl: number = 30
): Promise<void> => {
  const key = `${PREFIX.LIST}${page}:${limit}:${search}:${sortBy}:${sortOrder}`;
  await redis.setSession(key, tags, "product-app", ttl);
};

/**
 * Caches the total tag count in Redis with optional TTL.
 *
 * @param search - Search query.
 * @param sortBy - Field used for sorting.
 * @param sortOrder - Sort order.
 * @param count - Total number of tags.
 * @param ttl - Optional time-to-live in seconds (default: 30).
 */
export const setTagsCountInRedis = async (
  search: string,
  sortBy: string,
  sortOrder: string,
  count: number,
  ttl: number = 30
): Promise<void> => {
  const key = `${PREFIX.COUNT}${search}:${sortBy}:${sortOrder}`;
  await redis.setSession(key, count.toString(), "product-app", ttl);
};

/**
 * Handles retrieval of tag information from Redis by tag ID.
 *
 * Workflow:
 * 1. Queries Redis using the tag prefix and tag ID.
 * 2. Returns the parsed Tag or null if not found.
 *
 * @param tagId - The ID of the tag.
 * @returns A promise resolving to the Tag or null if not found.
 */
export const getTagInfoByTagIdFromRedis = async (
  tagId: string
): Promise<Tag | null> => {
  return redis.getSession<Tag | null>(`${PREFIX.TAG}${tagId}`, "product-app");
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
 * Handles checking if a tag name exists in Redis.
 *
 * Workflow:
 * 1. Queries Redis using the exists prefix and normalized tag name.
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
 * Handles caching tag information in Redis by tag ID.
 *
 * Workflow:
 * 1. Maps the provided tag data to a response format using mapTagToResponse.
 * 2. Stores the mapped data in Redis with the tag prefix and tag ID.
 *
 * @param tagId - The ID of the tag.
 * @param data - The Tag entity to cache.
 * @returns A promise resolving when the tag is cached.
 */
export const setTagInfoByTagIdInRedis = async (
  tagId: string,
  data: Tag
): Promise<void> => {
  await redis.setSession(`${PREFIX.TAG}${tagId}`, data, "product-app");
};

/**
 * Handles setting an existence flag for a tag name in Redis.
 *
 * Workflow:
 * 1. Stores an "exists" flag in Redis with the exists prefix and normalized tag name.
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
 * 1. Deletes the tag data from Redis using the tag prefix and tag ID.
 *
 * @param tagId - The ID of the tag.
 * @returns A promise resolving when the tag data is removed.
 */
export const removeTagInfoByTagIdFromRedis = async (
  tagId: string
): Promise<void> => {
  await redis.deleteSession(`${PREFIX.TAG}${tagId}`, "product-app");
};

/**
 * Handles removal of the existence flag for a tag name from Redis.
 *
 * Workflow:
 * 1. Deletes the existence flag from Redis using the exists prefix and normalized tag name.
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
 * Removes the existence flag for a tag slug from Redis.
 *
 * @param tagSlug - The slug of the tag.
 * @returns A promise that resolves when the flag is removed.
 */
export const removeTagSlugExistFromRedis = async (
  tagSlug: string
): Promise<void> => {
  await redis.deleteSession(
    `${PREFIX.SLUG_EXISTS}${tagSlug.toLowerCase().trim()}`,
    "product-app"
  );
};
