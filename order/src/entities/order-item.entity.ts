import { Column, Entity, ManyToOne, PrimaryGeneratedColumn } from "typeorm";
import { Order, Product } from "./../../../entities";

@Entity()
export class OrderItem {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  quantity: number;

  @Column({ type: "decimal", precision: 10, scale: 2 })
  priceAtPurchase: number;

  @ManyToOne(() => Order, (order) => order.orderItems)
  order: Order;

  @ManyToOne(() => Product, (product) => product.orderItems)
  product: Product;

  @Column({ type: "timestamp", nullable: true })
  deletedAt: Date | null; // For soft deletion
}
