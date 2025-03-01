import {
  Column,
  CreateDateColumn,
  Entity,
  ManyToOne,
  PrimaryGeneratedColumn,
} from "typeorm";
import { User } from "../../../entities/index";

@Entity()
export class Newsletter {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ type: "text", nullable: false })
  title: string;

  @Column({ type: "text", nullable: false })
  content: string;

  @Column({ type: "text", nullable: true })
  imageUrl: string | null;

  @Column({ type: "boolean", default: true })
  isActive: boolean;

  @ManyToOne(() => User, (user) => user.newsLetters, { nullable: false })
  createdBy: User;

  @CreateDateColumn({ type: "timestamp" })
  createdAt: Date;

  @Column({ type: "timestamp", nullable: true })
  publishedAt: Date | null;

  @Column({ type: "timestamp", nullable: true })
  deletedAt: Date | null; // For soft deletion
}
