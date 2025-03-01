import {
  Column,
  Entity,
  ManyToOne,
  OneToMany,
  PrimaryGeneratedColumn,
} from "typeorm";
import { Product, SubCategory, User } from "../../../entities/index";

@Entity()
export class Category {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ unique: true })
  name: string;

  @OneToMany(() => SubCategory, (subCategory) => subCategory.category, {
    cascade: ["remove"],
  })
  subCategories: SubCategory[];

  @OneToMany(() => Product, (product) => product.category)
  products: Product[];

  @ManyToOne(() => User, (user) => user.categories, { nullable: false })
  createdBy: User;

  @Column({ type: "timestamp", default: () => "CURRENT_TIMESTAMP" })
  createdAt: Date;

  @Column({ type: "timestamp", nullable: true })
  deletedAt: Date | null; // For soft deletion
}
