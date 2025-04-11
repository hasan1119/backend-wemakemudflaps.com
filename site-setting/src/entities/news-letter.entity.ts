import {
  Column,
  CreateDateColumn,
  Entity,
  ManyToOne,
  PrimaryGeneratedColumn,
} from "typeorm";
import { User } from "../../../entities";

@Entity()
export class Newsletter {
  @PrimaryGeneratedColumn("uuid")
  id: string;

  // Title of the newsletter
  @Column({ type: "text", nullable: false })
  title: string;

  // Content/body of the newsletter
  @Column({ type: "text", nullable: false })
  content: string;

  // Optional image URL for the newsletter
  @Column({ type: "text", nullable: true })
  imageUrl: string | null;

  // Indicates whether the newsletter is currently active
  @Column({ type: "boolean", default: true })
  isActive: boolean;

  // User who created the newsletter (Many newsletters can be created by one user)
  @ManyToOne(() => User, (user) => user.newsLetters, { nullable: false })
  createdBy: User;

  // Timestamp when the newsletter was created (auto-generated)
  @CreateDateColumn({ type: "timestamp" })
  createdAt: Date;

  // Timestamp when the newsletter was published (null if not published)
  @Column({ type: "timestamp", nullable: true })
  publishedAt: Date | null;

  // Timestamp for soft deletion (null if not deleted)
  @Column({ type: "timestamp", nullable: true })
  deletedAt: Date | null;
}
