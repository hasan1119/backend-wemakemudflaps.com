import {
  Column,
  Entity,
  ManyToOne,
  OneToMany,
  PrimaryGeneratedColumn,
} from "typeorm";
import { Product, SubCategory, User } from "../../../entities";

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

  // User who created the category (Many categories can be created by one user)
  @ManyToOne(() => User, (user) => user.categories, { nullable: false })
  createdBy: User;

  // Timestamp when the category was created (auto-generated)
  @Column({ type: "timestamp", default: () => "CURRENT_TIMESTAMP" })
  createdAt: Date;

  // Timestamp for soft deletion (null if not deleted)
  @Column({ type: "timestamp", nullable: true })
  deletedAt: Date | null;
}
