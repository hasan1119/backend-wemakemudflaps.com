import { Column, Entity, OneToMany, PrimaryGeneratedColumn } from "typeorm";
import { Product } from "./product.entity";

@Entity()
export class ShippingClass {
  @PrimaryGeneratedColumn("uuid")
  id: string;

  /*
   * Allows predefined + custom shipping classes
   * Predefined: "No shipping class", "Flat rate", "Free Shipping", "UPS"
   */
  // The value of the shipping class (e.g., "Free Shipping", "Flat rate", etc.)
  @Column({ unique: true })
  value: string;

  // Description of the shipping class, explaining its details or usage
  @Column({ type: "text", nullable: true, default: null })
  description: string | null;

  // One shipping class can be used by many products
  @OneToMany(() => Product, (product) => product.shippingClass, {
    cascade: true,
    nullable: true,
  })
  products: Product[] | null;

  // User ID who created the shipping class (string only for Apollo Federation compatibility)
  @Column()
  createdBy: string;

  // Timestamp when the shipping class was created
  @Column({ type: "timestamp", default: () => "CURRENT_TIMESTAMP" })
  createdAt: Date;

  // Timestamp for soft deletion (null if not deleted)
  @Column({ type: "timestamp", nullable: true, default: null })
  deletedAt: Date | null;
}
