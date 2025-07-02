import { Media } from "../../../../types";
import { redis } from "../../redis";

// Prefixes for Redis keys used for media session caching
const PREFIX = {
  LIST: "medias:",
  MEDIA: "media:",
};

/**
 * Retrieves a paginated list of medias from Redis cache.
 *
 * @param page - Current page number.
 * @param limit - Number of medias per page.
 * @param search - Search query (optional).
 * @param sortBy - Field to sort by (default is 'createdAt').
 * @param sortOrder - Sort order ('asc' or 'desc', default is 'desc').
 * @returns A promise resolving to an array of Media or null.
 */
export const getMediasFromRedis = async (
  page: number,
  limit: number,
  search: string = "",
  sortBy: string = "createdAt",
  sortOrder: string = "desc"
): Promise<Media[] | null> => {
  const key = `${PREFIX.LIST}${page}:${limit}:${search}:${sortBy}:${sortOrder}`;
  return redis.getSession<Media[] | null>(key, "media-app");
};

/**
 * Retrieves media data from Redis using the media ID.
 *
 * Workflow:
 * 1. Queries Redis using the media prefix and media ID.
 * 2. Returns the parsed media data or null if not found.
 *
 * @param mediaId - The ID of the media.
 * @returns A promise resolving to the Media object or null if not found.
 */
export const getMediaByMediaIdFromRedis = async (
  mediaId: string
): Promise<Media | null> => {
  return redis.getSession<Media | null>(
    `${PREFIX.MEDIA}${mediaId}`,
    "media-app"
  );
};

/**
 * Caches a paginated list of medias in Redis.
 *
 * @param page - Current page number.
 * @param limit - Number of medias per page.
 * @param search - Search query.
 * @param sortBy - Field to sort by.
 * @param sortOrder - Sort order ('asc' or 'desc').
 * @param ttl - Optional time-to-live in seconds(1 hr) (default: 3600).
 * @param medias - Array of Media objects to cache.
 */
export const setMediasInRedis = async (
  page: number,
  limit: number,
  search: string,
  sortBy: string,
  sortOrder: string,
  medias: Media[],
  ttl: number = 3600
): Promise<void> => {
  const key = `${PREFIX.LIST}${page}:${limit}:${search}:${sortBy}:${sortOrder}`;
  await redis.setSession(key, medias, "media-app", ttl);
};

/**
 * Stores media data in Redis using the media ID.
 *
 * @param mediaId - The ID of the media.
 * @param media - The media object to store.
 * @returns A promise resolving to void after storing the media in Redis.
 */
export const setMediaByMediaIdInRedis = async (
  mediaId: string,
  media: Media
): Promise<void> => {
  return redis.setSession(`${PREFIX.MEDIA}${mediaId}`, media, "media-app");
};

/**
 * Removes media data from Redis using the media ID.
 *
 * @param mediaId - The ID of the media to remove.
 * @returns A promise resolving to void after removing the media from Redis.
 */
export const removeMediaByMediaIdFromRedis = async (
  mediaId: string
): Promise<void> => {
  return redis.deleteSession(`${PREFIX.MEDIA}${mediaId}`, "media-app");
};

/**
 * Deletes all Redis cache entries related to media list and count.
 *
 * Order of deletion:
 * 1. Delete list-related keys (paginated data)
 * 2. Delete count-related keys (total counts)
 */
export const clearAllMediaSearchCache = async (): Promise<void> => {
  const keys = await redis.getAllSessionKey("media-app");

  const listKeys = keys.filter((key) => key.startsWith(PREFIX.LIST));

  // Delete list
  if (listKeys.length > 0) {
    await Promise.all(
      listKeys.map((key) => redis.deleteSession(key, "media-app"))
    );
  }
};
