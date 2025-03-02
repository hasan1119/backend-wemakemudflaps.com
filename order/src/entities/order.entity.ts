import {
  Column,
  Entity,
  ManyToOne,
  OneToMany,
  PrimaryGeneratedColumn,
} from "typeorm";
import { Coupon, OrderItem, User } from "../../../entities/index";

@Entity()
export class Order {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ type: "decimal", precision: 10, scale: 2 })
  totalAmount: number;

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

  @ManyToOne(() => User, (user) => user.orders, { nullable: true })
  orderedBy: User | null; // Nullable for guest orders

  @Column({ nullable: true })
  guestEmail: string | null; // For guest orders

  @Column({ nullable: true })
  guestName: string | null; // For guest orders

  @Column({ nullable: true })
  guestPhone: string | null; // For guest orders

  @Column({ nullable: false })
  deliveryAddress: string;

  @OneToMany(() => OrderItem, (orderItem) => orderItem.order)
  orderItems: OrderItem[];

  @ManyToOne(() => Coupon, (coupon) => coupon.order)
  coupons: Coupon;

  @Column({ type: "timestamp", default: () => "CURRENT_TIMESTAMP" })
  orderDate: Date;

  @Column({ type: "timestamp", nullable: true })
  deletedAt: Date | null; // For soft deletion
}
