import { Column, Entity, PrimaryGeneratedColumn } from "typeorm";

@Entity()
export class FAQ {
  @PrimaryGeneratedColumn("uuid")
  id: string;

  // Question of the FAQ
  @Column()
  question: string;

  // Answer of the FAQ
  @Column()
  answer: string;

  // User ID who created the FAQ (string only for Apollo Federation compatibility)
  @Column()
  createdBy: string;

  // Timestamp when the FAQ was created
  @Column({ type: "timestamp", default: () => "CURRENT_TIMESTAMP" })
  createdAt: Date;

  // Timestamp for soft deletion (null if not deleted)
  @Column({ type: "timestamp", nullable: true })
  deletedAt: Date | null;
}
