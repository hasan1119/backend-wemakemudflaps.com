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

@Entity()
export class ProductVariation {
  @PrimaryGeneratedColumn("uuid")
  id: string;

  // Product categorization by delivery method
  @Column({
    type: "enum",
    enum: ["Physical Product", "Downloadable Product", "Virtual Product"],
    enumName: "product_delivery_type_enum",
    array: true,
    nullable: true,
  })
  productDeliveryType: string[] | null;

  // Associated brand for the product
  @ManyToOne(() => Brand, (brand) => brand.products, {
    nullable: true,
    onDelete: "SET NULL",
  })
  @JoinColumn({ name: "variation_brand_id" })
  brands: Promise<Brand[]> | null;

  // SKU for the product variation (nullable)
  @Column({ unique: true, nullable: true, default: null })
  sku: string | null;

  // Minimum quantity for the variation (nullable)
  @Column({ nullable: true, default: null })
  minQuantity: number | null;

  // Default quantity for the variation (nullable)
  @Column({ nullable: true, default: null })
  defaultQuantity: number | null;

  // Maximum quantity for the variation (nullable)
  @Column({ nullable: true, default: null })
  maxQuantity: number | null;

  // Quantity step increment for the variation
  @Column({ default: 1 })
  quantityStep: number;

  // Regular price for the product variation
  @Column({ type: "decimal", precision: 10, scale: 2 })
  regularPrice: number;

  // Sale price for the variation (nullable)
  @Column({
    type: "decimal",
    precision: 10,
    scale: 2,
    nullable: true,
    default: null,
  })
  salePrice: number | null;

  // Sale price start date (nullable)
  @Column({ type: "timestamp", nullable: true, default: null })
  salePriceStartAt: Date | null;

  // Sale price end date (nullable)
  @Column({ type: "timestamp", nullable: true, default: null })
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
  @Column({
    type: "decimal",
    precision: 10,
    scale: 2,
    nullable: true,
    default: null,
  })
  weight: number | null;

  // Each variation is related to a product
  @ManyToOne(() => Product, (product) => product.variations, {
    onDelete: "CASCADE", // Ensures the associated variation is deleted if the product is deleted
  })
  @JoinColumn({ name: "variation_product_id" })
  product: Promise<Product>;

  // To store attribute values for the variation
  @OneToMany(
    () => ProductVariationAttributeValue,
    (attrValue) => attrValue.variation,
    { cascade: true }
  )
  attributeValues: ProductVariationAttributeValue[];

  // Warranty digit for the variation (nullable)
  @Column({ nullable: true, default: null })
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
    default: null,
  })
  defaultWarrantyPeriod: string | null;

  // Warranty policy for the variation (nullable)
  @Column({ nullable: true, default: null })
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
  @Column({
    type: "decimal",
    precision: 10,
    scale: 2,
    nullable: true,
    default: null,
  })
  length: number | null;

  // Width of the variation (nullable)
  @Column({
    type: "decimal",
    precision: 10,
    scale: 2,
    nullable: true,
    default: null,
  })
  width: number | null;

  // Height of the variation (nullable)
  @Column({
    type: "decimal",
    precision: 10,
    scale: 2,
    nullable: true,
    default: null,
  })
  height: number | null;

  // Many-to-one relationship with ShippingClass (nullable)
  @ManyToOne(() => ShippingClass, (shippingClass) => shippingClass.products, {
    onDelete: "SET NULL",
  })
  @JoinColumn({ name: "variation_shipping_class_id" })
  shippingClass: string;

  // Tax status (controls whether the product cost or shipping is taxable)
  @Column({
    type: "enum",
    enum: ["Taxable", "Product only", "Shipping only", "None"],
    default: "Taxable",
  })
  taxStatus: string;

  // Many-to-one relationship with TaxClass (nullable)
  @ManyToOne(() => TaxClass, (taxClass) => taxClass.products, {
    nullable: true,
    onDelete: "SET NULL",
  })
  @JoinColumn({ name: "variation_tax_class_id" })
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
  @Column({ type: "timestamp", nullable: true, default: null })
  deletedAt: Date | null;
}
