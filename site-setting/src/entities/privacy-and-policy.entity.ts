import { Column, Entity, ManyToOne, PrimaryGeneratedColumn } from "typeorm";
import { User } from "../../../entities";

@Entity()
export class PrivacyPolicy {
  @PrimaryGeneratedColumn("uuid")
  id: string;

  // Content of the privacy policy
  @Column()
  content: string;

  // User who created the privacy policy (Many policies can be created by one user)
  @ManyToOne(() => User, (user) => user.privacyPolicies, { nullable: false })
  createdBy: User;

  // Timestamp when the privacy policy was created (auto-generated)
  @Column({ type: "timestamp", default: () => "CURRENT_TIMESTAMP" })
  createdAt: Date;

  // Timestamp for soft deletion (null if not deleted)
  @Column({ type: "timestamp", nullable: true })
  deletedAt: Date | null;
}
