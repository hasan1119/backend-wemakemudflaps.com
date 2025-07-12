import { Column, Entity, ManyToOne, PrimaryGeneratedColumn } from "typeorm";
import { TaxClass } from "./tax-class.entity";

@Entity()
export class TaxRate {
  @PrimaryGeneratedColumn("uuid")
  id: string;

  // Country code (ISO 3166-1 alpha-2) — e.g., "US", "GB"
  @Column()
  country: string;

  // Optional state code — e.g., "CA", "NY"
  @Column({ nullable: true })
  state: string | null;

  // Optional city (can use wildcards or leave null for all)
  @Column({ nullable: true })
  city: string | null;

  // Optional zip/postcode — can be a wildcard pattern or left null
  @Column({ nullable: true })
  postcode: string | null;

  // Tax rate in percentage (e.g., 7.5% is stored as 7.5)
  @Column("decimal", { precision: 5, scale: 4 })
  rate: number;

  // Label for display (e.g., "VAT", "Sales Tax")
  @Column()
  label: string;

  // Whether the rate is applied to shipping
  @Column({ type: "boolean", default: false })
  appliesToShipping: boolean;

  // Whether it's a compound tax (added on top of other taxes)
  @Column({ type: "boolean", default: false })
  isCompound: boolean;

  // Determines order of application if multiple rates apply
  @Column({ default: 1 })
  priority: number;

  // Link to tax class
  @ManyToOne(() => TaxClass, (taxClass) => taxClass.taxRates, {
    onDelete: "CASCADE",
  })
  taxClass: TaxClass;

  // Who created this rate
  @Column()
  createdBy: string;

  // Timestamp of creation
  @Column({ type: "timestamp", default: () => "CURRENT_TIMESTAMP" })
  createdAt: Date;

  // Soft delete field
  @Column({ type: "timestamp", nullable: true, default: null })
  deletedAt: Date | null;
}
