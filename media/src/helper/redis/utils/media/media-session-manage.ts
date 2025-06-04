import { Media } from "../../../../types";
import { redis } from "../../redis";

// Prefixes for Redis keys used for media session caching
const PREFIX = {
  MEDIA: "media:",
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
