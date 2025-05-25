import { In } from "typeorm";
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
