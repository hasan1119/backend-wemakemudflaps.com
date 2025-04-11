import {
  Column,
  CreateDateColumn,
  Entity,
  PrimaryGeneratedColumn,
} from "typeorm";

@Entity()
export class NewsletterSubscriber {
  @PrimaryGeneratedColumn("uuid")
  id: string;

  // Subscriber's unique email address
  @Column({ type: "text", unique: true })
  email: string;

  // Indicates whether the subscriber is currently subscribed
  @Column({ type: "boolean", default: true })
  isSubscribed: boolean;

  // Timestamp when the user subscribed (auto-generated)
  @CreateDateColumn({ type: "timestamp" })
  subscribedAt: Date;

  // Timestamp when the user unsubscribed (null if still subscribed)
  @Column({ type: "timestamp", nullable: true })
  unsubscribedAt: Date | null;
}
