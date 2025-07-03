import {
  Column,
  Entity,
  JoinColumn,
  ManyToOne,
  OneToMany,
  OneToOne,
  PrimaryGeneratedColumn,
} from "typeorm";
import { Brand } from "./brand.entity";
import { ProductPrice } from "./product-price.entity";
import { ProductVariationAttributeValue } from "./product-variation-attribute-value.entity";
import { Product } from "./product.entity";
import { ShippingClass } from "./shipping-class.entity";
import { TaxClass } from "./tax-class.entity";
import { TaxStatus } from "./tax-status.entity";

enum ProductDeliveryTypeEnum {
  PHYSICAL = "Physical Product",
  DOWNLOADABLE = "Downloadable Product",
  VIRTUAL = "Virtual Product",
}

@Entity()
export class ProductVariation {
  @PrimaryGeneratedColumn("uuid")
  id: string;

  // Product categorization by delivery method
  @Column({
    type: "enum",
    enum: ProductDeliveryTypeEnum,
    enumName: "product_delivery_type_enum",
    array: true,
    nullable: true,
  })
  productDeliveryType: ProductDeliveryTypeEnum[];

  // Associated brand for the product
  @ManyToOne(() => Brand, (brand) => brand.products, {
    nullable: true,
    onDelete: "SET NULL",
  })
  @JoinColumn({ name: "product_variation_brand_id" })
  brand: Promise<Brand[]> | null;

  // SKU for the product variation (nullable)
  @Column({ unique: true, nullable: true })
  sku: string | null;

  // Minimum quantity for the variation (nullable)
  @Column({ nullable: true })
  minQuantity: number | null;

  // Default quantity for the variation (nullable)
  @Column({ nullable: true })
  defaultQuantity: number | null;

  // Maximum quantity for the variation (nullable)
  @Column({ nullable: true })
  maxQuantity: number | null;

  // Quantity step increment for the variation
  @Column({ default: 1 })
  quantityStep: number;

  // Regular price for the product variation
  @Column({ type: "decimal", precision: 10, scale: 2 })
  regularPrice: number;

  // Sale price for the variation (nullable)
  @Column({ type: "decimal", precision: 10, scale: 2, nullable: true })
  salePrice: number | null;

  // Sale price start date (nullable)
  @Column({ type: "timestamp", nullable: true })
  salePriceStartAt: Date | null;

  // Sale price end date (nullable)
  @Column({ type: "timestamp", nullable: true })
  salePriceEndAt: Date | null;

  // One-to-one relationship with ProductPrice for tier pricing info (nullable)
  @OneToOne(() => ProductPrice, (pricing) => pricing.productVariation, {
    nullable: true,
    cascade: true,
  })
  @JoinColumn({ name: "variation_tier_pricing_id" })
  tierPricingInfo: Promise<ProductPrice> | null;

  // Stock status of the product variation (e.g., "In stock", "Out of stock", "On backorder")
  @Column({
    type: "enum",
    enum: ["In stock", "Out of stock", "On backorder"],
    nullable: true,
    default: null,
  })
  stockStatus: string | null;

  // Weight unit for the product variation (e.g., "Kilogram", "Pound")
  @Column({
    type: "enum",
    enum: [
      "Milligram",
      "Gram",
      "Kilogram",
      "Ton",
      "Pound",
      "Ounce",
      "Stone",
      "Carat",
      "Grain",
      "Quintal",
      "Metric Ton",
    ],
    nullable: true,
    default: null,
  })
  weightUnit: string | null;

  // Weight for the product variation (nullable)
  @Column({ type: "decimal", precision: 10, scale: 2, nullable: true })
  weight: number | null;

  // Each variation is related to a product
  @ManyToOne(() => Product, (product) => product.variations, {
    onDelete: "CASCADE", // Ensures the associated variation is deleted if the product is deleted
  })
  @JoinColumn({ name: "product_id" })
  product: Promise<Product>;

  // To store attribute values for the variation
  @OneToMany(
    () => ProductVariationAttributeValue,
    (attrValue) => attrValue.variation,
    { cascade: true }
  )
  attributeValues: ProductVariationAttributeValue[];

  // Warranty digit for the variation (nullable)
  @Column({ nullable: true })
  warrantyDigit: number | null;

  // Warranty period unit for the variation (e.g., "days", "months")
  @Column({
    type: "enum",
    enum: [
      "day",
      "days",
      "week",
      "weeks",
      "month",
      "months",
      "year",
      "years",
      "life-time",
    ],
    nullable: true,
  })
  defaultWarrantyPeriod: string | null;

  // Warranty policy for the variation (nullable)
  @Column({ nullable: true })
  warrantyPolicy: string | null;

  // Dimension unit for the variation (e.g., "Centimeter", "Meter")
  @Column({
    type: "enum",
    enum: [
      "Millimeter",
      "Centimeter",
      "Meter",
      "Kilometer",
      "Inch",
      "Foot",
      "Yard",
    ],
    nullable: true,
    default: null,
  })
  dimensionUnit: string | null;

  // Length of the variation (nullable)
  @Column({ type: "decimal", precision: 10, scale: 2, nullable: true })
  length: number | null;

  // Width of the variation (nullable)
  @Column({ type: "decimal", precision: 10, scale: 2, nullable: true })
  width: number | null;

  // Height of the variation (nullable)
  @Column({ type: "decimal", precision: 10, scale: 2, nullable: true })
  height: number | null;

  // Many-to-one relationship with ShippingClass (nullable)
  @ManyToOne(() => ShippingClass, (shippingClass) => shippingClass.products, {
    onDelete: "SET NULL",
  })
  @JoinColumn({ name: "shipping_class_id" })
  shippingClass: string;

  // Many-to-one relationship with TaxStatus (nullable)
  @ManyToOne(() => TaxStatus, (taxStatus) => taxStatus.products, {
    nullable: true,
    onDelete: "SET NULL",
  })
  @JoinColumn({ name: "tax_status_id" })
  taxStatus: TaxStatus | null;

  // Many-to-one relationship with TaxClass (nullable)
  @ManyToOne(() => TaxClass, (taxClass) => taxClass.products, {
    nullable: true,
    onDelete: "SET NULL",
  })
  @JoinColumn({ name: "tax_class_id" })
  taxClass: TaxClass | null;

  // Description of the product variation
  @Column({ type: "text", nullable: true, default: null })
  description: string | null;

  // Additional images related to the product (string only for Apollo Federation compatibility)
  @Column("text", { array: true, nullable: true })
  images: string[] | null;

  // Related videos for the product (string only for Apollo Federation compatibility)
  @Column("text", { array: true, nullable: true })
  videos: string[] | null;

  // Timestamp when the product variation was created
  @Column({ type: "timestamp", default: () => "CURRENT_TIMESTAMP" })
  createdAt: Date;

  // Timestamp for soft deletion (null if not deleted)
  @Column({ type: "timestamp", nullable: true })
  deletedAt: Date | null;
}
