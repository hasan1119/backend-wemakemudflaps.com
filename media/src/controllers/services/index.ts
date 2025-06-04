/**
 * Exports service for verifying user authentication status.
 *
 * Workflow:
 * 1. Provides a function to check if a user is authenticated.
 */
export { checkUserAuth } from "./session-check/session-check";

/**
 * Exports services for managing permissions for media access.
 *
 * Workflow:
 * 1. Provides a function to check if a user has permission to access media.
 */
export { checkUserPermission } from "./permission/get-user-permission.service";

/**
 * Exports services for retrieving media files.
 *
 * Workflow:
 * 1. Provides functions to get a single media file by ID or multiple by IDs.
 * 2. Supports paginated and searchable media file retrieval.
 */
export {
  getAllMedias,
  getMediaById,
  getMediaByIds,
} from "./get-media/get-media";

/**
 * Exports services for uploading and deleting media files.
 *
 * Workflow:
 * 1. Supports uploading media files.
 * 2. Allows soft deletion, permanent deletion, and restoration of media files.
 */
export {
  deleteMediaFiles,
  deleteSoftMedia,
  restoreMedia,
  uploadMediaFiles,
} from "./upload-and-delete/upload-and-delete-media-files";

/**
 * Exports service for updating media file information.
 *
 * Workflow:
 * 1. Provides functionality to update metadata or details of existing media files.
 */
export { updateMediaFileInfo } from "./update-media-file-info/update-media-file-info";
