import { In } from "typeorm";
import { Media } from "../../../entities/media.entity";
import { AppDataSource } from "../../../helper";

// Initialize repository once
const mediaRepository = AppDataSource.getRepository(Media);

/**
 * Uploads and saves new media files in the database.
 *
 * Workflow:
 * 1. Saves all media records provided in the input data.
 * 2. Returns an array of the newly created media entities.
 *
 * @param data - An array containing media creation data.
 * @returns A promise resolving to an array of the newly saved Media entities.
 */
export const uploadMediaFiles = async (data: any[]): Promise<Media[]> => {
  // Save all media entities to the database
  return await mediaRepository.save(data);
};

/**
 * Soft deletes media by setting the deletedAt timestamp.
 *
 * Workflow:
 * 1. Updates the media records with the specified IDs, setting their deletedAt timestamp to the current date.
 * 2. Does not return any value, as the function resolves to void.
 *
 * @param ids - An array of UUIDs representing the media to be soft deleted.
 * @returns A promise that resolves when the operation is complete with the updated medias.
 */
export const deleteSoftMedia = async (ids: string[]): Promise<Media[]> => {
  // Update deletedAt timestamp for the specified media
  await mediaRepository.update({ id: In(ids) }, { deletedAt: new Date() });

  // Return the updated records
  return mediaRepository.find({ where: { id: In(ids) } });
};

/**
 * Deletes media files from the database using their IDs.
 *
 * Workflow:
 * 1. Deletes all media records corresponding to the specified IDs.
 * 2. Does not return any value, as the function resolves to void.
 *
 * @param ids - An array of UUIDs representing the media files to be deleted.
 * @returns A promise that resolves when the deletion operation is complete.
 */
export const deleteMediaFiles = async (ids: string[]): Promise<void> => {
  // Remove media entities from the database
  await mediaRepository.delete(ids);
};

/**
 * Handles restoration of multiple soft-deleted medias by clearing their deletedAt timestamps.
 *
 * Workflow:
 * 1. Checks if the provided array of media IDs is non-empty.
 * 2. Updates the specified medias to clear their deletedAt timestamps.
 * 3. Retrieves the restored medias.
 * 4. Returns the array of restored Media entities.
 *
 * @param ids - Array of media UUIDs to restore.
 * @returns A promise resolving to an array of restored Media entities.
 */
export const restoreMedia = async (ids: string[]): Promise<Media[]> => {
  if (!ids.length) return [];

  // Clear deletedAt timestamps for specified medias
  await mediaRepository.update({ id: In(ids) }, { deletedAt: null });

  // Retrieve restored medias with relations
  const restoredMedias = await mediaRepository.find({
    where: { id: In(ids) },
  });

  return restoredMedias;
};
