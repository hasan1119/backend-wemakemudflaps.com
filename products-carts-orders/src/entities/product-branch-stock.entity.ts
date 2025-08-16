// product-branch-stock.entity.ts (product-service)
import { Column, Entity, ManyToOne, PrimaryGeneratedColumn } from "typeorm";
import { ProductVariation } from "./product-variation.entity";
import { Product, StockStatusEnum } from "./product.entity";

@Entity()
export class ProductBranchStock {
  @PrimaryGeneratedColumn("uuid")
  id: string;

  // Reference to Product (nullable if this is for a ProductVariation)
  @ManyToOne(() => Product, {
    nullable: true,
    onDelete: "CASCADE", // If the Product is deleted, also delete this stock record
  })
  product: Promise<Product> | null;

  // Reference to ProductVariation (nullable if this is for a Product)
  @ManyToOne(() => ProductVariation, {
    nullable: true,
    onDelete: "CASCADE", // If the ProductVariation is deleted, also delete this stock record
  })
  productVariation: Promise<ProductVariation> | null;

  // Branch ID from SiteSettings.shopAddresses
  @Column({ nullable: false })
  branchId: string;

  // Stock quantity for this branch
  @Column({ nullable: true, default: null })
  stockQuantity: number | null;

  // Stock status for this branch
  @Column({
    type: "enum",
    enum: StockStatusEnum,
    nullable: true,
    default: null,
  })
  stockStatus: StockStatusEnum | null;

  // Low stock threshold for this branch
  @Column({ nullable: true, default: null })
  lowStockThreshold: number | null;

  // Initial number in stock (optional, include only if branch-specific progress bars are needed)
  @Column({ nullable: true, default: null })
  initialNumberInStock: number | null;

  // Whether to manage stock for this branch (optional, include only if stock management varies by branch)
  @Column({ type: "boolean", nullable: true, default: null })
  manageStock: boolean | null;

  @Column({ type: "timestamp", default: () => "CURRENT_TIMESTAMP" })
  createdAt: Date;

  @Column({ type: "timestamp", nullable: true, default: null })
  updatedAt: Date | null;
}
