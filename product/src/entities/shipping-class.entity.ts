import {
  Column,
  Entity,
  ManyToOne,
  OneToMany,
  PrimaryGeneratedColumn,
} from "typeorm";
import { Product, User } from "../../../entities";

@Entity()
export class ShippingClass {
  // Auto-incrementing primary key for the shipping class
  @PrimaryGeneratedColumn()
  id: number;

  /*
   * Allows predefined + custom shipping classes
   * Predefined: "No shipping class", "Flat rate", "Free Shipping", "UPS"
   */
  // The value of the shipping class (e.g., "Free Shipping", "Flat rate", etc.)
  @Column({ unique: true })
  value: string;

  // Description of the shipping class, explaining its details or usage
  @Column({ type: "text" })
  description: string;

  // One shipping class can be used by many products
  @OneToMany(() => Product, (product) => product.shippingClass)
  products: Product[];

  // The user who created this shipping class (cannot be null)
  @ManyToOne(() => User, (user) => user.shippingClass, { nullable: false })
  createdBy: User;

  // Timestamp when the shipping class was created
  @Column({ type: "timestamp", default: () => "CURRENT_TIMESTAMP" })
  createdAt: Date;

  // Timestamp for soft deletion (null if not deleted)
  @Column({ type: "timestamp", nullable: true })
  deletedAt: Date | null;
}
