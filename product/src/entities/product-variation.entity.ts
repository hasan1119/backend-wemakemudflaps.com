import {
  Column,
  Entity,
  JoinColumn,
  JoinTable,
  ManyToMany,
  ManyToOne,
  OneToMany,
  OneToOne,
  PrimaryGeneratedColumn,
} from "typeorm";
import { Brand } from "./brand.entity";
import { ProductPrice } from "./product-price.entity";
import { ProductVariationAttributeValue } from "./product-variations-attribute-value.entity";
import { Product } from "./product.entity";
import { ShippingClass } from "./shipping-class.entity";
import { TaxClass } from "./tax-class.entity";

export enum ProductConfigurationTypeEnum {
  SIMPLE_PRODUCT = "SIMPLE_PRODUCT",
  VARIABLE_PRODUCT = "VARIABLE_PRODUCT",
}

export enum ProductDeliveryTypeEnum {
  PHYSICAL_PRODUCT = "PHYSICAL_PRODUCT",
  DOWNLOADABLE_PRODUCT = "DOWNLOADABLE_PRODUCT",
  VIRTUAL_PRODUCT = "VIRTUAL_PRODUCT",
}

export enum WarrantyPeriodEnum {
  DAY = "DAY",
  DAYS = "DAYS",
  WEEK = "WEEK",
  WEEKS = "WEEKS",
  MONTH = "MONTH",
  MONTHS = "MONTHS",
  YEAR = "YEAR",
  YEARS = "YEARS",
  LIFETIME = "LIFETIME",
}

export enum TaxStatusEnum {
  TAXABLE = "TAXABLE",
  PRODUCT_ONLY = "PRODUCT_ONLY",
  SHIPPING_ONLY = "SHIPPING_ONLY",
  NONE = "NONE",
}

export enum BackOrderOptionEnum {
  DONT_ALLOW = "DONT_ALLOW",
  ALLOW_BUT_NOTIFY_CUSTOMER = "ALLOW_BUT_NOTIFY_CUSTOMER",
  ALLOW = "ALLOW",
}

export enum StockStatusEnum {
  IN_STOCK = "IN_STOCK",
  OUT_OF_STOCK = "OUT_OF_STOCK",
  ON_BACKORDER = "ON_BACKORDER",
}

export enum WeightUnitEnum {
  MILLIGRAM = "MILLIGRAM",
  GRAM = "GRAM",
  KILOGRAM = "KILOGRAM",
  TON = "TON",
  POUND = "POUND",
  OUNCE = "OUNCE",
  STONE = "STONE",
  CARAT = "CARAT",
  GRAIN = "GRAIN",
  QUINTAL = "QUINTAL",
  METRIC_TON = "METRIC_TON",
}

export enum DimensionUnitEnum {
  MILLIMETER = "MILLIMETER",
  CENTIMETER = "CENTIMETER",
  METER = "METER",
  KILOMETER = "KILOMETER",
  INCH = "INCH",
  FOOT = "FOOT",
  YARD = "YARD",
}

@Entity()
export class ProductVariation {
  @PrimaryGeneratedColumn("uuid")
  id: string;

  // Product categorization by delivery method
  @Column({
    type: "enum",
    enum: ProductDeliveryTypeEnum,
    array: true,
    nullable: true,
  })
  productDeliveryType: ProductDeliveryTypeEnum[] | null;

  // Associated brand for the product
  @ManyToMany(() => Brand, {
    cascade: true,
    nullable: true,
    onDelete: "SET NULL", // Ensures the associated brand is set to null if the brand is deleted
  })
  @JoinTable({
    name: "product_variation_brands",
  })
  brands: Promise<Brand[]> | null;

  // SKU for the product variation (nullable)
  @Column({ nullable: true, default: null })
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
  @Column({
    type: "decimal",
    precision: 10,
    scale: 2,
    nullable: true,
    default: null,
  })
  regularPrice: number | null;

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
    onDelete: "CASCADE", // Ensures the associated tier pricing is deleted if the variation is deleted
  })
  @JoinColumn({ name: "product_variation_tier_pricing" })
  tierPricingInfo: Promise<ProductPrice> | null;

  // Stock status of the product variation (e.g., "In stock", "Out of stock", "On backorder")
  @Column({
    type: "enum",
    enum: StockStatusEnum,
    nullable: true,
    default: null,
  })
  stockStatus: StockStatusEnum | null;

  // Weight unit for the product variation (e.g., "Kilogram", "Pound")
  @Column({
    type: "enum",
    enum: WeightUnitEnum,
    nullable: true,
    default: null,
  })
  weightUnit: WeightUnitEnum | null;

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
  @JoinColumn({ name: "productId" })
  product: Promise<Product>;

  // To store attribute values for the variation
  @OneToMany(
    () => ProductVariationAttributeValue,
    (attributeValue) => attributeValue.variation,
    {
      cascade: true,
    }
  )
  attributeValues: Promise<ProductVariationAttributeValue[]>;

  // Warranty digit for the variation (nullable)
  @Column({ nullable: true, default: null })
  warrantyDigit: number | null;

  // Warranty period unit for the variation (e.g., "days", "months")
  @Column({
    type: "enum",
    enum: WarrantyPeriodEnum,
    nullable: true,
    default: null,
  })
  defaultWarrantyPeriod: WarrantyPeriodEnum | null;

  // Warranty policy for the variation (nullable)
  @Column({ nullable: true, default: null })
  warrantyPolicy: string | null;

  // Dimension unit for the variation (e.g., "Centimeter", "Meter")
  @Column({
    type: "enum",
    enum: DimensionUnitEnum,
    nullable: true,
    default: null,
  })
  dimensionUnit: DimensionUnitEnum | null;

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
    nullable: true,
  })
  @JoinColumn({ name: "product_variation_shipping_class" })
  shippingClass: string | null;

  // Tax status (controls whether the product cost or shipping is taxable)
  @Column({
    type: "enum",
    enum: TaxStatusEnum,
    nullable: true,
    default: null,
  })
  taxStatus: TaxStatusEnum | null;

  // Many-to-one relationship with TaxClass (nullable)
  @ManyToOne(() => TaxClass, (taxClass) => taxClass.products, {
    onDelete: "SET NULL",
    nullable: true,
  })
  @JoinColumn({ name: "product_variation_tax_class" })
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
