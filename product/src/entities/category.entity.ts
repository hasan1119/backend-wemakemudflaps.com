import { Column, Entity, OneToMany, PrimaryGeneratedColumn } from "typeorm";
import { Product } from "./product.entity";
import { SubCategory } from "./sub-category.entity";

@Entity()
export class Category {
  @PrimaryGeneratedColumn("uuid")
  id: string;

  // Category thumbnail image URL
  @Column({ type: "text", nullable: true, default: null })
  thumbnail: string | null;

  // Unique name of the category
  @Column({ unique: true })
  name: string;

  // Category slug
  @Column({ type: "text" })
  slug: string;

  // Category description
  @Column({ type: "text", nullable: true, default: null })
  description: string | null;

  // One category can have multiple subcategories
  @OneToMany(() => SubCategory, (subCategory) => subCategory.category, {
    cascade: true, // Ensures the associated sub categories is deleted if the category is deleted
    nullable: true,
  })
  subCategories: SubCategory[] | null;

  // One category can have multiple products
  @OneToMany(() => Product, (product) => product.category, {
    nullable: true,
  })
  products: Product[] | null;

  // Set category position/order in list
  @Column({ type: "int", nullable: true })
  position: number;

  // User ID who created the category (string only for Apollo Federation compatibility)
  @Column({ nullable: true, default: null })
  createdBy: string | null;

  // Timestamp when the category was created (auto-generated)
  @Column({ type: "timestamp", default: () => "CURRENT_TIMESTAMP" })
  createdAt: Date;

  // Timestamp for soft deletion (null if not deleted)
  @Column({ type: "timestamp", nullable: true })
  deletedAt: Date | null;
}
