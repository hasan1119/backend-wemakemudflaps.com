import { Column, Entity, OneToMany, PrimaryGeneratedColumn } from "typeorm";
import { OrderItem } from "./order-item.entity";

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

  // User ID who placed the order (string only for Apollo Federation compatibility)
  @Column({ nullable: true })
  orderedById: string | null;

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

  // Coupon applied to the order (string only for Apollo Federation compatibility)
  @Column({ nullable: true })
  couponId: string | null;

  // Timestamp indicating when the order was placed
  @Column({ type: "timestamp", default: () => "CURRENT_TIMESTAMP" })
  orderDate: Date;

  // Timestamp for soft deletion (null if not deleted)
  @Column({ type: "timestamp", nullable: true })
  deletedAt: Date | null;
}
