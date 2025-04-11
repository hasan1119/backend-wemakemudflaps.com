import {
  Column,
  Entity,
  ManyToOne,
  OneToMany,
  PrimaryGeneratedColumn,
} from "typeorm";
import { Coupon, OrderItem, User } from "../../../entities";

@Entity()
export class Order {
  @PrimaryGeneratedColumn("uuid")
  id: string;

  // Total amount for the order (e.g., price after applying discounts, taxes, etc.)
  @Column({ type: "decimal", precision: 10, scale: 2 })
  totalAmount: number;

  // Status of the order, indicating its current stage (e.g., placed, confirmed, shipped)
  @Column({
    type: "enum",
    enum: [
      "pending",
      "placed",
      "confirmed",
      "shipped",
      "delivered",
      "canceled",
    ],
  })
  oderStatus: string;

  // User who placed the order (nullable for guest orders)
  @ManyToOne(() => User, (user) => user.orders, { nullable: true })
  orderedBy: User | null;

  // Email of the guest user (nullable for guest orders)
  @Column({ nullable: true })
  guestEmail: string | null;

  // Name of the guest user (nullable for guest orders)
  @Column({ nullable: true })
  guestName: string | null;

  // Phone number of the guest user (nullable for guest orders)
  @Column({ nullable: true })
  guestPhone: string | null;

  // Delivery address for the order (nullable)
  @Column({ nullable: false })
  deliveryAddress: string;

  // Items included in the order (associated with the OrderItem entity)
  @OneToMany(() => OrderItem, (orderItem) => orderItem.order)
  orderItems: OrderItem[];

  // Coupon applied to the order (nullable, one-to-many relationship with Coupon)
  @ManyToOne(() => Coupon, (coupon) => coupon.order)
  coupons: Coupon;

  // Timestamp indicating when the order was placed
  @Column({ type: "timestamp", default: () => "CURRENT_TIMESTAMP" })
  orderDate: Date;

  // Timestamp for soft deletion (null if not deleted)
  @Column({ type: "timestamp", nullable: true })
  deletedAt: Date | null;
}
