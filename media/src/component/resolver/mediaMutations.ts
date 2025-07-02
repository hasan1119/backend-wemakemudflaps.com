import {
  deleteMediaFiles,
  restoreMediaFiles,
  updateMediaFileInfo,
  uploadAvatar,
  uploadMediaFiles,
} from "../../controllers";

/**
 * Defines GraphQL mutation resolvers for media-related operations.
 *
 * Workflow:
 * 1. Maps mutation fields to controller functions for media management.
 * 2. Handles media file uploads, updates, deletions, and restorations.
 * 3. Ensures efficient media file lifecycle management through structured mutations.
 */
export const mediaMutationsResolver = {
  Mutation: {
    /**
     * Uploads new media files and stores them in the system.
     */
    uploadMediaFiles,

    /**
     * Uploads new media file avatar and stores them in the system.
     */
    uploadAvatar,

    /**
     * Deletes specified media files, marking them as removed.
     */
    deleteMediaFiles,

    /**
     * Restores previously deleted media files, making them available again.
     */
    restoreMediaFiles,

    /**
     * Updates metadata and information for a specific media file.
     */
    updateMediaFileInfo,
  },
};
