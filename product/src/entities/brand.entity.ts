import {
  Column,
  Entity,
  ManyToOne,
  OneToMany,
  PrimaryGeneratedColumn,
} from "typeorm";
import { Product, User } from "../../../entities";

@Entity()
export class Brand {
  // Auto-incrementing primary key
  @PrimaryGeneratedColumn()
  id: number;

  // Unique name of the brand
  @Column({ unique: true })
  name: string;

  // One brand can be associated with multiple products
  @OneToMany(() => Product, (product) => product.brand)
  products: Product[];

  // User who created the brand (Many brands can be created by one user)
  @ManyToOne(() => User, (user) => user.categories, { nullable: false })
  createdBy: User;

  // Timestamp when the brand was created (auto-generated)
  @Column({ type: "timestamp", default: () => "CURRENT_TIMESTAMP" })
  createdAt: Date;

  // Timestamp for soft deletion (null if not deleted)
  @Column({ type: "timestamp", nullable: true })
  deletedAt: Date | null;
}
