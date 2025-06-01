/**
 * Exports schemas for media file upload and update operations.
 *
 * Workflow:
 * 1. Provides schemas for validating single and multiple media file uploads.
 * 2. Includes schema for updating media file metadata.
 * 3. Exports utility functions and maps for media type and category validation.
 */
export {
  categoryMap,
  createUploadMediaFilesSchema,
  mimeTypeMap,
  UpdateMediaFilesSchema,
  UploadMediaFilesSchema,
  uploadMediaInputSchema,
} from "./upload-and-update-media-files/upload-and-update-media-files";

/**
 * Exports common schemas for general use in media-related operations.
 *
 * Workflow:
 * 1. Provides schemas for UUID validation, pagination, sorting, and trash skipping.
 * 2. Includes combined schema for media-related queries.
 */
export {
  categories,
  idSchema,
  idsSchema,
  mediaCombinedSchema,
  mediaSortingSchema,
  mimeTypes,
  paginationSchema,
  skipTrashSchema,
} from "./common/common";
export type { Category, MimeType } from "./common/common";
