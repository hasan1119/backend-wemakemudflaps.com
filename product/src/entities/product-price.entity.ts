import {
  Column,
  Entity,
  OneToMany,
  OneToOne,
  PrimaryGeneratedColumn,
} from "typeorm";
import {
  Product,
  ProductTieredPrice,
  ProductVariation,
} from "../../../entities/";

@Entity()
export class ProductPrice {
  // Auto-incrementing primary key for the product price
  @PrimaryGeneratedColumn()
  id: number;

  // Pricing type: "Fixed" (fixed price per unit) or "Percentage" (discount percentage)
  @Column({
    type: "enum",
    enum: ["Fixed", "Percentage"],
  })
  productType: string;

  // Tiered pricing rules for bulk or quantity-based pricing
  @OneToMany(
    () => ProductTieredPrice,
    (tieredPrice) => tieredPrice.productPrice,
    { cascade: true, onDelete: "CASCADE" }
  )
  tieredPrices: ProductTieredPrice[];

  // For simple products, link back to the product
  @OneToOne(() => Product, (product) => product.tierPricingInfo, {
    nullable: true,
    onDelete: "CASCADE",
  })
  product: Product | null;

  // For variable products, link to the specific product variation
  @OneToOne(() => ProductVariation, (variation) => variation.tierPricingInfo, {
    nullable: true,
    onDelete: "CASCADE",
  })
  productVariation: ProductVariation | null;

  // Timestamp when the user was created
  @Column({ type: "timestamp", default: () => "CURRENT_TIMESTAMP" })
  createdAt: Date;

  // Timestamp for soft deletion (null if not deleted)
  @Column({ type: "timestamp", nullable: true })
  deletedAt: Date | null;
}
