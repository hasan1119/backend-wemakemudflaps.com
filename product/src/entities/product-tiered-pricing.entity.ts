import { Column, Entity, ManyToOne, PrimaryGeneratedColumn } from "typeorm";
import { ProductPrice } from "./product-price.entity";

@Entity()
export class ProductTieredPrice {
  @PrimaryGeneratedColumn("uuid")
  id: string;

  // Minimum quantity required for this pricing tier
  @Column()
  minQuantity: number;

  // Maximum quantity allowed for this tier
  @Column()
  maxQuantity: number;

  // Quantity type (e.g., piece, liter and so on)
  @Column()
  quantityUnit: string;

  // Fixed price for this tier (if applicable)
  @Column({ type: "decimal", precision: 10, scale: 2, nullable: true })
  fixedPrice: number | null;

  // Percentage discount for this tier (if applicable)
  @Column({ type: "decimal", precision: 5, scale: 2, nullable: true })
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
  @Column({ type: "timestamp", nullable: true })
  deletedAt: Date | null;
}
