import { Column, Entity, OneToMany, PrimaryGeneratedColumn } from "typeorm";
import { Product } from "./product.entity";

@Entity()
export class Brand {
  @PrimaryGeneratedColumn("uuid")
  id: string;

  // Unique name of the brand
  @Column({ unique: true })
  name: string;

  // One brand can be associated with multiple products
  @OneToMany(() => Product, (product) => product.brand)
  products: Product[];

  // User ID who created the brand (string only for Apollo Federation compatibility)
  @Column()
  createdBy: string;

  // Timestamp when the brand was created (auto-generated)
  @Column({ type: "timestamp", default: () => "CURRENT_TIMESTAMP" })
  createdAt: Date;

  // Timestamp for soft deletion (null if not deleted)
  @Column({ type: "timestamp", nullable: true })
  deletedAt: Date | null;
}
