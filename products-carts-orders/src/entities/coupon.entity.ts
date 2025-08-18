import {
  Column,
  Entity,
  JoinTable,
  ManyToMany,
  PrimaryGeneratedColumn,
} from "typeorm";
import { Category } from "./category.entity";
import { Product } from "./product.entity";

export enum CouponType {
  PERCENTAGE_DISCOUNT = "PERCENTAGE_DISCOUNT",
  FIXED_CART_DISCOUNT = "FIXED_CART_DISCOUNT",
  FIXED_PRODUCT_DISCOUNT = "FIXED_PRODUCT_DISCOUNT",
}

@Entity()
export class Coupon {
  @PrimaryGeneratedColumn("uuid")
  id: string;

  // Unique code for the coupon
  @Column({ unique: true })
  code: string;

  // A detailed description of the coupon
  @Column({ type: "text", nullable: true, default: null })
  description: string | null;

  // Defines the type of discount ( "Percentage Discount", "Fixed Cart Discount" and "Fixed Product Discount")
  @Column({
    type: "enum",
    enum: CouponType,
    nullable: true,
    default: null,
  })
  discountType: CouponType | null;

  @Column({ default: false })
  freeShipping: boolean;

  // Discount value (either a percentage or fixed amount)
  @Column({ type: "decimal", precision: 10, scale: 2 })
  discountValue: number;

  // The expiration date of the coupon
  @Column({ nullable: true })
  expiryDate: Date | null;

  // Maximum number of times the coupon can be used (optional)
  @Column({ nullable: true, default: null })
  maxUsage: number | null; // if null then the limit is infinite

  // Minimum order amount to apply the coupon (optional)
  @Column({
    type: "decimal",
    precision: 10,
    scale: 2,
    nullable: true,
    default: null,
  })
  minimumSpend: number | null;

  // Maximum order amount to apply the coupon (optional)
  @Column({
    type: "decimal",
    precision: 10,
    scale: 2,
    nullable: true,
    default: null,
  })
  maximumSpend: number | null;

  // Restrict coupon to specific product IDs
  @ManyToMany(() => Product, { nullable: true })
  @JoinTable()
  applicableProducts: Product[] | null;

  // Exclude specific product IDs
  @ManyToMany(() => Product, { nullable: true })
  @JoinTable()
  excludedProducts: Product[] | null;

  // Restrict coupon to specific category IDs
  @ManyToMany(() => Category, { nullable: true })
  @JoinTable()
  applicableCategories: Category[] | null;

  // Exclude specific category IDs
  @ManyToMany(() => Category, { nullable: true })
  @JoinTable()
  excludedCategories: Category[] | null;

  // Restrict coupon to certain emails
  @Column("text", {
    array: true,
    nullable: true,
    default: () => "ARRAY[]::text[]",
  })
  allowedEmails: string[] | null;

  // Total usage count
  @Column({ default: 0 })
  usageCount: number;

  // User ID who created the coupon (string only for Apollo Federation compatibility)
  @Column()
  createdBy: string;

  // Timestamp when the coupon was created (auto-generated)
  @Column({ type: "timestamp", default: () => "CURRENT_TIMESTAMP" })
  createdAt: Date;

  // Timestamp for soft deletion (null if not deleted)
  @Column({ type: "timestamp", nullable: true, default: null })
  deletedAt: Date | null;
}
