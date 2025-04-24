import { Column, Entity, PrimaryGeneratedColumn } from "typeorm";

@Entity()
export class PopupBanner {
  @PrimaryGeneratedColumn("uuid")
  id: string;

  // Optional image URL for the popup banner
  @Column({ type: "text", nullable: true })
  imageUrl: string;

  // Optional message to be displayed on the popup banner
  @Column({ type: "text", nullable: true })
  message: string;

  // Indicates whether the popup banner is active
  @Column({ type: "boolean", nullable: true })
  isActive: boolean;

  // Start time when the popup banner should be displayed (optional)
  @Column({ type: "timestamp", nullable: true })
  startTime: Date;

  // End time when the popup banner should be removed
  @Column({ type: "timestamp" })
  endTime: Date;

  // User ID who created popup banner (string only for Apollo Federation compatibility)
  @Column()
  createdBy: string;

  // Timestamp when the popup banner was created (auto-generated)
  @Column({ type: "timestamp", default: () => "CURRENT_TIMESTAMP" })
  createdAt: Date;

  // Timestamp for soft deletion (null if not deleted)
  @Column({ type: "timestamp", nullable: true })
  deletedAt: Date;
}
