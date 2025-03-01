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
  sku: string | null; // For non-variant products only

  @Column()
  name: string;

  @Column({ type: "text", nullable: false })
  description: string;

  @Column({ type: "decimal", precision: 10, scale: 2 })
  basePrice: number;

  @Column({ type: "int", nullable: true })
  stockQuantity: number | null; // For non-variant products only

  @Column({ type: "int", nullable: true })
  warranty: number | null;

  @Column({
    type: "enum",
    enum: {
      DAY: "day",
      DAYS: "days",
      WEEK: "week",
      WEEKS: "weeks",
      Month: "month",
      MONTHS: "months",
      YEAR: "year",
      YEARS: "years",
      LIFE_TIME: "life-time",
    },
    nullable: true,
  })
  warrantyPeriod:
    | "day"
    | "days"
    | "week"
    | "weeks"
    | "month"
    | "months"
    | "year"
    | "years"
    | "life-time"
    | null;

  @ManyToOne(() => Category, (category) => category.products, {
    nullable: true,
    onDelete: "SET NULL",
  })
  @JoinColumn({ name: "categoryId" })
  category: Category;

  @Column({ type: "text", array: true, nullable: true })
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

  @ManyToOne(() => User, (user) => user.products, { nullable: false })
  createdBy: User;

  @Column({ type: "timestamp", default: () => "CURRENT_TIMESTAMP" })
  createdAt: Date;

  @Column({ type: "timestamp", nullable: true })
  deletedAt: Date | null;
}
