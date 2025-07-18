import { Column, Entity, ManyToOne, PrimaryGeneratedColumn } from "typeorm";
import { ProductPrice } from "./product-price.entity";

@Entity()
export class ProductTieredPrice {
  @PrimaryGeneratedColumn("uuid")
  id: string;

  // Minimum quantity required for this pricing tier
  @Column({ nullable: true, default: null })
  minQuantity: number | null;

  // Maximum quantity allowed for this tier
  @Column({ nullable: true, default: null })
  maxQuantity: number | null;

  // Quantity type (e.g., piece, liter and so on)
  @Column({ nullable: true, default: null })
  quantityUnit: string | null;

  // Fixed price for this tier (if applicable)
  @Column({
    type: "decimal",
    precision: 10,
    scale: 2,
    nullable: true,
    default: null,
  })
  fixedPrice: number | null;

  // Percentage discount for this tier (if applicable)
  @Column({
    type: "decimal",
    precision: 5,
    scale: 2,
    nullable: true,
    default: null,
  })
  percentageDiscount: number | null;

  // Reference to the associated ProductPrice entity
  @ManyToOne(() => ProductPrice, (productPrice) => productPrice.tieredPrices, {
    nullable: true,
    onDelete: "CASCADE",
  })
  productPrice: Promise<ProductPrice>;

  // Timestamp when the user was created
  @Column({ type: "timestamp", default: () => "CURRENT_TIMESTAMP" })
  createdAt: Date;

  // Timestamp for soft deletion (null if not deleted)
  @Column({ type: "timestamp", nullable: true, default: null })
  deletedAt: Date | null;
}
