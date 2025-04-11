import { Column, Entity, OneToMany, PrimaryGeneratedColumn } from "typeorm";
import { ProductVariationAttributeValue } from "../../../entities";

@Entity()
export class ProductVariationAttribute {
  @PrimaryGeneratedColumn("uuid")
  id: string;

  // The name of the attribute (e.g., "Size", "Color")
  @Column()
  name: string;

  // This field holds the possible values for the attribute (e.g., "Small", "Medium", "Large" for "Size")
  @OneToMany(
    () => ProductVariationAttributeValue,
    (attributeValue) => attributeValue.attribute
  )
  values: ProductVariationAttributeValue[];

  // Timestamp when the attribute was created (auto-generated)
  @Column({ type: "timestamp", default: () => "CURRENT_TIMESTAMP" })
  createdAt: Date;

  // Timestamp for soft deletion (null if not deleted)
  @Column({ type: "timestamp", nullable: true })
  deletedAt: Date | null;
}
