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
import { SubCategory } from "./sub-category.entity";
import { Tag } from "./tag.entity";
import { TaxClass } from "./tax-class.entity";
import { TaxStatus } from "./tax-status.entity";

export enum ProductDeliveryTypeEnum {
  PHYSICAL = "Physical Product",
  DOWNLOADABLE = "Downloadable Product",
  VIRTUAL = "Virtual Product",
}

@Entity()
export class Product {
  @PrimaryGeneratedColumn("uuid")
  id: string;

  /* ====================== Basic Info ====================== */

  // Product categorization by configuration
  @Column({
    type: "enum",
    enum: ["Simple Product", "Variable Product"],
  })
  productConfigurationType: string;

  // Product categorization by delivery method
  @Column({
    type: "enum",
    enum: ProductDeliveryTypeEnum,
    enumName: "product_delivery_type_enum",
    array: true,
    nullable: true,
  })
  productDeliveryType: ProductDeliveryTypeEnum[];

  // Product customized
  @Column({ default: false })
  isCustomized: boolean;

  // Product name
  @Column()
  name: string;

  // Product slug
  @Column({ unique: true })
  slug: string;

  // Default thumbnail image for the product (string only for Apollo Federation compatibility)
  @Column({ nullable: true })
  defaultImage: string | null;

  // Additional images related to the product (string only for Apollo Federation compatibility)
  @Column("text", { array: true, nullable: true })
  images: string[] | null;

  // Related videos for the product (string only for Apollo Federation compatibility)
  @Column("text", { array: true, nullable: true })
  videos: string[] | null;

  // Associated brand for the product
  @ManyToOne(() => Brand, (brand) => brand.products, {
    nullable: true,
    onDelete: "SET NULL",
  })
  @JoinColumn({ name: "product_brand" })
  brand: Promise<Brand[]> | null;

  // Associated tags for the product
  @ManyToOne(() => Tag, (tag) => tag.products, {
    nullable: true,
    onDelete: "SET NULL",
  })
  @JoinColumn({ name: "product_tags" })
  tags: Tag[] | null;

  // Main product description
  @Column({ type: "text" })
  defaultMainDescription: string;

  // Short description
  @Column({ type: "text", nullable: true, default: null })
  defaultShortDescription: string | null;

  // Comma-separated product tags
  @Column({ type: "simple-array", nullable: true })
  defaultTags: string[] | null;

  // Primary category for the product
  @ManyToOne(() => Category, (category) => category.products, {
    onDelete: "SET NULL",
  })
  @JoinColumn({ name: "category_id" })
  category: Category;

  // Multiple sub-categories associated with the product
  @ManyToMany(() => SubCategory, (subCategory) => subCategory.products, {
    onDelete: "SET NULL",
    nullable: true,
  })
  @JoinTable({ name: "product_subcategory_ids" })
  subCategories: SubCategory[] | null;

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

  /* ====================== General Pricing Info ====================== */

  // Regular price for a simple product
  @Column({ type: "decimal", precision: 10, scale: 2 })
  regularPrice: number;

  // Sale price for a simple product
  @Column({ type: "decimal", precision: 10, scale: 2, nullable: true })
  salePrice: number | null;

  // Sale price start date
  @Column({ type: "timestamp", nullable: true })
  salePriceStartAt: Date | null;

  // Sale price end date
  @Column({ type: "timestamp", nullable: true })
  salePriceEndAt: Date | null;

  // Tier pricing info for simple products (one-to-one relation with ProductPrice)
  @OneToOne(() => ProductPrice, (pricing) => pricing.product, {
    nullable: true,
    cascade: true, // Ensures the associated tier prices is deleted if the product is deleted
  })
  @JoinColumn({ name: "product_tier_pricing_id" })
  tierPricingInfo: Promise<ProductPrice> | null;

  // Sale quantity limit (if the product is a deal)
  @Column({ nullable: true })
  saleQuantity: number | null;

  // Quantity type (e.g., piece, liter and so on)
  @Column()
  saleQuantityUnit: string;

  // Tax status (controls whether the product cost or shipping is taxable)
  @ManyToOne(() => TaxStatus, (taxStatus) => taxStatus.products, {
    nullable: true,
    onDelete: "SET NULL",
  })
  @JoinColumn({ name: "tax_status_id" })
  taxStatus: TaxStatus | null;

  // Tax class (defines tax rates for the product)
  @ManyToOne(() => TaxClass, (taxClass) => taxClass.products, {
    nullable: true,
    onDelete: "SET NULL",
  })
  @JoinColumn({ name: "tax_class_id" })
  taxClass: TaxClass | null;

  /* ====================== Quantity Settings ====================== */

  // Minimum purchase quantity (for simple products)
  @Column({ nullable: true })
  minQuantity: number | null;

  // Default quantity
  @Column({ nullable: true })
  defaultQuantity: number | null;

  // Maximum purchase quantity
  @Column({ nullable: true })
  maxQuantity: number | null;

  // Step increment when adding product to cart
  @Column({ default: 1 })
  quantityStep: number;

  /* ====================== Inventory Info ====================== */

  // Unique SKU (Stock Keeping Unit) identifier
  @Column({ unique: true, nullable: true })
  sku: string | null;

  // Model number or identifier
  @Column({ nullable: true })
  model: string | null;

  // Whether to manage stock level
  @Column({ type: "boolean", nullable: true, default: null })
  manageStock: boolean | null;

  // Stock quantity (for simple products; for variable products, stock is managed at variation level)
  @Column({ nullable: true, default: null })
  stockQuantity: number | null;

  // Backorder settings (defines if backorders are allowed)
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
  @Column({ type: "boolean", default: true })
  soldIndividually: boolean;

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
  @Column({ type: "decimal", precision: 10, scale: 2, nullable: true })
  weight: number | null;

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

  // Shipping class for grouping similar products for shipping rules
  @ManyToOne(() => ShippingClass, (shippingClass) => shippingClass.products, {
    onDelete: "SET NULL",
  })
  @JoinColumn({ name: "shipping_class_id" })
  shippingClass: string;

  /* ====================== Linked Products ====================== */

  // Upsell products (premium or higher-end alternatives)
  @ManyToMany(() => Product, { nullable: true })
  @JoinTable({
    name: "product_upsells",
    joinColumn: { name: "product_id", referencedColumnName: "id" },
    inverseJoinColumn: {
      name: "upsell_product_id",
      referencedColumnName: "id",
    },
  })
  upsells: Product[] | null;

  // Cross-sell products (complementary products)
  @ManyToMany(() => Product, { nullable: true })
  @JoinTable({
    name: "product_cross_sells",
    joinColumn: { name: "product_id", referencedColumnName: "id" },
    inverseJoinColumn: {
      name: "cross_sell_product_id",
      referencedColumnName: "id",
    },
  })
  crossSells: Product[] | null;

  /* ====================== Attributes ====================== */

  // Additional product attributes (e.g., material, style)
  @ManyToMany(() => ProductAttribute, {
    cascade: true, // Ensures the associated product attribute is deleted if the product is deleted
    nullable: true,
  })
  @JoinTable({
    name: "product_attributes",
    joinColumn: { name: "product_id", referencedColumnName: "id" },
    inverseJoinColumn: { name: "attribute_id", referencedColumnName: "id" },
  })
  attributes: ProductAttribute[] | null;

  /* ====================== Variations ====================== */

  // Variations for variable products (each representing a distinct combination of attribute values)
  @OneToMany(() => ProductVariation, (variation) => variation.product, {
    cascade: true, // Ensures the associated product attribute is deleted if the product is deleted
    nullable: true,
  })
  variations: ProductVariation[] | null;

  /* ====================== Advanced Settings ====================== */

  // Purchase note sent to customers after buying the product
  @Column({ type: "text", nullable: true })
  purchaseNote: string | null;

  // Enable or disable product reviews
  @Column({ type: "boolean", default: true })
  enableReviews: boolean;

  // Product review list
  @ManyToOne(() => ProductReview, (review) => review.product, {
    cascade: true,
    nullable: true,
  })
  @JoinColumn({ name: "review_id" })
  reviews: ProductReview[] | null;

  // Custom badge text for the product (e.g., "New", "Sale")
  @Column({ nullable: true })
  customBadge: string | null;

  // For preview mode (Admins/Authorities can see)
  @Column({ type: "boolean", default: false })
  isPreview: boolean;

  // For customer visibility
  @Column({ type: "boolean", default: false })
  isVisible: boolean;

  // User ID who created the product (string only for Apollo Federation compatibility)
  @Column()
  createdBy: string;

  // Timestamp when the user was created
  @Column({ type: "timestamp", default: () => "CURRENT_TIMESTAMP" })
  createdAt: Date;

  // Timestamp for soft deletion (null if not deleted)
  @Column({ type: "timestamp", nullable: true })
  deletedAt: Date | null;
}
