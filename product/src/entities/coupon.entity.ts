import { Column, Entity, ManyToOne, PrimaryGeneratedColumn } from "typeorm";
import { Order, Product, User } from "../../../entities/index";

@Entity()
export class Coupon {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ unique: true })
  code: string;

  @Column({
    type: "enum",
    enum: ["percentage", "fixed"],
  })
  discountType: string;

  @Column({ type: "decimal", precision: 10, scale: 2 })
  discountValue: number;

  @Column()
  expiryDate: Date;

  @Column({ nullable: true })
  maxUsage: number;

  @ManyToOne(() => Product, (product) => product.coupons, {
    nullable: true,
    onDelete: "CASCADE",
  })
  product: Product | null;

  @ManyToOne(() => Order, (order) => order.coupon, {
    nullable: true,
    onDelete: "CASCADE",
  })
  order: Order | null;

  @ManyToOne(() => User, (user) => user.coupons, { nullable: false })
  createdBy: User;

  @Column({ type: "timestamp", default: () => "CURRENT_TIMESTAMP" })
  createdAt: Date;

  @Column({ type: "timestamp", nullable: true })
  deletedAt: Date | null; // For soft deletion
}
