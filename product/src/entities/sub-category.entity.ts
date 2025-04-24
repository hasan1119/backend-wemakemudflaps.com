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

  // The name of the subcategory (must be unique)
  @Column({ unique: true })
  name: string;

  // Relationship to the category to which this subcategory belongs
  @ManyToOne(() => Category, (category) => category.subCategories)
  category: Category;

  // Relationship to the products associated with this subcategory
  @ManyToMany(() => Product, (product) => product.subCategories)
  products: Product[];

  // Self-referencing relationship to allow subcategories to have subcategories
  @ManyToOne(() => SubCategory, (subCategory) => subCategory.subCategories, {
    nullable: true,
  })
  parentSubCategory: SubCategory | null;

  @OneToMany(() => SubCategory, (subCategory) => subCategory.parentSubCategory)
  subCategories: SubCategory[];

  // User ID who created the subcategory (string only for Apollo Federation compatibility)
  @Column()
  createdBy: string;

  // Timestamp when the subcategory was created
  @Column({ type: "timestamp", default: () => "CURRENT_TIMESTAMP" })
  createdAt: Date;

  // Timestamp for soft deletion (null if not deleted)
  @Column({ type: "timestamp", nullable: true })
  deletedAt: Date | null;
}
