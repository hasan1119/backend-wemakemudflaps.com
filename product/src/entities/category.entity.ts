import {
  Column,
  Entity,
  OneToMany,
  PrimaryGeneratedColumn,
  Tree,
  TreeChildren,
  TreeParent,
} from "typeorm";
import { Product } from "./product.entity";

@Entity()
@Tree("closure-table")
export class Category {
  @PrimaryGeneratedColumn("uuid")
  id: string;

  // Category thumbnail image URL
  @Column({ type: "text", nullable: true, default: null })
  thumbnail: string | null;

  // Unique name of the category
  @Column({ type: "text" })
  name: string;

  // Category slug
  @Column({ type: "text" })
  slug: string;

  // Category description
  @Column({ type: "text", nullable: true, default: null })
  description: string | null;

  // Tree children (subcategories)
  @TreeChildren({ cascade: true }) // Automatically saves children
  subCategories: Category[];

  // Tree parent (optional category)
  @TreeParent({ onDelete: "CASCADE" }) // Important for DB-level cascade
  parentCategory: Category | null;

  // One category can have multiple products
  @OneToMany(() => Product, (product) => product.categories, {
    cascade: true,
  })
  products: Product[];

  // Position/order in list
  @Column({ type: "int" })
  position: number;

  // User ID who created the category (string only for Apollo Federation compatibility)
  @Column()
  createdBy: string;

  // Timestamp when the category was created (auto-generated)
  @Column({ type: "timestamp", default: () => "CURRENT_TIMESTAMP" })
  createdAt: Date;

  // Timestamp for soft deletion (null if not deleted)
  @Column({ type: "timestamp", nullable: true, default: null })
  deletedAt: Date | null;
}
