import {
  Column,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
} from "typeorm";
import { ProductVariationAttribute } from "./product-variation-attribute.entity";
import { ProductVariation } from "./product-variation.entity";

@Entity()
export class ProductVariationAttributeValue {
  @PrimaryGeneratedColumn("uuid")
  id: string;

  // The value itself (e.g., "Red", "Large", etc.)
  @Column()
  value: string;

  // This field references the attribute definition (e.g., "Color")
  @ManyToOne(() => ProductVariationAttribute, (attribute) => attribute.values, {
    onDelete: "CASCADE", // Ensures the associated value is deleted if the attribute is deleted
  })
  @JoinColumn({ name: "attribute_id" }) // Specifies the column name for the join
  attribute: ProductVariationAttribute;

  // This field references the product variation this attribute value belongs to
  @ManyToOne(() => ProductVariation, (variation) => variation.attributeValues, {
    onDelete: "CASCADE", // Ensures the associated value is deleted if the variation is deleted
  })
  @JoinColumn({ name: "variation_id" }) // Specifies the column name for the join
  variation: Promise<ProductVariation>;

  // Timestamp when the product variation attribute value was created (auto-generated)
  @Column({ type: "timestamp", default: () => "CURRENT_TIMESTAMP" })
  createdAt: Date;

  // Timestamp for soft deletion (null if not deleted)
  @Column({ type: "timestamp", nullable: true })
  deletedAt: Date | null;
}
