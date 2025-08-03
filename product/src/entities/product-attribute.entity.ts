import {
  Column,
  Entity,
  JoinColumn,
  ManyToOne,
  OneToMany,
  PrimaryGeneratedColumn,
} from "typeorm";
import { ProductAttributeValue } from "./product-attribute-value.entity";
import { Product } from "./product.entity";

@Entity()
export class ProductAttribute {
  @PrimaryGeneratedColumn("uuid")
  id: string;

  // The name of the product attribute (e.g., "Size", "Color")
  @Column()
  name: string;

  // A slug is a URL-friendly version of the name, typically used in URLs
  @Column()
  slug: string;

  // Indicates if the attribute is a system attribute (e.g., predefined attributes like "Color", "Size")
  @Column({ type: "boolean", default: false })
  systemAttribute: boolean;

  // This will store all possible values for a given attribute (e.g., for "Size", values could be "Small", "Medium", "Large")
  @OneToMany(
    () => ProductAttributeValue,
    (attributeValue) => attributeValue.attribute
  )
  values: ProductAttributeValue[];

  // Indicates if the attribute is visible to customers (e.g., "Size" might be visible, but "Internal Code" might not)
  @Column({ type: "boolean", default: true })
  visible: boolean;

  // Indicates if the attribute is used for variations (e.g., "Size" or "Color" for product variations)
  @Column({ type: "boolean", default: false })
  forVariation: boolean;

  // Many copied attributes can point to one system attribute
  @ManyToOne(
    () => ProductAttribute,
    (attribute) => attribute.copiedAttributes,
    {
      nullable: true,
      onDelete: "SET NULL", // optional: removes reference if system attribute is deleted
    }
  )
  @JoinColumn({ name: "systemAttributeId" }) // ties this relation to the column
  systemAttributeRef: ProductAttribute | null;

  // One system attribute can have many replicated copies
  @OneToMany(
    () => ProductAttribute,
    (attribute) => attribute.systemAttributeRef
  )
  copiedAttributes: ProductAttribute[];

  // The product this attribute belongs to (if applicable)
  @ManyToOne(() => Product, (product) => product.attributes, {
    nullable: true,
    onDelete: "CASCADE", // optional: removes attribute if product is deleted
  })
  @JoinColumn({ name: "productId" })
  product: Promise<Product> | null;

  // User ID who created the product attribute (string only for Apollo Federation compatibility)
  @Column()
  createdBy: string;

  // Timestamp when the product attribute was created (auto-generated)
  @Column({ type: "timestamp", default: () => "CURRENT_TIMESTAMP" })
  createdAt: Date;

  // Timestamp for soft deletion (null if not deleted)
  @Column({ type: "timestamp", nullable: true, default: null })
  deletedAt: Date | null;
}
