import {
  Column,
  Entity,
  OneToMany,
  OneToOne,
  PrimaryGeneratedColumn,
} from "typeorm";
import { ProductTieredPrice } from "./product-tiered-pricing.entity";
import { ProductVariation } from "./product-variation.entity";
import { Product } from "./product.entity";

@Entity()
export class ProductPrice {
  @PrimaryGeneratedColumn("uuid")
  id: string;

  // Pricing type: "Fixed" (fixed price per unit) or "Percentage" (discount percentage)
  @Column({
    type: "enum",
    enum: ["Fixed", "Percentage"],
    nullable: true,
    default: null,
  })
  pricingType: string | null;

  // Tiered pricing rules for bulk or quantity-based pricing
  @OneToMany(
    () => ProductTieredPrice,
    (tieredPrice) => tieredPrice.productPrice,
    { cascade: true, onDelete: "CASCADE", nullable: true }
  )
  tieredPrices: ProductTieredPrice[] | null;

  // For simple products, link back to the product
  @OneToOne(() => Product, (product) => product.tierPricingInfo, {
    nullable: true,
    onDelete: "CASCADE",
  })
  product: Promise<Product> | null;

  // For variable products, link to the specific product variation
  @OneToOne(() => ProductVariation, (variation) => variation.tierPricingInfo, {
    nullable: true,
    onDelete: "CASCADE",
  })
  productVariation: Promise<ProductVariation> | null;

  // Timestamp when the user was created
  @Column({ type: "timestamp", default: () => "CURRENT_TIMESTAMP" })
  createdAt: Date;

  // Timestamp for soft deletion (null if not deleted)
  @Column({ type: "timestamp", nullable: true, default: null })
  deletedAt: Date | null;
}
