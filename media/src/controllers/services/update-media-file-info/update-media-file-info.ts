import { Media } from "../../../entities/media.entity";
import { AppDataSource } from "../../../helper";

// Initialize repository once
const mediaRepository = AppDataSource.getRepository(Media);

/**
 * Updates media files' information in the database by their IDs.
 * @param data - Object containing media ID and fields to update (title, description, altText, dimension, length, category).
 * @returns {Promise<void>}
 */

export const updateMediaFileInfo = async (data: Media): Promise<void> => {
  await mediaRepository.update({ id: data.id }, data);
};
