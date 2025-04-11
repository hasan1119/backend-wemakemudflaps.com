import {
  Column,
  Entity,
  ManyToOne,
  OneToMany,
  PrimaryGeneratedColumn,
} from "typeorm";
import { Product, User } from "../../../entities";

@Entity()
export class TaxStatus {
  @PrimaryGeneratedColumn("uuid")
  id: string;

  /*
   * Allows predefined + custom tax statuses
   * Predefined: "Taxable", "Shipping only", "None"
   * Custom statuses can be created by users as well
   */
  // The unique value representing the tax status (e.g., "Taxable")
  @Column({ unique: true })
  value: string;

  // A detailed description of the tax status
  @Column({ type: "text" })
  description: string;

  // One tax status can be used by many products
  @OneToMany(() => Product, (product) => product.taxStatus)
  products: Product[];

  // The user who created this tax status (cannot be null)
  @ManyToOne(() => User, (user) => user.taxStatus, { nullable: false })
  createdBy: User;

  // Timestamp when the tax status was created
  @Column({ type: "timestamp", default: () => "CURRENT_TIMESTAMP" })
  createdAt: Date;

  // Timestamp for soft deletion (null if not deleted)
  @Column({ type: "timestamp", nullable: true })
  deletedAt: Date | null;
}
