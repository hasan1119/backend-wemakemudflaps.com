import {
  Column,
  CreateDateColumn,
  Entity,
  PrimaryGeneratedColumn,
} from "typeorm";

@Entity()
export class NewsletterSubscriber {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ type: "text", unique: true })
  email: string;

  @Column({ type: "boolean", default: true })
  isSubscribed: boolean;

  @CreateDateColumn({ type: "timestamp" })
  subscribedAt: Date;

  @Column({ type: "timestamp", nullable: true })
  unsubscribedAt: Date | null;
}
