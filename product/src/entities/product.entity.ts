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
import { Category } from "./category.entity";
import { ProductAttribute } from "./product-attribute.entity";
import { ProductPrice } from "./product-price.entity";
import { ProductReview } from "./product-review.entity";
import { ProductVariation } from "./product-variation.entity";
import { ShippingClass } from "./shipping-class.entity";
import { Tag } from "./tag.entity";
import { TaxClass } from "./tax-class.entity";

@Entity()
export class Product {
  @PrimaryGeneratedColumn("uuid")
  id: string;

  /* ====================== Basic Info ====================== */

  // Product categorization by configuration
  @Column({
    type: "enum",
    enum: ["Simple Product", "Variable Product"],
    nullable: true,
    default: null,
  })
  productConfigurationType: string | null;

  // Product categorization by delivery method
  @Column({
    type: "enum",
    enum: ["Physical Product", "Downloadable Product", "Virtual Product"],
    array: true,
    nullable: true,
    default: null,
  })
  productDeliveryType: string[] | null;

  // Product customized
  @Column({ default: false })
  isCustomized: boolean;

  // Product name
  @Column({ default: "" })
  name: string;

  // Product slug
  @Column({ unique: true, default: "" })
  slug: string;

  // Default thumbnail image for the product (string only for Apollo Federation compatibility)
  @Column({ nullable: true, default: null })
  defaultImage: string | null;

  // Additional images related to the product (string only for Apollo Federation compatibility)
  @Column("text", { array: true, nullable: true, default: null })
  images: string[] | null;

  // Related videos for the product (string only for Apollo Federation compatibility)
  @Column("text", { array: true, nullable: true, default: null })
  videos: string[] | null;

  // Associated brands for the product
  @ManyToMany(() => Brand, (brand) => brand.products, {
    nullable: true,
    onDelete: "SET NULL",
  })
  @JoinTable({ name: "product_brands" })
  brands: Brand[] | null;

  // Associated tags for the product
  @ManyToMany(() => Tag, (tag) => tag.products, {
    nullable: true,
    onDelete: "SET NULL",
  })
  @JoinTable({ name: "product_tags" })
  tags: Tag[] | null;

  // Main product description
  @Column({ type: "text", nullable: true, default: null })
  defaultMainDescription: string | null;

  // Short description
  @Column({ type: "text", nullable: true, default: null })
  defaultShortDescription: string | null;

  // Associated categories for the product
  @ManyToMany(() => Category, (category) => category.products, {
    onDelete: "SET NULL",
    nullable: true,
  })
  @JoinTable({ name: "product_categories" })
  categories: Category[] | null;

  // Warranty digit for the product (nullable)
  @Column({ nullable: true, default: null })
  warrantyDigit: number | null;

  // Warranty period unit for the product (e.g., "days", "months")
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

  // Warranty policy for the product (nullable)
  @Column({ nullable: true, default: null })
  warrantyPolicy: string | null;

  /* ====================== General Pricing Info ====================== */

  // Regular price for a simple product
  @Column({
    type: "decimal",
    precision: 10,
    scale: 2,
    nullable: true,
    default: null,
  })
  regularPrice: number | null;

  // Sale price for a simple product
  @Column({
    type: "decimal",
    precision: 10,
    scale: 2,
    nullable: true,
    default: null,
  })
  salePrice: number | null;

  // Sale price start date
  @Column({ type: "timestamp", nullable: true, default: null })
  salePriceStartAt: Date | null;

  // Sale price end date
  @Column({ type: "timestamp", nullable: true, default: null })
  salePriceEndAt: Date | null;

  // Tier pricing info for simple products (one-to-one relation with ProductPrice)
  @OneToOne(() => ProductPrice, (pricing) => pricing.product, {
    nullable: true,
    cascade: true,
  })
  @JoinColumn({ name: "product_tier_pricing" })
  tierPricingInfo: Promise<ProductPrice> | null;

  // Sale quantity limit (if the product is a deal)
  @Column({ nullable: true, default: null })
  saleQuantity: number | null;

  // Quantity type (e.g., piece, liter)
  @Column({ nullable: true, default: null })
  saleQuantityUnit: string | null;

  // Tax status (controls whether the product cost or shipping is taxable, required on creation)
  @Column({
    type: "enum",
    enum: ["Taxable", "Product only", "Shipping only", "None"],
    nullable: true,
    default: null,
  })
  taxStatus: string | null;

  // Tax class (defines tax rates for the product)
  @ManyToOne(() => TaxClass, (taxClass) => taxClass.products, {
    onDelete: "SET NULL",
    nullable: true,
  })
  @JoinColumn({ name: "product_tax_class" })
  taxClass: TaxClass | null;

  /* ====================== Quantity Settings ====================== */

  // Minimum purchase quantity (for simple products)
  @Column({ nullable: true, default: null })
  minQuantity: number | null;

  // Default quantity
  @Column({ nullable: true, default: null })
  defaultQuantity: number | null;

  // Maximum purchase quantity
  @Column({ nullable: true, default: null })
  maxQuantity: number | null;

  // Step increment when adding product to cart
  @Column({ default: 1 })
  quantityStep: number;

  /* ====================== Inventory Info ====================== */

  // Unique SKU (Stock Keeping Unit) identifier
  @Column({ nullable: true, default: null })
  sku: string | null;

  // Model number or identifier
  @Column({ nullable: true, default: null })
  model: string | null;

  // Whether to manage stock level
  @Column({ type: "boolean", nullable: true, default: null })
  manageStock: boolean | null;

  // Stock quantity (for simple products; for variable products, stock is managed at variation level)
  @Column({ nullable: true, default: null })
  stockQuantity: number | null;

  // Back order settings (defines if back orders are allowed)
  @Column({
    type: "enum",
    enum: ["Don't allow", "Allow but notify customer", "Allow"],
    nullable: true,
    default: null,
  })
  allowBackOrders: string | null;

  // Low stock threshold to trigger notification
  @Column({ nullable: true, default: null })
  lowStockThresHold: number | null;

  // Stock status displayed on the frontend
  @Column({
    type: "enum",
    enum: ["In stock", "Out of stock", "On backorder"],
    nullable: true,
    default: null,
  })
  stockStatus: string | null;

  // If true, only one item can be purchased per order
  @Column({ type: "boolean", nullable: true, default: null })
  soldIndividually: boolean | null;

  // Initial number in stock (for stock progress bar display)
  @Column({ nullable: true, default: null })
  initialNumberInStock: string | null;

  /* ====================== Shipping Info ====================== */

  // Unit of weight for the product
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

  // Weight of the product
  @Column({
    type: "decimal",
    precision: 10,
    scale: 2,
    nullable: true,
    default: null,
  })
  weight: number | null;

  // Dimension unit for the product
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

  // Length of the product
  @Column({
    type: "decimal",
    precision: 10,
    scale: 2,
    nullable: true,
    default: null,
  })
  length: number | null;

  // Width of the product
  @Column({
    type: "decimal",
    precision: 10,
    scale: 2,
    nullable: true,
    default: null,
  })
  width: number | null;

  // Height of the product
  @Column({
    type: "decimal",
    precision: 10,
    scale: 2,
    nullable: true,
    default: null,
  })
  height: number | null;

  // Shipping class for grouping similar products for shipping rules
  @ManyToOne(() => ShippingClass, (shippingClass) => shippingClass.products, {
    onDelete: "SET NULL",
    nullable: true,
  })
  @JoinColumn({ name: "product_shipping_class" })
  shippingClass: ShippingClass | null;

  /* ====================== Linked Products ====================== */

  // Up-sell products (premium or higher-end alternatives)
  @ManyToMany(() => Product, { nullable: true })
  @JoinTable({
    name: "product_upsells",
  })
  upsells: Product[] | null;

  // Cross-sell products (complementary products)
  @ManyToMany(() => Product, { nullable: true })
  @JoinTable({
    name: "product_cross_sells",
  })
  crossSells: Product[] | null;

  /* ====================== Attributes ====================== */

  // Additional product attributes (e.g., material, style)
  @OneToMany(() => ProductAttribute, (attribute) => attribute.product, {
    cascade: true,
    nullable: true,
    onDelete: "SET NULL",
  })
  @JoinColumn({ name: "product_attributes" })
  attributes: ProductAttribute[] | null;

  /* ====================== Variations ====================== */

  // Variations for variable products (each representing a distinct combination of attribute values)
  @OneToMany(() => ProductVariation, (variation) => variation.product, {
    cascade: true,
  })
  variations: ProductVariation[] | null;

  /* ====================== Advanced Settings ====================== */

  // Purchase note sent to customers after buying the product
  @Column({ type: "text", nullable: true, default: null })
  purchaseNote: string | null;

  // Enable or disable product reviews
  @Column({ type: "boolean", default: true })
  enableReviews: boolean;

  // Product review list
  @OneToMany(() => ProductReview, (review) => review.product, {
    cascade: true,
  })
  reviews: ProductReview[] | null;

  // Custom badge text for the product (e.g., "New", "Sale")
  @Column({ nullable: true, default: null })
  customBadge: string | null;

  // For customer visibility
  @Column({ type: "boolean", default: false })
  isVisible: boolean;

  // User ID who created the product (string only for Apollo Federation compatibility)
  @Column()
  createdBy: string;

  // Timestamp when the product was created
  @Column({ type: "timestamp", default: () => "CURRENT_TIMESTAMP" })
  createdAt: Date;

  // Timestamp for soft deletion (null if not deleted)
  @Column({ type: "timestamp", nullable: true, default: null })
  deletedAt: Date | null;
}
