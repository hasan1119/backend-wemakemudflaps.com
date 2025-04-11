import { Column, Entity, ManyToOne, PrimaryGeneratedColumn } from "typeorm";
import { Order, Product, User } from "../../../entities";

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

  // User associated with the notification (nullable for guest notifications)
  @ManyToOne(() => User, (user) => user.notifications, { nullable: true })
  user: User | null;

  // Email of the guest user (nullable for guest notifications)
  @Column({ nullable: true })
  guestEmail: string | null;

  // Order associated with the notification (nullable if not related to an order)
  @ManyToOne(() => Order, (order) => order.notifications)
  relatedOrder: Order;

  // Product associated with the notification (nullable if not related to a product)
  @ManyToOne(() => Product, (product) => product.notifications)
  relatedProduct: Product;

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
