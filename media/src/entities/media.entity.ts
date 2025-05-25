import { Column, Entity, PrimaryGeneratedColumn } from "typeorm";
import { mimeTypes } from "../utils/entity-helper/entity-helper";

// Define Media use case as a TypeScript type (union of literals)
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

@Entity()
export class Media {
  @PrimaryGeneratedColumn("uuid")
  id: string;

  @Column({
    type: "enum",
    enum: mimeTypes,
  })
  mediaType: MimeType;

  // Media file name (e.g., "image-one", "video-one", etc.)
  @Column()
  fileName: string;

  // Media title name (e.g., "image-one", "video-one", etc.)
  @Column({ nullable: true, default: null })
  title: string | null;

  // Media title description
  @Column({ nullable: true, default: null })
  description: string | null;

  // Media alt text (e.g., "image-one", "video-one", etc.)
  @Column({ nullable: true, default: null })
  altText: string | null;

  // Media dimension
  @Column({ nullable: true, default: null })
  dimension: string | null;

  // Media length for videos and audios
  @Column({ type: "float", nullable: true, default: null })
  length: number | null;

  // Media use case type (e.g., "profile", "product", "product review", etc.)
  @Column({
    type: "enum",
    enum: [
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
    ],
  })
  category: Category;

  // Media file Size
  @Column({ type: "int" })
  size: number;

  // Media bucket name (e.g., "s3", "local", etc.)
  @Column()
  bucketName: string;

  // User ID who created the media (string only for Apollo Federation compatibility)
  @Column()
  createdBy: string;

  // Timestamp when the notification was created
  @Column({ type: "timestamp", default: () => "CURRENT_TIMESTAMP" })
  createdAt: Date;

  // Timestamp for soft deletion (null if not deleted)
  @Column({ type: "timestamp", nullable: true, default: null })
  deletedAt: Date | null;
}
