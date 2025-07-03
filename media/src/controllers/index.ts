/**
 * Exports GraphQL mutations for managing medias.
 *
 * Workflow:
 * 1. Provides mutations for uploading new files.
 * 2. Enables deletion of medias that are no longer needed.
 * 3. Supports restoration of previously deleted medias.
 * 4. Allows updating media details .
 */
export { restoreMediaFiles } from "./mutations/restore-media-files/restore-media-files";
export { updateMediaFileInfo } from "./mutations/update-media-file-info/update-media-file-info";
export { deleteMediaFiles } from "./mutations/upload-and-delete/delete-media-files";
export { uploadMediaFiles } from "./mutations/upload-and-delete/upload-media-files";

/**
 * Exports GraphQL queries for retrieving medias.
 *
 * Workflow:
 * 1. Provides queries for fetching details of a specific media by its ID.
 * 2. Enables retrieval of all medias in the system.
 */
export { getMediaById } from "./queries/get-media/get-media-by-id";
export { getAllMedias } from "./queries/get-media/get-medias";
