import { Column, Entity, OneToMany, PrimaryGeneratedColumn } from "typeorm";

import { ProductAttributeValue } from "../../../entities";

@Entity()
export class ProductAttribute {
  @PrimaryGeneratedColumn("uuid")
  id: string;

  // The name of the product attribute (e.g., "Size", "Color")
  @Column({ unique: true })
  name: string;

  // This will store all possible values for a given attribute (e.g., for "Size", values could be "Small", "Medium", "Large")
  @OneToMany(
    () => ProductAttributeValue,
    (attributeValue) => attributeValue.attribute
  )
  values: ProductAttributeValue[];

  // Timestamp when the product attribute was created (auto-generated)
  @Column({ type: "timestamp", default: () => "CURRENT_TIMESTAMP" })
  createdAt: Date;

  // Timestamp for soft deletion (null if not deleted)
  @Column({ type: "timestamp", nullable: true })
  deletedAt: Date | null;
}
