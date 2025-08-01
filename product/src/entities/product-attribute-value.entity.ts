import {
  Column,
  Entity,
  JoinTable,
  ManyToMany,
  ManyToOne,
  PrimaryGeneratedColumn,
} from "typeorm";
import { ProductAttribute } from "./product-attribute.entity";
import { ProductVariation } from "./product-variation.entity";

@Entity()
export class ProductAttributeValue {
  @PrimaryGeneratedColumn("uuid")
  id: string;

  // The value of the product attribute (e.g., "Red", "Large", "XL")
  @Column()
  value: string;

  // Specifies which product attribute this value belongs to (e.g., "Color" → "Red", "Blue", "Green")
  @ManyToOne(() => ProductAttribute, (attribute) => attribute.values, {
    onDelete: "CASCADE", // Cascade delete if the product attribute is deleted
    nullable: true,
  })
  attribute: Promise<ProductAttribute> | null;

  // Link to the associated product variations
  @ManyToMany(
    () => ProductVariation,
    (variation) => variation.attributeValues,
    {
      onDelete: "CASCADE",
      nullable: true,
    }
  )
  @JoinTable({
    name: "product_variation_attribute_values",
  })
  variations: Promise<ProductVariation[]> | null;

  // Timestamp when the product attribute value was created (auto-generated)
  @Column({ type: "timestamp", default: () => "CURRENT_TIMESTAMP" })
  createdAt: Date;

  // Timestamp for soft deletion (null if not deleted)
  @Column({ type: "timestamp", nullable: true, default: null })
  deletedAt: Date | null;
}
