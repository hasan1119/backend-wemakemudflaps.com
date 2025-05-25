import { z } from "zod";

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

export const categoryMap: Record<string, string> = {
  Profile: "Profile",
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

// UploadMediaInput schema
export const uploadMediaInputSchema = z.object({
  mediaType: z.preprocess((val) => {
    if (typeof val === "string" && mimeTypeMap[val]) {
      return mimeTypeMap[val];
    }
    return val;
  }, z.enum([...new Set(Object.values(mimeTypeMap))] as [string, ...string[]])),
  fileName: z.string().min(1, "File name is required"),
  title: z
    .string({ required_error: "Title text is required" })
    .trim()
    .optional(),
  description: z
    .string({ required_error: "Description text is required" })
    .trim()
    .optional(),
  altText: z
    .string({ required_error: "Alt text is required" })
    .trim()
    .optional(),
  dimension: z
    .string({ required_error: "Dimension is required" })
    .trim()
    .optional(),
  length: z.preprocess(
    (val) => (typeof val === "string" ? parseFloat(val) : val),
    z.number().nonnegative().optional()
  ),
  url: z.string().url("Invalid URL format"),
  category: z.preprocess((val) => {
    if (typeof val === "string" && categoryMap[val]) {
      return categoryMap[val];
    }
    return val;
  }, z.enum([...new Set(Object.values(categoryMap))] as [string, ...string[]])),
  size: z.number().int().positive("Size must be a positive integer"),
  bucketName: z.string().min(1, "Bucket name is required"),
  createdBy: z.string().uuid({ message: "Invalid UUID format" }),
});

export const UploadMediaFilesSchema = z.array(uploadMediaInputSchema);

// Schema for updating a single media file's info
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
  dimension: z
    .string({ required_error: "Dimension is required" })
    .nullable()
    .optional(),
  length: z.preprocess(
    (val) => (typeof val === "string" ? parseFloat(val) : val),
    z.number().nonnegative().optional()
  ),
  category: z
    .preprocess((val) => {
      if (typeof val === "string" && categoryMap[val]) {
        return categoryMap[val];
      }
      return val;
    }, z.enum([...new Set(Object.values(categoryMap))] as [string, ...string[]]))
    .optional(),
});

// Custom schema factory to validate userId against context user.id
export const createUploadMediaFilesSchema = (contextUserId: string) =>
  z
    .array(uploadMediaInputSchema)
    .refine(
      (mediaFiles) =>
        mediaFiles.every((media) => media.createdBy === contextUserId),
      {
        message:
          "One or more media files have a userId that does not match the authenticated user.",
        path: ["userId"],
      }
    );
