import {
  Column,
  Entity,
  ManyToOne,
  OneToMany,
  PrimaryGeneratedColumn,
} from "typeorm";
import { Category, Product, User } from "../../../entities/index";

@Entity()
export class SubCategory {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ unique: true })
  name: string;

  @ManyToOne(() => Category, (category) => category.subCategories)
  category: Category;

  @OneToMany(() => Product, (product) => product.subCategory)
  products: Product[];

  @ManyToOne(() => User, (user) => user.subCategories, { nullable: false })
  createdBy: User;

  @Column({ type: "timestamp", default: () => "CURRENT_TIMESTAMP" })
  createdAt: Date;

  @Column({ type: "timestamp", nullable: true })
  deletedAt: Date | null; // For soft deletion
}
