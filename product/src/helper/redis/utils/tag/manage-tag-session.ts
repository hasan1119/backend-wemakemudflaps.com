import { Tag } from "../../../../entities";
import { redis } from "../../redis";

// Defines prefixes for Redis keys used for tag session and user count caching
const PREFIX = {
  TAG: "tag:",
  EXISTS: "tag-exists:",
};

/**
 * Handles retrieval of tag information from Redis by tag ID.
 *
 * Workflow:
 * 1. Queries Redis using the tag prefix and tag ID.
 * 2. Returns the parsed TagSession or null if not found.
 *
 * @param tagId - The ID of the tag.
 * @returns A promise resolving to the TagSession or null if not found.
 */
export const getTagInfoByTagIdFromRedis = async (
  tagId: string
): Promise<Tag | null> => {
  return redis.getSession<Tag | null>(`${PREFIX.TAG}${tagId}`, "product-app");
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
