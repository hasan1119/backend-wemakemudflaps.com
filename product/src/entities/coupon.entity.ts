import { Column, Entity, ManyToOne, PrimaryGeneratedColumn } from "typeorm";
import { Order, Product, User } from "../../../entities";

@Entity()
export class Coupon {
  // Auto-incrementing primary key
  @PrimaryGeneratedColumn()
  id: number;

  // Unique code for the coupon
  @Column({ unique: true })
  code: string;

  // Specifies whether the discount applies to a product or order
  @Column({
    type: "enum",
    enum: ["product", "order"],
  })
  discountOn: string;

  // Defines the type of discount (percentage or fixed amount)
  @Column({
    type: "enum",
    enum: ["percentage", "fixed"],
  })
  discountType: string;

  // Discount value (either a percentage or fixed amount)
  @Column({ type: "decimal", precision: 10, scale: 2 })
  discountValue: number;

  // The expiration date of the coupon
  @Column()
  expiryDate: Date;

  // Maximum number of times the coupon can be used (optional)
  @Column({ nullable: true })
  maxUsage: number;

  // A coupon may be tied to a specific product
  @ManyToOne(() => Product, (product) => product.coupons, {
    nullable: true,
    onDelete: "CASCADE", // Ensures the associated coupon is deleted if the product is deleted
  })
  product: Product | null;

  // A coupon may be tied to a specific order
  @ManyToOne(() => Order, (order) => order.coupon, {
    nullable: true,
    onDelete: "CASCADE", // Ensures the associated coupon is deleted if the order is deleted
  })
  order: Order | null;

  // User who created the coupon (Many coupons can be created by one user)
  @ManyToOne(() => User, (user) => user.coupons, { nullable: false })
  createdBy: User;

  // Timestamp when the coupon was created (auto-generated)
  @Column({ type: "timestamp", default: () => "CURRENT_TIMESTAMP" })
  createdAt: Date;

  // Timestamp for soft deletion (null if not deleted)
  @Column({ type: "timestamp", nullable: true })
  deletedAt: Date | null;
}
