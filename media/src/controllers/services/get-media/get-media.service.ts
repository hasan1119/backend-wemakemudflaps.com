import { ILike, In, Raw } from "typeorm";
import { Media } from "../../../entities/media.entity";
import { AppDataSource } from "../../../helper";
import {
  getMediaByMediaIdFromRedis,
  setMediaByMediaIdInRedis,
} from "../../../helper/redis";

// Initialize repository once
const mediaRepository = AppDataSource.getRepository(Media);

/**
 * Handles retrieval of a media by their ID with full details.
 *
 * Workflow:
 * 1. Queries the mediaRepository to find a non-deleted media with the specified ID.
 * 2. Returns the Media entity or null if not found.
 *
 * @param id - The UUID of the media.
 * @returns A promise resolving to the Media entity or null if not found.
 */
export const getMediaById = async (id: string): Promise<Media | null> => {
  // Retrieve media file
  return await mediaRepository.findOne({ where: { id, deletedAt: null } });
};

/**
 * Handles retrieval of medias by their IDs with full details.
 *
 * Workflow:
 * 1. Queries the mediaRepository to find a non-deleted media with the specified IDs.
 * 2. Returns the Medias entity or null if not found.
 *
 * @param ids - An array of UUIDs representing the media files.
 * @returns A promise resolving to an array of Media entities or an empty array if not found.
 */
export const getMediaByIds = async (ids: string[]): Promise<Media[]> => {
  // Retrieve media files
  return await mediaRepository.find({
    where: { id: In(ids), deletedAt: null },
  });
};

/**
 * Federated reference resolver for the Media entity.
 * Used by Apollo Federation to resolve media entities by ID from other subgraphs.
 *
 * @param id - ID of the media to resolve
 * @returns Resolved Media object or null
 */
export const resolveMediaReference = async ({ id }) => {
  let mediaData = await getMediaByMediaIdFromRedis(id);

  if (!mediaData) {
    const dbMedia = await getMediaById(id);
    if (!dbMedia) return null;

    mediaData = {
      ...dbMedia,
      createdBy: dbMedia.createdBy as any,
      createdAt: dbMedia.createdAt.toISOString(),
      deletedAt: dbMedia.deletedAt ? dbMedia.deletedAt.toISOString() : null,
    };

    await setMediaByMediaIdInRedis(id, mediaData);
  }

  return mediaData;
};

/**
 * Handles fetching paginated medias with optional search and sorting.
 *
 * Workflow:
 * 1. Calculates the number of records to skip based on page and limit.
 * 2. Constructs a where clause to filter non-deleted medias and apply search conditions if provided.
 * 3. Sets sorting order for roles or other fields.
 * 4. Queries the userRepository to fetch medias with pagination and sorting.
 * 5. Returns an object with the paginated medias and total count.
 *
 * @param input - Input parameters including page, limit, search, sortBy, and sortOrder.
 * @returns A promise resolving to an object containing the paginated medias and total count.
 */
export const getAllMedias = async (
  page: number,
  limit: number,
  search: string,
  sortBy: string,
  sortOrder: string
): Promise<{ media: Media[]; total: number }> => {
  // Build where clause
  const baseCondition = { deletedAt: null };
  let where: any;

  if (search) {
    const searchConditions = [
      { ...baseCondition, title: ILike(`%${search}%`) },
      { ...baseCondition, description: ILike(`%${search}%`) },
      { ...baseCondition, fileName: ILike(`%${search}%`) },
      { ...baseCondition, altText: ILike(`%${search}%`) },
      {
        ...baseCondition,
        category: Raw(() => `"Media"."category"::text ILIKE :search`, {
          search: `%${search}%`,
        }),
      },
    ];

    // Use array of where conditions for OR logic in TypeORM
    where = searchConditions;
  } else {
    where = baseCondition;
  }

  // Calculate offset
  const offset = (page - 1) * limit;

  // Query media with pagination and sorting
  const [media, total] = await mediaRepository.findAndCount({
    where,
    order: { [sortBy]: sortOrder.toUpperCase() },
    skip: offset,
    take: limit,
  });

  return {
    media,
    total,
  };
};
