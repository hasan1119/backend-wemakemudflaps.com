import { z } from "zod";

// Defines an array of media mimetype names used in media schemas
export const mimeTypes = [
  // Images
  "image/jpeg", // .jpg, .jpeg
  "image/png", // .png
  "image/gif", // .gif
  "image/bmp", // .bmp
  "image/webp", // .webp
  "image/svg+xml", // .svg
  "image/tiff", // .tif, .tiff
  "image/x-icon", // .ico
  "image/heic", // .heic
  "image/heif", // .heif
  "image/jp2", // .jp2
  "image/jpx", // .jpx
  "image/jpm", // .jpm
  "image/avif", // .avif
  "image/x-portable-anymap", // .pnm
  "image/x-portable-bitmap", // .pbm
  "image/x-portable-graymap", // .pgm
  "image/x-portable-pixmap", // .ppm
  "image/x-rgb", // .rgb
  "image/x-xbitmap", // .xbm
  "image/x-xpixmap", // .xpm
  "image/x-xwindowdump", // .xwd

  // Videos
  "video/mp4", // .mp4
  "video/mpeg", // .mpeg, .mpg
  "video/ogg", // .ogv
  "video/webm", // .webm
  "video/x-msvideo", // .avi
  "video/x-flv", // .flv
  "video/x-m4v", // .m4v
  "video/x-ms-wmv", // .wmv
  "video/x-ms-asf", // .asf
  "video/x-matroska", // .mkv
  "video/quicktime", // .mov, .qt
  "video/3gpp", // .3gp
  "video/3gpp2", // .3g2
  "video/h261", // .h261
  "video/h263", // .h263
  "video/h264", // .h264
  "video/jpeg", // .jpgv
  "video/jpm", // .jpm
  "video/mj2", // .mj2
  "video/mp2t", // .ts
  "video/x-f4v", // .f4v
  "video/x-fli", // .fli
  "video/x-mng", // .mng
  "video/x-smv", // .smv

  // Documents
  "application/pdf", // .pdf
  "application/msword", // .doc, .dot
  "application/vnd.ms-excel", // .xls, .xlt, .xla
  "application/vnd.ms-powerpoint", // .ppt, .pot, .pps, .ppa
  "application/vnd.oasis.opendocument.text", // .odt
  "application/vnd.oasis.opendocument.spreadsheet", // .ods
  "application/vnd.oasis.opendocument.presentation", // .odp
  "application/vnd.oasis.opendocument.graphics", // .odg
  "application/vnd.oasis.opendocument.chart", // .odc
  "application/vnd.oasis.opendocument.formula", // .odf
  "application/vnd.oasis.opendocument.image", // .odi
  "application/rtf", // .rtf
  "application/x-abiword", // .abw
  "application/vnd.lotus-1-2-3", // .123
  "application/vnd.lotus-approach", // .apr
  "application/vnd.lotus-freelance", // .pre
  "application/vnd.lotus-organizer", // .org
  "application/vnd.lotus-screencam", // .scm
  "application/vnd.lotus-wordpro", // .lwp
  "application/vnd.visio", // .vsd, .vdx, .vssx, .vstx
];

// Defines an array of media category names used in media schemas
export const categories = [
  "Profile",
  "Product",
  "Product Review",
  "Product Return",
  "Order",
  "Complain",
  "Banner",
  "Site Logo",
  "Site Favicon",
  "Carousel",
  "Category",
  "Sub Category",
  "Brand",
  "Promotion",
  "Invoice",
  "Shipping Label",
  "Site Settings",
];

// Defines a TypeScript type for mimetype names as a union of literals
export type MimeType =
  // Images
  | "image/jpeg"
  | "image/png"
  | "image/gif"
  | "image/bmp"
  | "image/webp"
  | "image/svg+xml"
  | "image/tiff"
  | "image/x-icon"
  | "image/heic"
  | "image/heif"
  | "image/jp2"
  | "image/jpx"
  | "image/jpm"
  | "image/avif"
  | "image/x-portable-anymap"
  | "image/x-portable-bitmap"
  | "image/x-portable-graymap"
  | "image/x-portable-pixmap"
  | "image/x-rgb"
  | "image/x-xbitmap"
  | "image/x-xpixmap"
  | "image/x-xwindowdump"
  // Videos
  | "video/mp4"
  | "video/mpeg"
  | "video/ogg"
  | "video/webm"
  | "video/x-msvideo"
  | "video/x-flv"
  | "video/x-m4v"
  | "video/x-ms-wmv"
  | "video/x-ms-asf"
  | "video/x-matroska"
  | "video/quicktime"
  | "video/3gpp"
  | "video/3gpp2"
  | "video/h261"
  | "video/h263"
  | "video/h264"
  | "video/jpeg"
  | "video/jpm"
  | "video/mj2"
  | "video/mp2t"
  | "video/x-f4v"
  | "video/x-fli"
  | "video/x-mng"
  | "video/x-smv"
  // Documents
  | "application/pdf"
  | "application/msword"
  | "application/vnd.ms-excel"
  | "application/vnd.ms-powerpoint"
  | "application/vnd.openxmlformats-officedocument.wordprocessingml.document"
  | "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
  | "application/vnd.openxmlformats-officedocument.presentationml.presentation"
  | "application/vnd.oasis.opendocument.text"
  | "application/vnd.oasis.opendocument.spreadsheet"
  | "application/vnd.oasis.opendocument.presentation"
  | "application/vnd.oasis.opendocument.graphics"
  | "application/vnd.oasis.opendocument.chart"
  | "application/vnd.oasis.opendocument.formula"
  | "application/vnd.oasis.opendocument.image"
  | "application/rtf"
  | "application/x-abiword"
  | "application/vnd.lotus-1-2-3"
  | "application/vnd.lotus-approach"
  | "application/vnd.lotus-freelance"
  | "application/vnd.lotus-organizer"
  | "application/vnd.lotus-screencam"
  | "application/vnd.lotus-wordpro"
  | "application/vnd.visio";

// Defines a TypeScript type for category names as a union of literals
export type Category =
  | "Profile"
  | "Product"
  | "Product Review"
  | "Product Return"
  | "Order"
  | "Complain"
  | "Banner"
  | "Site Logo"
  | "Site Favicon"
  | "Carousel"
  | "Category"
  | "Sub Category"
  | "Brand"
  | "Promotion"
  | "Invoice"
  | "Shipping Label"
  | "Site Settings";

/**
 * Defines the schema for validating a single UUID.
 *
 * Workflow:
 * 1. Validates that the id field is a valid UUID string.
 *
 * @property id - The UUID string to validate.
 */
export const idSchema = z.object({
  id: z.string().uuid({ message: "Invalid UUID format" }),
});

/**
 * Defines the schema for validating an array of UUIDs.
 *
 * Workflow:
 * 1. Validates that the ids field is a non-empty array of valid UUID strings.
 *
 * @property ids - An array of UUID strings (at least one required).
 */
export const idsSchema = z.object({
  ids: z
    .array(z.string().uuid({ message: "Invalid UUID format" }))
    .min(1, { message: "At least one UUID is required" }),
});

/**
 * Defines the schema for validating the skipTrash flag.
 *
 * Workflow:
 * 1. Validates that skipTrash is a boolean value.
 *
 * @property skipTrash - Boolean flag to indicate skipping trash.
 */
export const skipTrashSchema = z.object({
  skipTrash: z.boolean().refine((val) => typeof val === "boolean", {
    message: "skipTrash must be a boolean value",
  }),
});

/**
 * Defines the schema for validating pagination parameters.
 *
 * Workflow:
 * 1. Validates page and limit as positive numbers (limit max 100).
 * 2. Allows an optional search term (max 100 chars, nullable).
 *
 * @property page - The page number (minimum 1).
 * @property limit - The number of items per page (1-100).
 * @property search - Optional search term (max 100 chars).
 */
export const paginationSchema = z.object({
  page: z.number().min(1, { message: "Page number must be at least 1" }),
  limit: z
    .number()
    .min(1, { message: "Limit must be at least 1" })
    .max(100, { message: "Limit must not exceed 100" }),
  search: z
    .string()
    .min(0, { message: "Search term is required" })
    .max(100, { message: "Search term is too long" })
    .nullable()
    .optional(),
});

/**
 * Defines the schema for validating media sorting parameters.
 *
 * Workflow:
 * 1. Validates sortBy as one of the allowed fields (title, description, category, createdBy, createdAt).
 * 2. Validates sortOrder as either 'asc' or 'desc'.
 * 3. Allows both fields to be nullable or optional.
 *
 * @property sortBy - Field to sort by  (title, description, category, createdBy, createdAt).
 * @property sortOrder - Sort order direction (asc, desc).
 */
export const mediaSortingSchema = z.object({
  sortBy: z
    .enum(["title", "description", "category", "createdAt", "deletedAt"], {
      message:
        "Sort field must be one of: title, description, category, createdAt, deleteAt",
    })
    .nullable()
    .optional(),
  sortOrder: z
    .enum(["asc", "desc"], { message: "Sort order must be 'asc' or 'desc'" })
    .nullable()
    .optional(),
});

// Combine pagination and sorting schemas for validation
export const mediaCombinedSchema = z.intersection(
  paginationSchema,
  mediaSortingSchema
);
