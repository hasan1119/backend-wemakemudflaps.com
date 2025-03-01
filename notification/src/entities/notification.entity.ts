import { Column, Entity, ManyToOne, PrimaryGeneratedColumn } from "typeorm";
import { Order, Product, User } from "../../../entities/index";

@Entity()
export class Notification {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  type: string; // 'order_placed', 'order_confirmed', etc.

  @Column()
  message: string;

  @ManyToOne(() => User, (user) => user.notifications, { nullable: true })
  user: User | null; // Nullable for guest notifications

  @Column({ nullable: true })
  guestEmail: string | null; // For guest notifications

  @ManyToOne(() => Order, (order) => order.notifications)
  relatedOrder: Order;

  @ManyToOne(() => Product, (product) => product.notifications)
  relatedProduct: Product;

  @Column({ type: "timestamp", nullable: true })
  readAt: Date | null;

  @Column({ type: "timestamp", default: () => "CURRENT_TIMESTAMP" })
  createdAt: Date;

  @Column({ type: "timestamp", nullable: true })
  deletedAt: Date | null; // For soft deletion
}
