// product-variation-attribute-value.entity.ts
import {
  Column,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
} from "typeorm";
import { ProductAttributeValue } from "./product-attribute-value.entity";
import { ProductVariation } from "./product-variation.entity";

@Entity("product_variation_attribute_values")
export class ProductVariationAttributeValue {
  @PrimaryGeneratedColumn("uuid")
  id: string;

  @ManyToOne(() => ProductVariation)
  @JoinColumn({ name: "productVariationId" })
  variation: Promise<ProductVariation>;

  @ManyToOne(() => ProductAttributeValue, {
    nullable: true,
  })
  @JoinColumn({ name: "productAttributeValueId" })
  attributeValue: ProductAttributeValue;

  @Column({ type: "timestamp", default: () => "CURRENT_TIMESTAMP" })
  createdAt: Date;

  @Column({ type: "timestamp", nullable: true })
  deletedAt: Date | null;
}
