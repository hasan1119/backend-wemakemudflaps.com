import {
  Column,
  Entity,
  ManyToMany,
  ManyToOne,
  OneToMany,
  PrimaryGeneratedColumn,
} from "typeorm";
import { Category } from "./category.entity";
import { Product } from "./product.entity";

@Entity()
export class SubCategory {
  @PrimaryGeneratedColumn("uuid")
  id: string;

  // Category thumbnail image URL
  @Column({ type: "text", nullable: true, default: null })
  thumbnail: string | null;

  // The name of the subcategory (must be unique)
  @Column()
  name: string;

  // Sub category slug
  @Column({ type: "text" })
  slug: string;

  // Sub category description
  @Column({ type: "text", nullable: true, default: null })
  description: string | null;

  // Relationship to the category to which this subcategory belongs
  @ManyToOne(() => Category, (category) => category.subCategories, {
    nullable: true,
  })
  category: Promise<Category> | null;

  // Relationship to the products associated with this subcategory
  @ManyToMany(() => Product, (product) => product.subCategories, {
    nullable: true,
  })
  products: Product[] | null;

  // Self-referencing relationship to allow subcategories to have subcategories
  @ManyToOne(() => SubCategory, (subCategory) => subCategory.subCategories, {
    nullable: true,
  })
  parentSubCategory: SubCategory | null;

  @OneToMany(
    () => SubCategory,
    (subCategory) => subCategory.parentSubCategory,
    {
      nullable: true,
    }
  )
  subCategories: SubCategory[] | null;

  // Used for ordering within parent (or root level)
  @Column({ type: "int", nullable: false })
  position: number;

  // User ID who created the subcategory (string only for Apollo Federation compatibility)
  @Column()
  createdBy: string;

  // Timestamp when the subcategory was created
  @Column({ type: "timestamp", default: () => "CURRENT_TIMESTAMP" })
  createdAt: Date;

  // Timestamp for soft deletion (null if not deleted)
  @Column({ type: "timestamp", nullable: true, default: null })
  deletedAt: Date | null;
}
