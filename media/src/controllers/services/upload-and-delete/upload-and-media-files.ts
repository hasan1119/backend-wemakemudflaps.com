import { Media } from "../../../entities/media.entity";
import { AppDataSource } from "../../../helper";

// Initialize repository once
const mediaRepository = AppDataSource.getRepository(Media);

/**
 * Creates and saves new medias in the database.
 * @param data - Array of media creation data.
 * @returns The newly created media entities.
 */
export const uploadMediaFiles = async (data: any[]): Promise<Media[]> => {
  // Save all media entities to the database
  return await mediaRepository.save(data);
};

/**
 * Deletes media files from the database by their IDs.
 * @param ids - Array of media IDs to delete.
 * @returns {Promise<void>}
 */
export const deleteMediaFiles = async (ids: string[]): Promise<void> => {
  await mediaRepository.delete(ids);
};
