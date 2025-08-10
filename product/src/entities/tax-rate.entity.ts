import { Column, Entity, ManyToOne, PrimaryGeneratedColumn } from "typeorm";
import { TaxClass } from "./tax-class.entity";

@Entity()
export class TaxRate {
  @PrimaryGeneratedColumn("uuid")
  id: string;

  // Two-letter ISO country code (e.g., "US", "GB")
  @Column()
  country: string;

  // Optional state or province code within the country (nullable)
  @Column({ nullable: true })
  state: string | null;

  // Optional city name (nullable)
  @Column({ nullable: true })
  city: string | null;

  // Optional postal or ZIP code (nullable)
  @Column({ nullable: true })
  postcode: string | null;

  // Tax percentage (e.g., 7.5% is stored as 7.5000)
  @Column({ type: "decimal", precision: 7, scale: 4 })
  rate: number;

  // Label shown to customers (e.g., "Sales Tax", "VAT")
  @Column()
  label: string;

  // Whether this tax rate also applies to shipping
  @Column({ type: "boolean", default: false })
  appliesToShipping: boolean;

  // Whether this tax is compounded on top of other taxes
  @Column({ type: "boolean", default: false })
  isCompound: boolean;

  // Priority for applying tax rates (lower number = higher priority)
  @Column({ default: 1 })
  priority: number;

  // Each tax rate belongs to one tax class
  @ManyToOne(() => TaxClass, (taxClass) => taxClass.taxRates, {
    onDelete: "CASCADE",
  })
  taxClass: Promise<TaxClass>;

  // User ID who created the tax rate (string only for Apollo Federation compatibility)
  @Column()
  createdBy: string;

  // Timestamp when the tax rate was created
  @Column({ type: "timestamp", default: () => "CURRENT_TIMESTAMP" })
  createdAt: Date;

  // Timestamp for soft deletion (null if not deleted)
  @Column({ type: "timestamp", nullable: true, default: null })
  deletedAt: Date | null;
}
