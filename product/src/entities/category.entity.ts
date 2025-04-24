import { Column, Entity, OneToMany, PrimaryGeneratedColumn } from "typeorm";
import { Product } from "./product.entity";
import { SubCategory } from "./sub-category.entity";

@Entity()
export class Category {
  @PrimaryGeneratedColumn("uuid")
  id: string;

  // Unique name of the category
  @Column({ unique: true })
  name: string;

  // One category can have multiple subcategories
  @OneToMany(() => SubCategory, (subCategory) => subCategory.category, {
    cascade: true, // Ensures the associated sub categories is deleted if the category is deleted
  })
  subCategories: SubCategory[];

  // One category can have multiple products
  @OneToMany(() => Product, (product) => product.category)
  products: Product[];

  // User ID who created the category (string only for Apollo Federation compatibility)
  @Column()
  createdBy: string;

  // Timestamp when the category was created (auto-generated)
  @Column({ type: "timestamp", default: () => "CURRENT_TIMESTAMP" })
  createdAt: Date;

  // Timestamp for soft deletion (null if not deleted)
  @Column({ type: "timestamp", nullable: true })
  deletedAt: Date | null;
}
