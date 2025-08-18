import { Column, Entity, PrimaryGeneratedColumn } from "typeorm";
import type { Category, MimeType } from "../utils/data-validation";
import { categories, mimeTypes } from "../utils/data-validation";

@Entity()
export class Media {
  // Defines the unique identifier for the role
  @PrimaryGeneratedColumn("uuid")
  id: string;

  @Column({
    type: "enum",
    enum: mimeTypes,
  })
  mediaType: MimeType;

  // Media file remote url
  @Column()
  url: string;

  // Media file name (e.g., "image-one", "video-one", etc.)
  @Column()
  fileName: string;

  // Original file name (e.g., "image-one.jpg", "video-one.mp4", etc.)
  @Column({ nullable: true, default: null })
  originalFileName: string | null;

  // Media title name (e.g., "image-one", "video-one", etc.)
  @Column({ nullable: true, default: null })
  title: string | null;

  // Media title description
  @Column({ type: "text", nullable: true, default: null })
  description: string | null;

  // Media alt text (e.g., "image-one", "video-one", etc.)
  @Column({ nullable: true, default: null })
  altText: string | null;

  // Media dimension
  @Column({ type: "jsonb", nullable: true, default: null })
  dimension: {
    width: number;
    height: number;
    unit: string;
  } | null;

  // Media length for videos and audios
  @Column({ type: "float", nullable: true, default: null })
  length: number | null;

  // Media use case type (e.g., "profile", "product", "product review", etc.)
  @Column({
    type: "enum",
    enum: categories,
    nullable: true,
    default: null,
  })
  category: Category | null;

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
