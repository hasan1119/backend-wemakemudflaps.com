import { Column, Entity, PrimaryGeneratedColumn } from "typeorm";

@Entity()
export class Notification {
  @PrimaryGeneratedColumn("uuid")
  id: string;

  // Type of the notification (e.g., 'order_placed', 'order_confirmed', etc.)
  @Column()
  type: string;

  // Message content of the notification (description or details)
  @Column()
  message: string;

  // User ID associated with the notification (string only for Apollo Federation compatibility)
  @Column({ nullable: true })
  userId: string | null;

  // Email of the guest user (nullable for guest notifications)
  @Column({ nullable: true })
  guestEmail: string | null;

  // Order associated with the notification (string only for Apollo Federation compatibility)
  @Column({ nullable: true })
  relatedOrderId: string | null;

  // Product associated with the notification (string only for Apollo Federation compatibility)
  @Column({ nullable: true })
  relatedProductId: string | null;

  // Timestamp indicating when the notification was read (nullable if unread)
  @Column({ type: "timestamp", nullable: true })
  readAt: Date | null;

  // Timestamp when the notification was created
  @Column({ type: "timestamp", default: () => "CURRENT_TIMESTAMP" })
  createdAt: Date;

  // Timestamp for soft deletion (null if not deleted)
  @Column({ type: "timestamp", nullable: true })
  deletedAt: Date | null;
}
