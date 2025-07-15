import { Column, Entity, OneToMany, PrimaryGeneratedColumn } from "typeorm";
import { ProductAttributeValue } from "./product-attribute-value.entity";

@Entity()
export class ProductAttribute {
  @PrimaryGeneratedColumn("uuid")
  id: string;

  // The name of the product attribute (e.g., "Size", "Color")
  @Column({ unique: true })
  name: string;

  // A slug is a URL-friendly version of the name, typically used in URLs
  @Column({ type: "text", unique: true })
  slug: string;

  // Indicates if the attribute is a system attribute (e.g., predefined attributes like "Color", "Size")
  @Column({ type: "boolean", default: true })
  systemAttribute: boolean;

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
  @Column({ type: "timestamp", nullable: true, default: null })
  deletedAt: Date | null;
}
