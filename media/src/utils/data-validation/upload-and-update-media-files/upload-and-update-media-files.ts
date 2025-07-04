import { z } from "zod";

// Defines a mapping for mimetype values used in media schemas
export const mimeTypeMap: Record<string, string> = {
  image_jpeg: "image/jpeg",
  image_png: "image/png",
  image_gif: "image/gif",
  image_bmp: "image/bmp",
  image_webp: "image/webp",
  image_svg_xml: "image/svg+xml",
  image_tiff: "image/tiff",
  image_x_icon: "image/x-icon",
  image_heic: "image/heic",
  image_heif: "image/heif",
  image_jp2: "image/jp2",
  image_jpx: "image/jpx",
  image_jpm: "image/jpm",
  image_avif: "image/avif",
  image_x_portable_anymap: "image/x-portable-anymap",
  image_x_portable_bitmap: "image/x-portable-bitmap",
  image_x_portable_graymap: "image/x-portable-graymap",
  image_x_portable_pixmap: "image/x-portable-pixmap",
  image_x_rgb: "image/x-rgb",
  image_x_xbitmap: "image/x-xbitmap",
  image_x_xpixmap: "image/x-xpixmap",
  image_x_xwindowdump: "image/x-xwindowdump",
  video_mp4: "video/mp4",
  video_mpeg: "video/mpeg",
  video_ogg: "video/ogg",
  video_webm: "video/webm",
  video_x_msvideo: "video/x-msvideo",
  video_x_flv: "video/x-flv",
  video_x_m4v: "video/x-m4v",
  video_x_ms_wmv: "video/x-ms-wmv",
  video_x_ms_asf: "video/x-ms-asf",
  video_x_matroska: "video/x-matroska",
  video_quicktime: "video/quicktime",
  video_3gpp: "video/3gpp",
  video_3gpp2: "video/3gpp2",
  video_h261: "video/h261",
  video_h263: "video/h263",
  video_h264: "video/h264",
  video_jpeg: "video/jpeg",
  video_jpm: "video/jpm",
  video_mj2: "video/mj2",
  video_mp2t: "video/mp2t",
  video_x_f4v: "video/x-f4v",
  video_x_fli: "video/x-fli",
  video_x_mng: "video/x-mng",
  video_x_smv: "video/x-smv",
  application_pdf: "application/pdf",
  application_msword: "application/msword",
  application_vnd_ms_excel: "application/vnd.ms-excel",
  application_vnd_ms_powerpoint: "application/vnd.ms-powerpoint",
  application_vnd_openxmlformats_officedocument_wordprocessingml_document:
    "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
  application_vnd_openxmlformats_officedocument_spreadsheetml_sheet:
    "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
  application_vnd_openxmlformats_officedocument_presentationml_presentation:
    "application/vnd.openxmlformats-officedocument.presentationml.presentation",
  application_vnd_oasis_opendocument_text:
    "application/vnd.oasis.opendocument.text",
  application_vnd_oasis_opendocument_spreadsheet:
    "application/vnd.oasis.opendocument.spreadsheet",
  application_vnd_oasis_opendocument_presentation:
    "application/vnd.oasis.opendocument.presentation",
  application_vnd_oasis_opendocument_graphics:
    "application/vnd.oasis.opendocument.graphics",
  application_vnd_oasis_opendocument_chart:
    "application/vnd.oasis.opendocument.chart",
  application_vnd_oasis_opendocument_formula:
    "application/vnd.oasis.opendocument.formula",
  application_vnd_oasis_opendocument_image:
    "application/vnd.oasis.opendocument.image",
  application_rtf: "application/rtf",
  application_x_abiword: "application/x-abiword",
  application_vnd_lotus_1_2_3: "application/vnd.lotus-1-2-3",
  application_vnd_lotus_approach: "application/vnd.lotus-approach",
  application_vnd_lotus_freelance: "application/vnd.lotus-freelance",
  application_vnd_lotus_organizer: "application/vnd.lotus-organizer",
  application_vnd_lotus_screencam: "application/vnd.lotus-screencam",
  application_vnd_lotus_wordpro: "application/vnd.lotus-wordpro",
  application_vnd_visio: "application/vnd.visio",
};

// Defines a mapping for category values used in media schemas
export const categoryMap: Record<string, string> = {
  Avatar: "Avatar",
  Product: "Product",
  Product_Review: "Product Review",
  Product_Return: "Product Return",
  Order: "Order",
  Complain: "Complain",
  Banner: "Banner",
  Site_Logo: "Site Logo",
  Site_Favicon: "Site Favicon",
  Carousel: "Carousel",
  Category: "Category",
  Sub_Category: "Sub Category",
  Brand: "Brand",
  Promotion: "Promotion",
  Invoice: "Invoice",
  Shipping_Label: "Shipping Label",
  Site_Settings: "Site Settings",
};

/**
 * Defines the schema for validating media dimension information.
 *
 * Workflow:
 * 1. Ensures width and height are non-negative numbers.
 * 2. Validates unit as a required non-empty string (e.g., "px", "cm", "in").
 *
 * Example:
 * {
 *   width: 1920,
 *   height: 1080,
 *   unit: "px"
 * }
 *
 * @property width - Width of the media in given unit.
 * @property height - Height of the media in given unit.
 * @property unit - Unit of measurement (e.g., "px", "cm").
 */
export const mediaDimensionSchema = z.object({
  width: z
    .number()
    .nonnegative({ message: "Width must be a non-negative number" }),
  height: z
    .number()
    .nonnegative({ message: "Height must be a non-negative number" }),
  unit: z.string().min(1, "Unit is required (e.g., 'px', 'cm')"),
});

/**
 * Defines the schema for validating input data for a single media file upload.
 *
 * Workflow:
 * 1. Validates mediaType using a predefined mimeTypeMap.
 * 2. Ensures fileName is a non-empty string.
 * 3. Validates optional fields like title, description, altText, and dimension as trimmed strings.
 * 4. Processes length as a non-negative number, converting strings to floats if needed.
 * 5. Validates url as a valid URL format.
 * 6. Maps category to predefined values using categoryMap.
 * 7. Ensures size is a positive integer and bucketName is non-empty.
 * 8. Validates createdBy as a UUID.
 *
 * @property mediaType - Type of media file from mimeTypeMap.
 * @property fileName - Name of the media file.
 * @property title - Optional title of the media file.
 * @property description - Optional description of the media file.
 * @property altText - Optional alt text for accessibility.
 * @property dimension - Optional dimensions of the media file.
 * @property length - Optional duration or length of the media file.
 * @property url - URL where the media file is hosted.
 * @property category - Category of the media file from categoryMap.
 * @property size - Size of the media file in bytes.
 * @property bucketName - Storage bucket name for the media file.
 * @property createdBy - UUID of the user uploading the file.
 */
export const uploadMediaInputSchema = z.object({
  mediaType: z.preprocess((val) => {
    if (typeof val === "string" && mimeTypeMap[val]) {
      return mimeTypeMap[val];
    }
    return val;
  }, z.enum([...new Set(Object.values(mimeTypeMap))] as [string, ...string[]])),
  fileName: z.string().min(1, "File name is required"),
  title: z.string().trim().optional().nullable(),
  description: z.string().trim().optional().nullable(),
  altText: z.string().trim().optional().nullable(),
  dimension: mediaDimensionSchema.nullable().optional(),
  length: z.preprocess(
    (val) => (typeof val === "string" ? parseFloat(val) : val),
    z.number().nonnegative().optional().nullable()
  ),
  url: z.string().url("Invalid URL format"),
  category: z
    .preprocess((val) => {
      if (typeof val === "string" && categoryMap[val]) {
        return categoryMap[val];
      }
      return val;
    }, z.enum([...new Set(Object.values(categoryMap))] as [string, ...string[]]).nullable())
    .optional(),
  size: z.number().int().positive("Size must be a positive integer"),
  bucketName: z.string().min(1, "Bucket name is required"),
});

/**
 * Defines the schema for validating an array of media file uploads.
 *
 * Workflow:
 * 1. Applies the uploadMediaInputSchema to each item in the array.
 */
export const UploadMediaFilesSchema = z.array(uploadMediaInputSchema);

/**
 * Creates a schema to validate media uploads against the authenticated user's ID.
 *
 * Workflow:
 * 1. Takes an array of media file uploads and validates each using uploadMediaInputSchema.
 * 2. Ensures the createdBy field of each media file matches the provided contextUserId.
 *
 * @param contextUserId - UUID of the authenticated user.
 * @returns A schema that validates the array of media files.
 */
export const createUploadMediaFilesSchema = (contextUserId: string) =>
  z.array(uploadMediaInputSchema);

/**
 * Defines the schema for updating metadata of a single media file.
 *
 * Workflow:
 * 1. Validates id as a UUID.
 * 2. Allows optional updates to title, description, altText, and dimension as nullable strings.
 * 3. Processes length as a non-negative number, converting strings to floats if needed.
 * 4. Validates category using categoryMap if provided.
 *
 * @property id - UUID of the media file to update.
 * @property title - Optional updated title of the media file.
 * @property description - Optional updated description of the media file.
 * @property altText - Optional updated alt text for accessibility.
 * @property dimension - Optional updated dimensions of the media file.
 * @property length - Optional updated duration or length of the media file.
 * @property category - Optional updated category from categoryMap.
 */
export const UpdateMediaFilesSchema = z.object({
  id: z.string().uuid({ message: "Invalid UUID format" }),
  title: z
    .string({ required_error: "Title text is required" })
    .nullable()
    .optional(),
  description: z
    .string({ required_error: "Description text is required" })
    .nullable()
    .optional(),
  altText: z
    .string({ required_error: "Alt text is required" })
    .nullable()
    .optional(),
  dimension: mediaDimensionSchema.nullable().optional(),
  length: z
    .preprocess(
      (val) => (typeof val === "string" ? parseFloat(val) : val),
      z.number().nonnegative().optional()
    )
    .nullable(),
  category: z
    .preprocess((val) => {
      if (typeof val === "string" && categoryMap[val]) {
        return categoryMap[val];
      }
      return val;
    }, z.enum([...new Set(Object.values(categoryMap))] as [string, ...string[]]).nullable())
    .nullable()
    .optional(),
});
