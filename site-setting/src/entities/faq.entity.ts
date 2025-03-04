import { Column, Entity, ManyToOne, PrimaryGeneratedColumn } from "typeorm";
import { User } from "../../../entities";

@Entity()
export class FAQ {
  // Auto-incrementing primary key
  @PrimaryGeneratedColumn()
  id: number;

  // Question of the FAQ
  @Column()
  question: string;

  // Answer of the FAQ
  @Column()
  answer: string;

  // User who created the FAQ (Many FAQs can be created by one user)
  @ManyToOne(() => User, (user) => user.faq, { nullable: false })
  createdBy: User;

  // Timestamp when the FAQ was created
  @Column({ type: "timestamp", default: () => "CURRENT_TIMESTAMP" })
  createdAt: Date;

  // Timestamp for soft deletion (null if not deleted)
  @Column({ type: "timestamp", nullable: true })
  deletedAt: Date | null;
}
