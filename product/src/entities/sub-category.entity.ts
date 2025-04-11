import {
  Column,
  Entity,
  ManyToMany,
  ManyToOne,
  PrimaryGeneratedColumn,
} from "typeorm";
import { Category, Product, User } from "../../../entities";

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

  // The user who created this subcategory (cannot be null)
  @ManyToOne(() => User, (user) => user.subCategories, { nullable: false })
  createdBy: User;

  // Timestamp when the subcategory was created
  @Column({ type: "timestamp", default: () => "CURRENT_TIMESTAMP" })
  createdAt: Date;

  // Timestamp for soft deletion (null if not deleted)
  @Column({ type: "timestamp", nullable: true })
  deletedAt: Date | null;
}
