import {
  Column,
  Entity,
  ManyToOne,
  OneToMany,
  PrimaryGeneratedColumn,
} from "typeorm";
import { Product, VariantAttribute } from "../../../entities/index";

@Entity()
export class Variant {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  name: string; // Example: "Color", "Storage", "RAM"

  @ManyToOne(() => Product, (product) => product.variants, {
    onDelete: "CASCADE",
  })
  product: Product;

  @OneToMany(() => VariantAttribute, (attribute) => attribute.variant, {
    cascade: true,
  })
  attributes: VariantAttribute[];
}
