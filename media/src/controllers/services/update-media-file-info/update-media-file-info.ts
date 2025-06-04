import { Media } from "../../../entities/media.entity";
import { AppDataSource } from "../../../helper";

// Initialize repository once
const mediaRepository = AppDataSource.getRepository(Media);

/**
 * Updates media file information in the database using its ID.
 *
 * Workflow:
 * 1. Updates the specified media record with the provided data fields.
 * 2. Does not return any value, as the function resolves to void.
 *
 * @param data - An object containing the media ID and fields to update (title, description, altText, dimension, length, category).
 * @returns A promise that resolves when the update operation is complete.
 */
export const updateMediaFileInfo = async (data: Media): Promise<Media> => {
  // Update media entity with the specified fields
  await mediaRepository.update({ id: data.id }, data);

  return mediaRepository.findOne({
    where: {
      id: data.id,
    },
  });
};
