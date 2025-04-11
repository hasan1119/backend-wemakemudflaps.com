import { Column, Entity, ManyToOne, PrimaryGeneratedColumn } from "typeorm";
import { User } from "../../../entities";

@Entity()
export class TermAndCondition {
  @PrimaryGeneratedColumn("uuid")
  id: string;

  // Content of the terms and conditions
  @Column()
  content: string;

  // User who created the terms and conditions (Many terms can be created by one user)
  @ManyToOne(() => User, (user) => user.termsAndConditions, { nullable: false })
  createdBy: User;

  // Timestamp when the terms and conditions were created (auto-generated)
  @Column({ type: "timestamp", default: () => "CURRENT_TIMESTAMP" })
  createdAt: Date;

  // Timestamp for soft deletion (null if not deleted)
  @Column({ type: "timestamp", nullable: true })
  deletedAt: Date | null;
}
