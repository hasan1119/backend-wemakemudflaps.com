import { Column, Entity, OneToMany, PrimaryGeneratedColumn } from "typeorm";
import { Product } from "./product.entity";

@Entity()
export class TaxClass {
  @PrimaryGeneratedColumn("uuid")
  id: string;

  /*
   * Allows predefined + custom tax classes
   * Predefined: "Standard", "Reduced rate", "Zero rate"
   * Custom classes can be created by users as well
   */
  // The unique value representing the tax class (e.g., "Standard")
  @Column({ unique: true })
  value: string;

  // A detailed description of the tax class
  @Column({ type: "text" })
  description: string;

  // One tax class can be used by many products
  @OneToMany(() => Product, (product) => product.taxClass)
  products: Product[];

  // User ID who created the tax class (string only for Apollo Federation compatibility)
  @Column()
  createdBy: string;

  // Timestamp when the tax class was created
  @Column({ type: "timestamp", default: () => "CURRENT_TIMESTAMP" })
  createdAt: Date;

  // Timestamp for soft deletion (null if not deleted)
  @Column({ type: "timestamp", nullable: true })
  deletedAt: Date | null;
}
