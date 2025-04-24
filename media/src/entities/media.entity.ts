import { Column, Entity, PrimaryGeneratedColumn } from "typeorm";

@Entity()
export class Media {
  @PrimaryGeneratedColumn("uuid")
  id: string;

  @Column({
    type: "enum",
    enum: ["image", "video", "pdf", "cvs", "docx", "excel", "ppt", "others"],
  })
  mediaType: string;

  @Column()
  mediaUrl: string;

  // Product Id associated with the media (string only for Apollo Federation compatibility)
  @Column({ nullable: true })
  productId: string | null;

  // User ID who created the media (string only for Apollo Federation compatibility)
  @Column()
  createdBy: string;

  // Timestamp when the notification was created
  @Column({ type: "timestamp", default: () => "CURRENT_TIMESTAMP" })
  createdAt: Date;

  // Timestamp for soft deletion (null if not deleted)
  @Column({ type: "timestamp", nullable: true })
  deletedAt: Date | null;
}
