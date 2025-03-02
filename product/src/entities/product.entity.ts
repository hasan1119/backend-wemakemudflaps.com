import {
  Column,
  Entity,
  JoinColumn,
  JoinTable,
  ManyToOne,
  OneToMany,
  PrimaryGeneratedColumn,
} from "typeorm";
import {
  Cart,
  Category,
  Coupon,
  Media,
  OrderItem,
  ProductPrice,
  ProductReview,
  SubCategory,
  User,
  VariantValue,
  Wishlist,
} from "../../../entities/index";

@Entity()
export class Product {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ unique: true, nullable: true })
  sku: string | null;

  @Column()
  name: string;

  @Column({ type: "text", nullable: false })
  description: string;

  @Column({ type: "boolean", default: false })
  hasVariant: boolean; // Will true for variant products or false

  @Column({ type: "boolean", default: false })
  hasBulk: boolean; // Will true for bulk selling products or false

  @Column({ type: "decimal", precision: 10, scale: 2 })
  basePrice: number; // Used for non-variant products

  @Column({ type: "int", nullable: true })
  stockQuantity: number | null; // Used for non-variant products

  @Column({ type: "int", nullable: true })
  warranty: number | null; // Used for non-variant products

  @Column({ type: "int", default: 1 })
  minOrderQuantity: number; // Bulk selling constraint

  @Column({
    type: "enum",
    enum: [
      "day",
      "days",
      "week",
      "weeks",
      "month",
      "months",
      "year",
      "years",
      "life-time",
    ],
    nullable: true,
  })
  warrantyPeriod: string | null;

  @ManyToOne(() => Category, (category) => category.products, {
    nullable: true,
    onDelete: "SET NULL",
  })
  @JoinColumn({ name: "categoryId" })
  category: Category;

  @Column({ type: "simple-array", nullable: true })
  tags: string[];

  @ManyToOne(() => SubCategory, (subCategory) => subCategory.products)
  @JoinTable({ name: "product_subcategory" })
  subCategories: SubCategory[];

  @OneToMany(() => Media, (media) => media.product)
  media: Media[];

  @OneToMany(() => OrderItem, (orderItem) => orderItem.product)
  orderItems: OrderItem[];

  @OneToMany(() => Coupon, (coupon) => coupon.product)
  coupons: Coupon[];

  @OneToMany(() => Cart, (cart) => cart.product)
  cartItems: Cart[];

  @OneToMany(() => Wishlist, (wishlist) => wishlist.product)
  wishlistItems: Wishlist[];

  @OneToMany(() => ProductReview, (review) => review.product)
  reviews: ProductReview[];

  @OneToMany(() => VariantValue, (variantValue) => variantValue.product, {
    cascade: true,
  })
  variants: VariantValue[];

  @OneToMany(() => ProductPrice, (price) => price.product, { cascade: true })
  prices: ProductPrice[];

  @ManyToOne(() => User, (user) => user.products, { nullable: false })
  createdBy: User;

  @Column({ type: "timestamp", default: () => "CURRENT_TIMESTAMP" })
  createdAt: Date;

  @Column({ type: "timestamp", nullable: true })
  deletedAt: Date | null;
}
