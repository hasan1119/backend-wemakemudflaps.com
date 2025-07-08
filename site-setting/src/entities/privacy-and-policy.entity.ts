import { Column, Entity, PrimaryGeneratedColumn } from "typeorm";

@Entity()
export class PrivacyPolicy {
  @PrimaryGeneratedColumn("uuid")
  id: string;

  // Content of the privacy policy
  @Column()
  content: string;

  // User ID who created the privacy policy (string only for Apollo Federation compatibility)
  @Column()
  createdBy: string;

  // Timestamp when the privacy policy was created (auto-generated)
  @Column({ type: "timestamp", default: () => "CURRENT_TIMESTAMP" })
  createdAt: Date;

  // Timestamp for soft deletion (null if not deleted)
  @Column({ type: "timestamp", nullable: true, default: null })
  deletedAt: Date | null;
}
