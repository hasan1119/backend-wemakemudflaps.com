import { Column, Entity, OneToMany, PrimaryGeneratedColumn } from "typeorm";
import { Product } from "./product.entity";

@Entity()
export class Brand {
  @PrimaryGeneratedColumn("uuid")
  id: string;

  // Brand thumbnail image URL
  @Column({ type: "text", nullable: true, default: null })
  thumbnail: string | null;

  // Unique name of the brand
  @Column({ unique: true })
  name: string;

  // Brand slug
  @Column({ unique: true })
  slug: string;

  // One brand can be associated with multiple products
  @OneToMany(() => Product, (product) => product.brands, {
    nullable: true,
    default: null,
  })
  products: Product[] | null;

  // User ID who created the brand (string only for Apollo Federation compatibility)
  @Column()
  createdBy: string;

  // Timestamp when the brand was created (auto-generated)
  @Column({ type: "timestamp", default: () => "CURRENT_TIMESTAMP" })
  createdAt: Date;

  // Timestamp for soft deletion (null if not deleted)
  @Column({ type: "timestamp", nullable: true, default: null })
  deletedAt: Date | null;
}
