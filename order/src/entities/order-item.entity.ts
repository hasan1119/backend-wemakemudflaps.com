import { Column, Entity, ManyToOne, PrimaryGeneratedColumn } from "typeorm";
import { Order } from "./order.entity";

@Entity()
export class OrderItem {
  @PrimaryGeneratedColumn("uuid")
  id: string;

  // Product quantity in the order item
  @Column()
  quantity: number;

  // Product price at the time of purchase
  @Column({ type: "decimal", precision: 10, scale: 2 })
  priceAtPurchase: number;

  // Storing the order ID instead of the Order entity reference (Apollo Federation compatibility)
  @ManyToOne(() => Order, (order) => order.orderItems)
  order: Order;

  // Storing multiple product IDs as an array (PostgreSQL's text array type)
  @Column("text", { array: true })
  productIds: string[];

  @Column({ type: "timestamp", nullable: true, default: null })
  deletedAt: Date | null;
}
