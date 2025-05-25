import { ILike, In, Raw } from "typeorm";
import { Media } from "../../../entities/media.entity";
import { AppDataSource } from "../../../helper";

// Initialize repository once
const mediaRepository = AppDataSource.getRepository(Media);

/**
 * Retrieves a media file from the database by its ID.
 * @param id - The ID of the media file (UUID).
 * @returns The media entity or null if not found.
 */
export const getMediaById = async (id: string): Promise<Media | null> => {
  // Retrieve media file
  return await mediaRepository.findOne({ where: { id, deletedAt: null } });
};

/**
 * Retrieves multiple media files from the database by their IDs.
 * @param ids - Array of media IDs (UUIDs).
 * @returns Array of found media entities (empty if none found).
 */
export const getMediaByIds = async (ids: string[]): Promise<Media[]> => {
  // Retrieve media files
  return await mediaRepository.find({
    where: { id: In(ids), deletedAt: null },
  });
};

/**
 * Retrieves paginated and sorted media files for a user.
 * @param page - The page number for pagination (1-based).
 * @param limit - The number of records per page.
 * @param search - The search term to filter media (optional).
 * @param sortBy - The field to sort by (e.g., "createdAt", "category").
 * @param sortOrder - The sort order ("asc" or "desc").
 * @returns Object containing media array and total count.
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
