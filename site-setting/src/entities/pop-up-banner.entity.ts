import { Column, Entity, PrimaryGeneratedColumn } from "typeorm";

@Entity()
export class PopupBanner {
  @PrimaryGeneratedColumn("uuid")
  id: string;

  // Optional image URL for the popup banner
  @Column({ type: "text", nullable: true })
  imageUrl: string | null;

  // Optional message to be displayed on the popup banner
  @Column({ type: "text", nullable: true })
  message: string | null;

  // Indicates whether the popup banner is active
  @Column({ type: "boolean", nullable: true })
  isActive: boolean | null;

  // Start time when the popup banner should be displayed (optional)
  @Column({ type: "timestamp", nullable: true })
  startTime: Date | null;

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
  deletedAt: Date | null;
}
