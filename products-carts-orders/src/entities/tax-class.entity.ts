import { Column, Entity, OneToMany, PrimaryGeneratedColumn } from "typeorm";
import { Product } from "./product.entity";
import { TaxRate } from "./tax-rate.entity";

@Entity()
export class TaxClass {
  @PrimaryGeneratedColumn("uuid")
  id: string;

  /*
   * Allows predefined + custom tax classes.
   * Predefined: "Standard", "Reduced rate", "Zero rate"
   * Custom: user-defined classes like "Luxury Goods", "Digital Products", etc.
   */
  // The unique string value representing the tax class (e.g., "Standard")
  @Column({ unique: true })
  value: string;

  // A human-readable description for the tax class
  @Column({ type: "text", nullable: true, default: null })
  description: string | null;

  // One tax class can be assigned to many products
  @OneToMany(() => Product, (product) => product.taxClass, {
    cascade: true,
    nullable: true,
  })
  products: Product[] | null;

  // One tax class can contain multiple tax rates for different regions
  @OneToMany(() => TaxRate, (taxRate) => taxRate.taxClass)
  taxRates: TaxRate[];

  // User ID who created the tax class (string only for Apollo Federation compatibility)
  @Column()
  createdBy: string;

  // Timestamp when the tax class was created
  @Column({ type: "timestamp", default: () => "CURRENT_TIMESTAMP" })
  createdAt: Date;

  // Timestamp for soft deletion (null if not deleted)
  @Column({ type: "timestamp", nullable: true, default: null })
  deletedAt: Date | null;
}
