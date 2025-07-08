import { Column, Entity, PrimaryGeneratedColumn } from "typeorm";

@Entity()
export class TermAndCondition {
  @PrimaryGeneratedColumn("uuid")
  id: string;

  // Content of the terms and conditions
  @Column()
  content: string;

  // User ID who created the terms and conditions (string only for Apollo Federation compatibility)
  @Column()
  createdBy: string;

  // Timestamp when the terms and conditions were created (auto-generated)
  @Column({ type: "timestamp", default: () => "CURRENT_TIMESTAMP" })
  createdAt: Date;

  // Timestamp for soft deletion (null if not deleted)
  @Column({ type: "timestamp", nullable: true, default: null })
  deletedAt: Date | null;
}
