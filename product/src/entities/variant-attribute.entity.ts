import { Column, Entity, ManyToOne, PrimaryGeneratedColumn } from "typeorm";
import { Variant } from "../../../entities/index";

@Entity()
export class VariantAttribute {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  name: string; // Example: "Red", "Blue", "128GB", "256GB", "8GB RAM", "12GB RAM"

  @ManyToOne(() => Variant, (variant) => variant.attributes, {
    onDelete: "CASCADE",
  })
  variant: Variant;
}
