import {
  Column,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
} from "typeorm";
import { ProductVariation, ProductVariationAttribute } from "../../../entities";

@Entity()
export class ProductVariationAttributeValue {
  // Auto-incrementing primary key for the product variation attribute value
  @PrimaryGeneratedColumn()
  id: number;

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
  variation: ProductVariation;

  // Timestamp when the product variation attribute value was created (auto-generated)
  @Column({ type: "timestamp", default: () => "CURRENT_TIMESTAMP" })
  createdAt: Date;

  // Timestamp for soft deletion (null if not deleted)
  @Column({ type: "timestamp", nullable: true })
  deletedAt: Date | null;
}
