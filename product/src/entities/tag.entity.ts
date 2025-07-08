import { Column, Entity, OneToMany, PrimaryGeneratedColumn } from "typeorm";
import { Product } from "./product.entity";

@Entity()
export class Tag {
  @PrimaryGeneratedColumn("uuid")
  id: string;

  // Unique name of the tag
  @Column({ unique: true })
  name: string;

  // Tag slug
  @Column({ unique: true })
  slug: string;

  // One tag can be associated with multiple products
  @OneToMany(() => Product, (product) => product.tags)
  products: Product[];

  // User ID who created the tag (string only for Apollo Federation compatibility)
  @Column()
  createdBy: string;

  // Timestamp when the tag was created (auto-generated)
  @Column({ type: "timestamp", default: () => "CURRENT_TIMESTAMP" })
  createdAt: Date;

  // Timestamp for soft deletion (null if not deleted)
  @Column({ type: "timestamp", nullable: true, default: null })
  deletedAt: Date | null;
}
