import { z } from "zod";
import { SortOrderTypeEnum } from "../common/common";

// Defines a mapping for product configuration values
export const productConfigurationTypeMap: Record<string, string> = {
  SIMPLE_PRODUCT: "Simple Product",
  VARIABLE_PRODUCT: "Variable Product",
};

/**
 * Enum for product configuration types.
 *
 * Workflow:
 * 1. Defines the allowed values for product configuration types.
 *
 * @property {"Simple Product" | "Variable Product"} value - The type of product configuration.
 */
export const ProductConfigurationTypeEnum = z.preprocess((val) => {
  if (typeof val === "string" && productConfigurationTypeMap[val]) {
    return productConfigurationTypeMap[val];
  }
  return val;
}, z.enum([...new Set(Object.values(productConfigurationTypeMap))] as [string, ...string[]]));

// Defines a mapping for product delivery type values
export const productDeliveryTypeMap: Record<string, string> = {
  PHYSICAL_PRODUCT: "Physical Product",
  DOWNLOADABLE_PRODUCT: "Downloadable Product",
  VIRTUAL_PRODUCT: "Virtual Product",
};

/**
 * Enum for product delivery types.
 *
 * Workflow:
 * 1. Defines the allowed values for product delivery types.
 *
 * @property {"Physical Product" | "Downloadable Product" | "Virtual Product"} value - The type of product delivery.
 */
export const ProductDeliveryTypeEnum = z.preprocess((val) => {
  if (typeof val === "string" && productDeliveryTypeMap[val]) {
    return productDeliveryTypeMap[val];
  }
  return val;
}, z.enum([...new Set(Object.values(productDeliveryTypeMap))] as [string, ...string[]]));

// Defines a mapping for default warranty period values
export const WarrantyPeriodTypeMap: Record<string, string> = {
  DAY: "day",
  DAYS: "days",
  WEEK: "week",
  WEEKS: "weeks",
  MONTH: "month",
  MONTHS: "months",
  YEAR: "year",
  YEARS: "years",
  LIFETIME: "life-time",
};

/**
 * Enum for warranty period units.
 *
 * Workflow:
 * 1. Defines the allowed values for warranty period units.
 *
 * @property {"day" | "days" | "week" | "weeks" | "month" | "months" | "year" | "years" | "life-time"} value - The unit of the warranty period.
 */
export const WarrantyPeriodEnum = z.preprocess((val) => {
  if (typeof val === "string" && WarrantyPeriodTypeMap[val]) {
    return WarrantyPeriodTypeMap[val];
  }
  return val;
}, z.enum([...new Set(Object.values(WarrantyPeriodTypeMap))] as [string, ...string[]]));

// Defines a mapping for backorder option values
export const BackOrderOptionTypeMap: Record<string, string> = {
  DONT_ALLOW: "Don't allow",
  ALLOW_WITH_NOTIFICATION: "Allow but notify customer",
  ALLOW: "Allow",
};

/**
 * Enum for backorder options.
 *
 * Workflow:
 * 1. Defines the allowed values for backorder options.
 *
 * @property {"Don't allow" | "Allow but notify customer" | "Allow"} value - The backorder option.
 */
export const BackOrderOptionEnum = z.preprocess((val) => {
  if (typeof val === "string" && BackOrderOptionTypeMap[val]) {
    return BackOrderOptionTypeMap[val];
  }
  return val;
}, z.enum([...new Set(Object.values(BackOrderOptionTypeMap))] as [string, ...string[]]));

// Defines a mapping for stock status values
export const StockStatusTypeMap: Record<string, string> = {
  IN_STOCK: "In stock",
  OUT_OF_STOCK: "Out of stock",
  ON_BACKORDER: "On backorder",
};

/**
 * Enum for stock status.
 *
 * Workflow:
 * 1. Defines the allowed values for stock status.
 *
 * @property {"In stock" | "Out of stock" | "On backorder"} value - The stock status.
 */
export const StockStatusEnum = z.preprocess((val) => {
  if (typeof val === "string" && StockStatusTypeMap[val]) {
    return StockStatusTypeMap[val];
  }
  return val;
}, z.enum([...new Set(Object.values(StockStatusTypeMap))] as [string, ...string[]]));

// Defines a mapping for weight unit values
export const WeightUnitTypeMap: Record<string, string> = {
  MILLIGRAM: "Milligram",
  GRAM: "Gram",
  KILOGRAM: "Kilogram",
  TON: "Ton",
  POUND: "Pound",
  OUNCE: "Ounce",
  STONE: "Stone",
  CARAT: "Carat",
  GRAIN: "Grain",
  QUINTAL: "Quintal",
  METRIC_TON: "Metric Ton",
};

/**
 * Enum for weight units.
 *
 * Workflow:
 * 1. Defines the allowed values for weight units.
 *
 * @property {"Milligram" | "Gram" | "Kilogram" | "Ton" | "Pound" | "Ounce" | "Stone" | "Carat" | "Grain" | "Quintal" | "Metric Ton"} value - The unit of weight.
 */
export const WeightUnitEnum = z.preprocess((val) => {
  if (typeof val === "string" && WeightUnitTypeMap[val]) {
    return WeightUnitTypeMap[val];
  }
  return val;
}, z.enum([...new Set(Object.values(WeightUnitTypeMap))] as [string, ...string[]]));

// Defines a mapping for dimension unit values
export const DimensionUnitTypeMap: Record<string, string> = {
  MILLIMETER: "Millimeter",
  CENTIMETER: "Centimeter",
  METER: "Meter",
  KILOMETER: "Kilometer",
  INCH: "Inch",
  FOOT: "Foot",
  YARD: "Yard",
};

/**
 * Enum for dimension units.
 *
 * Workflow:
 * 1. Defines the allowed values for dimension units.
 *
 * @property {"Millimeter" | "Centimeter" | "Meter" | "Kilometer" | "Inch" | "Foot" | "Yard"} value - The unit of dimension.
 */
export const DimensionUnitEnum = z.preprocess((val) => {
  if (typeof val === "string" && DimensionUnitTypeMap[val]) {
    return DimensionUnitTypeMap[val];
  }
  return val;
}, z.enum([...new Set(Object.values(DimensionUnitTypeMap))] as [string, ...string[]]));

/**
 * Defines the schema for validating product attribute values input.
 *
 * Workflow:
 * 1. Validates `id` as an optional UUID.
 * 2. Ensures `value` is a non-empty string.
 * 3. Validates `attributeId` as a UUID.
 *
 * @property id - Optional unique identifier for the attribute value.
 * @property value - The string value of the attribute (e.g., "Red", "Large").
 * @property attributeId - The UUID of the associated product attribute.
 */
export const ProductAttributeValueInputSchema = z.object({
  id: z.string().uuid({ message: "Invalid UUID format" }).nullable().optional(),
  value: z.string().min(1, "Attribute value cannot be empty").trim(),
  attributeId: z.string().uuid({ message: "Invalid UUID format" }),
});

/**
 * Defines the schema for validating product attributes input.
 *
 * Workflow:
 * 1. Validates `id` as an optional UUID.
 * 2. Ensures `name` is a non-empty string.
 *
 * @property id - Optional unique identifier for the product attribute.
 * @property name - The name of the product attribute (e.g., "Color", "Size").
 */
export const ProductAttributeInputSchema = z.object({
  id: z.string().uuid({ message: "Invalid UUID format" }).nullable().optional(),
  name: z.string().min(1, "Attribute name cannot be empty").trim(),
});

/**
 * Defines the schema for validating product tiered pricing input.
 *
 * Workflow:
 * 1. Validates `id` as an optional UUID.
 * 2. Ensures `minQuantity` and `maxQuantity` are positive integers.
 * 3. Ensures `quantityUnit` is a non-empty string.
 * 4. Validates `fixedPrice` as an optional positive number.
 * 5. Validates `percentageDiscount` as an optional number between 0 and 100.
 * 6. Validates `productPriceId` as an optional UUID.
 *
 * @property id - Optional unique identifier for the tiered price.
 * @property minQuantity - The minimum quantity for this price tier.
 * @property maxQuantity - The maximum quantity for this price tier.
 * @property quantityUnit - The unit of quantity (e.g., "piece", "liter").
 * @property fixedPrice - Optional fixed price for the tier.
 * @property percentageDiscount - Optional percentage discount for the tier.
 * @property productPriceId - Optional UUID of the associated product price.
 */
export const ProductTieredPriceInputSchema = z.object({
  id: z.string().uuid({ message: "Invalid UUID format" }).nullable().optional(),
  minQuantity: z
    .number()
    .int()
    .positive("Min quantity must be a positive integer"),
  maxQuantity: z
    .number()
    .int()
    .positive("Max quantity must be a positive integer"),
  quantityUnit: z.string().min(1, "Quantity unit cannot be empty").trim(),
  fixedPrice: z
    .number()
    .positive("Fixed price must be a positive number")
    .optional()
    .nullable(),
  percentageDiscount: z.number().min(0).max(100).optional().nullable(),
  productPriceId: z
    .string()
    .uuid({ message: "Invalid UUID format" })
    .nullable()
    .optional(),
});

/**
 * Defines the schema for validating product price input.
 *
 * Workflow:
 * 1. Validates `id` as an optional UUID.
 * 2. Ensures `pricingType` is either "Fixed" or "Percentage".
 * 3. Validates `tieredPrices` as an optional array of `ProductTieredPriceInputSchema`.
 * 4. Validates `productId` as an optional UUID.
 * 5. Validates `productVariationId` as an optional UUID.
 *
 * @property id - Optional unique identifier for the product price.
 * @property pricingType - The type of pricing (Fixed or Percentage).
 * @property tieredPrices - Optional array of tiered pricing details.
 * @property productId - Optional UUID of the associated product.
 * @property productVariationId - Optional UUID of the associated product variation.
 */
export const ProductPriceInputSchema = z.object({
  id: z.string().uuid({ message: "Invalid UUID format" }).nullable().optional(),
  pricingType: z.enum(["Fixed", "Percentage"], {
    errorMap: () => ({
      message: "Pricing type must be 'Fixed' or 'Percentage'",
    }),
  }),
  tieredPrices: z.array(ProductTieredPriceInputSchema).optional(),
  productId: z
    .string()
    .uuid({ message: "Invalid UUID format" })
    .nullable()
    .optional(),
  productVariationId: z
    .string()
    .uuid({ message: "Invalid UUID format" })
    .optional(),
});

/**
 * Defines the schema for validating product variation attribute values input.
 *
 * Workflow:
 * 1. Validates `id` as an optional UUID.
 * 2. Ensures `value` is a non-empty string.
 * 3. Validates `attributeId` as a UUID.
 * 4. Validates `variationId` as a UUID.
 *
 * @property id - Optional unique identifier for the variation attribute value.
 * @property value - The string value of the variation attribute.
 * @property attributeId - The UUID of the associated product variation attribute.
 * @property variationId - The UUID of the associated product variation.
 */
export const ProductVariationAttributeValueInputSchema = z.object({
  id: z.string().uuid({ message: "Invalid UUID format" }).nullable().optional(),
  value: z.string().min(1, "Variation attribute value cannot be empty").trim(),
  attributeId: z.string().uuid({ message: "Invalid UUID format" }),
  variationId: z.string().uuid({ message: "Invalid UUID format" }),
});

/**
 * Defines the schema for validating product variations input.
 *
 * Workflow:
 * 1. Validates `id` as an optional UUID.
 * 2. Validates `sku` as an optional non-empty string.
 * 3. Validates `brandIds` as optional UUIDs or arrays of UUIDs.
 * 4. Validates `productDeliveryType` as an optional array of `ProductDeliveryTypeEnum`.
 * 5. Validates `minQuantity`, `defaultQuantity`, `maxQuantity`, `quantityStep` as optional positive integers.
 * 6. Ensures `regularPrice` is a positive number.
 * 7. Validates `salePrice` as an optional positive number.
 * 8. Validates `salePriceStartAt` and `salePriceEndAt` as optional datetime strings.
 * 9. Validates `tierPricingInfoId` as an optional UUID.
 * 10. Validates `stockStatus` as an optional `StockStatusEnum`.
 * 11. Validates `weightUnit` as an optional `WeightUnitEnum`.
 * 12. Validates `weight` as an optional positive number.
 * 13. Validates `dimensionUnit` as an optional `DimensionUnitEnum`.
 * 14. Validates `length`, `width`, `height` as optional positive numbers.
 * 15. Validates `productId` as a UUID.
 * 16. Validates `attributeValues` as an optional array of `ProductVariationAttributeValueInputSchema`.
 * 17. Validates `warrantyDigit` as an optional positive integer.
 * 18. Validates `defaultWarrantyPeriod` as an optional `WarrantyPeriodEnum`.
 * 19. Validates `warrantyPolicy` as an optional non-empty string.
 * 20. Validates `shippingClassId`, `taxStatusId`, `taxClassId` as optional UUIDs.
 * 21. Validates `description` as an optional non-empty string.
 * 22. Validates `images` and `videos` as optional arrays of UUIDs.
 * 23. Validates `deletedAt` as an optional datetime string.
 *
 * @property id - Optional unique identifier for the product variation.
 * @property sku - Optional Stock Keeping Unit for the variation.
 * @property brandIds - Optional UUIDs of the associated brand.
 * @property productDeliveryType - Optional array of product delivery types.
 * @property minQuantity - Optional minimum quantity for the variation.
 * @property defaultQuantity - Optional default quantity for the variation.
 * @property maxQuantity - Optional maximum quantity for the variation.
 * @property quantityStep - Optional step increment for quantity.
 * @property regularPrice - The regular price of the variation.
 * @property salePrice - Optional sale price of the variation.
 * @property salePriceStartAt - Optional start date for sale pricing.
 * @property salePriceEndAt - Optional end date for sale pricing.
 * @property tierPricingInfoId - Optional UUID of the associated tiered pricing information.
 * @property stockStatus - Optional stock status of the variation.
 * @property weightUnit - Optional unit of weight for the variation.
 * @property weight - Optional weight of the variation.
 * @property dimensionUnit - Optional unit of dimension for the variation.
 * @property length - Optional length of the variation.
 * @property width - Optional width of the variation.
 * @property height - Optional height of the variation.
 * @property productId - The UUID of the parent product.
 * @property attributeValues - Optional array of variation-specific attribute values.
 * @property warrantyDigit - Optional numeric part of warranty duration.
 * @property defaultWarrantyPeriod - Optional period string for warranty.
 * @property warrantyPolicy - Optional description of the warranty policy.
 * @property shippingClassId - Optional UUID of the shipping class.
 * @property taxStatusId - Optional UUID of the tax status.
 * @property taxClassId - Optional UUID of the tax class.
 * @property description - Optional description specific to the variation.
 * @property images - Optional array of image UUIDs.
 * @property videos - Optional array of video UUIDs.
 * @property deletedAt - Optional timestamp of soft deletion.
 */
export const ProductVariationInputSchema = z.object({
  id: z.string().uuid({ message: "Invalid UUID format" }).nullable().optional(),
  sku: z.string().min(1, "SKU cannot be empty").optional().nullable(),
  productDeliveryType: z.array(ProductDeliveryTypeEnum).optional(),
  brandIds: z
    .array(z.string().uuid({ message: "Invalid UUID format" }))
    .optional()
    .nullable(),
  minQuantity: z
    .number()
    .int()
    .positive("Min quantity must be a positive integer")
    .optional()
    .nullable(),
  defaultQuantity: z
    .number()
    .int()
    .positive("Default quantity must be a positive integer")
    .optional()
    .nullable(),
  maxQuantity: z
    .number()
    .int()
    .positive("Max quantity must be a positive integer")
    .optional()
    .nullable(),
  quantityStep: z
    .number()
    .int()
    .positive("Quantity step must be a positive integer")
    .nullable()
    .optional(),
  regularPrice: z.number().positive("Regular price must be a positive number"),
  salePrice: z
    .number()
    .positive("Sale price must be a positive number")
    .optional()
    .nullable(),
  salePriceStartAt: z.string().datetime().optional().nullable(),
  salePriceEndAt: z.string().datetime().optional().nullable(),
  tierPricingInfoId: z
    .string()
    .uuid({ message: "Invalid UUID format" })
    .optional()
    .nullable(),
  stockStatus: StockStatusEnum.optional().nullable(),
  weightUnit: WeightUnitEnum.optional().nullable(),
  weight: z
    .number()
    .positive("Weight must be a positive number")
    .optional()
    .nullable(),
  dimensionUnit: DimensionUnitEnum.optional().nullable(),
  length: z
    .number()
    .positive("Length must be a positive number")
    .optional()
    .nullable(),
  width: z
    .number()
    .positive("Width must be a positive number")
    .optional()
    .nullable(),
  height: z
    .number()
    .positive("Height must be a positive number")
    .optional()
    .nullable(),
  productId: z.string().uuid({ message: "Invalid UUID format" }),
  attributeValues: z
    .array(ProductVariationAttributeValueInputSchema)
    .optional(),
  warrantyDigit: z
    .number()
    .int()
    .positive("Warranty digit must be a positive integer")
    .optional()
    .nullable(),
  defaultWarrantyPeriod: WarrantyPeriodEnum.optional().nullable(),
  warrantyPolicy: z
    .string()
    .min(1, "Warranty policy cannot be empty")
    .optional()
    .nullable(),
  shippingClassId: z
    .string()
    .uuid({ message: "Invalid UUID format" })
    .optional()
    .nullable(),
  taxStatusId: z
    .string()
    .uuid({ message: "Invalid UUID format" })
    .optional()
    .nullable(),
  taxClassId: z
    .string()
    .uuid({ message: "Invalid UUID format" })
    .optional()
    .nullable(),
  description: z
    .string()
    .min(1, "Description cannot be empty")
    .optional()
    .nullable(),
  images: z
    .array(z.string().uuid({ message: "Invalid UUID format" }))
    .optional()
    .nullable(),
  videos: z
    .array(z.string().uuid({ message: "Invalid UUID format" }))
    .optional()
    .nullable(),
  deletedAt: z.string().datetime().optional().nullable(),
});

/**
 * Defines the schema for validating the creation of a new product.
 *
 * Workflow:
 * 1. Validates `productConfigurationType` and `productDeliveryType` using their respective enums.
 * 2. Ensures `name` and `slug` are non-empty strings with a minimum length of 3 characters.
 * 3. Validates `sku` and `model` as optional non-empty strings.
 * 4. Validates `defaultImage`, `images`, `videos` as optional arrays of UUIDs.
 * 5. Ensures `defaultMainDescription` is a non-empty string.
 * 6. Validates `defaultShortDescription`, `defaultTags`, `customBadge`, `purchaseNote` as optional non-empty strings or arrays of strings.
 * 7. Validates `brandIds`, `tagIds`, `categoryId`, `subCategoryIds` as optional UUIDs or arrays of UUIDs.
 * 8. Validates `warrantyDigit` as an optional positive integer and `defaultWarrantyPeriod` as an optional `WarrantyPeriodEnum`.
 * 9. Validates `warrantyPolicy` as an optional non-empty string.
 * 10. Ensures `regularPrice` is a positive number.
 * 11. Validates `salePrice` as an optional positive number.
 * 12. Validates `salePriceStartAt` and `salePriceEndAt` as optional datetime strings.
 * 13. Validates `tierPricingInfo` as an optional `ProductPriceInputSchema`.
 * 14. Validates `saleQuantity` as an optional positive integer and `saleQuantityUnit` as a non-empty string.
 * 15. Validates `taxStatusId` and `taxClassId` as optional UUIDs.
 * 16. Validates `minQuantity`, `defaultQuantity`, `maxQuantity`, `quantityStep` as optional positive integers.
 * 17. Validates `manageStock`, `soldIndividually`, `enableReviews`, `isPreview`, `isVisible` as optional booleans.
 * 18. Validates `stockQuantity`, `lowStockThresHold` as optional positive integers.
 * 19. Validates `allowBackOrders` as an optional `BackOrderOptionEnum`.
 * 20. Validates `initialNumberInStock` as an optional non-empty string.
 * 21. Validates `weightUnit`, `dimensionUnit` using their respective enums.
 * 22. Validates `weight`, `length`, `width`, `height` as optional positive numbers.
 * 23. Validates `shippingClassId`, `upsellIds`, `crossSellIds` as optional UUIDs or arrays of UUIDs.
 * 24. Validates `attributes` as an optional array of `ProductAttributeInputSchema`.
 * 25. Validates `variations` as an optional array of `ProductVariationInputSchema`.
 *
 * @property productConfigurationType - The configuration type of the product.
 * @property productDeliveryType - The delivery type(s) of the product.
 * @property name - The name of the product.
 * @property slug - The URL-friendly slug of the product.
 * @property sku - Optional Stock Keeping Unit.
 * @property model - Optional product model identifier.
 * @property defaultImage - Optional UUID of the default image.
 * @property images - Optional array of image UUIDs.
 * @property videos - Optional array of video UUIDs.
 * @property defaultMainDescription - The main description of the product.
 * @property defaultShortDescription - Optional short description of the product.
 * @property defaultTags - Optional array of keyword tags.
 * @property customBadge - Optional custom badge text.
 * @property purchaseNote - Optional note shown after purchase.
 * @property brandIds - Optional UUIDs of the associated brand.
 * @property tagIds - Optional array of associated tag UUIDs.
 * @property categoryId - The UUID of the primary category.
 * @property subCategoryIds - Optional array of sub-category UUIDs.
 * @property warrantyDigit - Optional numeric part of warranty duration.
 * @property defaultWarrantyPeriod - Optional unit for warranty period.
 * @property warrantyPolicy - Optional description of the warranty policy.
 * @property regularPrice - The regular price of the product.
 * @property salePrice - Optional sale price of the product.
 * @property salePriceStartAt - Optional start date for sale pricing.
 * @property salePriceEndAt - Optional end date for sale pricing.
 * @property tierPricingInfo - Optional tiered pricing information.
 * @property saleQuantity - Optional sale quantity limit.
 * @property saleQuantityUnit - The unit for sale quantity.
 * @property taxStatusId - Optional UUID of the tax status.
 * @property taxClassId - Optional UUID of the tax class.
 * @property minQuantity - Optional minimum purchase quantity.
 * @property defaultQuantity - Optional default quantity in cart.
 * @property maxQuantity - Optional maximum purchase quantity.
 * @property quantityStep - Optional step value for quantity selector.
 * @property manageStock - Optional flag to toggle stock management.
 * @property stockQuantity - Optional available stock.
 * @property allowBackOrders - Optional backorder status.
 * @property lowStockThresHold - Optional low stock warning threshold.
 * @property stockStatus - Optional current stock status.
 * @property soldIndividually - Optional flag to restrict to one per order.
 * @property initialNumberInStock - Optional initial stock value.
 * @property weightUnit - Optional unit of weight.
 * @property weight - Optional weight value.
 * @property dimensionUnit - Optional unit for dimensions.
 * @property length - Optional length of the product.
 * @property width - Optional width of the product.
 * @property height - Optional height of the product.
 * @property shippingClassId - Optional UUID of the related shipping class.
 * @property upsellIds - Optional array of upsell product UUIDs.
 * @property crossSellIds - Optional array of cross-sell product UUIDs.
 * @property attributes - Optional array of product attributes.
 * @property variations - Optional array of associated variations.
 * @property enableReviews - Optional flag to enable product reviews.
 * @property isPreview - Optional flag to mark as preview-only.
 * @property isVisible - Optional flag to determine frontend visibility.
 */
export const createProductSchema = z
  .object({
    productConfigurationType: ProductConfigurationTypeEnum,
    productDeliveryType: z.array(ProductDeliveryTypeEnum),
    name: z
      .string()
      .min(3, "Product name must be at least 3 characters")
      .trim(),
    slug: z
      .string()
      .min(3, "Product slug must be at least 3 characters")
      .trim(),
    sku: z.string().min(1, "SKU cannot be empty").optional().nullable(),
    model: z.string().min(1, "Model cannot be empty").optional().nullable(),
    defaultImage: z
      .string()
      .uuid({ message: "Invalid UUID format" })
      .optional()
      .nullable(),
    images: z
      .array(z.string().uuid({ message: "Invalid UUID format" }))
      .optional()
      .nullable(),
    videos: z
      .array(z.string().uuid({ message: "Invalid UUID format" }))
      .optional()
      .nullable(),
    defaultMainDescription: z
      .string()
      .min(1, "Main description cannot be empty")
      .trim(),
    defaultShortDescription: z
      .string()
      .min(1, "Short description cannot be empty")
      .optional()
      .nullable(),
    defaultTags: z
      .array(z.string().min(1, "Tag cannot be empty"))
      .optional()
      .nullable(),
    customBadge: z
      .string()
      .min(1, "Custom badge cannot be empty")
      .optional()
      .nullable(),
    purchaseNote: z
      .string()
      .min(1, "Purchase note cannot be empty")
      .optional()
      .nullable(),
    brandIds: z
      .array(z.string().uuid({ message: "Invalid UUID format" }))
      .optional()
      .nullable(),
    tagIds: z
      .array(z.string().uuid({ message: "Invalid UUID format" }))
      .optional()
      .nullable(),
    categoryId: z.string().uuid({ message: "Invalid UUID format" }),
    subCategoryIds: z
      .array(z.string().uuid({ message: "Invalid UUID format" }))
      .optional()
      .nullable(),
    warrantyDigit: z
      .number()
      .int()
      .positive("Warranty digit must be a positive integer")
      .optional()
      .nullable(),
    defaultWarrantyPeriod: WarrantyPeriodEnum.optional().nullable(),
    warrantyPolicy: z
      .string()
      .min(1, "Warranty policy cannot be empty")
      .optional()
      .nullable(),
    regularPrice: z
      .number()
      .positive("Regular price must be a positive number"),
    salePrice: z
      .number()
      .positive("Sale price must be a positive number")
      .optional()
      .nullable(),
    salePriceStartAt: z.string().datetime().optional().nullable(),
    salePriceEndAt: z.string().datetime().optional().nullable(),
    tierPricingInfo: ProductPriceInputSchema.optional().nullable(),
    saleQuantity: z
      .number()
      .int()
      .positive("Sale quantity must be a positive integer")
      .optional()
      .nullable(),
    saleQuantityUnit: z
      .string()
      .min(1, "Sale quantity unit cannot be empty")
      .trim(),
    taxStatusId: z
      .string()
      .uuid({ message: "Invalid UUID format" })
      .optional()
      .nullable(),
    taxClassId: z
      .string()
      .uuid({ message: "Invalid UUID format" })
      .optional()
      .nullable(),
    minQuantity: z
      .number()
      .int()
      .positive("Min quantity must be a positive integer")
      .optional()
      .nullable(),
    defaultQuantity: z
      .number()
      .int()
      .positive("Default quantity must be a positive integer")
      .optional()
      .nullable(),
    maxQuantity: z
      .number()
      .int()
      .positive("Max quantity must be a positive integer")
      .optional()
      .nullable(),
    quantityStep: z
      .number()
      .int()
      .positive("Quantity step must be a positive integer")
      .nullable()
      .optional(),
    manageStock: z.boolean().optional().nullable(),
    stockQuantity: z
      .number()
      .int()
      .positive("Stock quantity must be a positive integer")
      .optional()
      .nullable(),
    allowBackOrders: BackOrderOptionEnum.optional().nullable(),
    lowStockThresHold: z
      .number()
      .int()
      .positive("Low stock threshold must be a positive integer")
      .optional()
      .nullable(),
    stockStatus: StockStatusEnum.optional().nullable(),
    soldIndividually: z.boolean().optional(),
    initialNumberInStock: z
      .string()
      .min(1, "Initial number in stock cannot be empty")
      .optional()
      .nullable(),
    weightUnit: WeightUnitEnum.optional().nullable(),
    weight: z
      .number()
      .positive("Weight must be a positive number")
      .optional()
      .nullable(),
    dimensionUnit: DimensionUnitEnum.optional().nullable(),
    length: z
      .number()
      .positive("Length must be a positive number")
      .optional()
      .nullable(),
    width: z
      .number()
      .positive("Width must be a positive number")
      .optional()
      .nullable(),
    height: z
      .number()
      .positive("Height must be a positive number")
      .optional()
      .nullable(),
    shippingClassId: z
      .string()
      .uuid({ message: "Invalid UUID format" })
      .optional()
      .nullable(),
    upsellIds: z
      .array(z.string().uuid({ message: "Invalid UUID format" }))
      .optional()
      .nullable(),
    crossSellIds: z
      .array(z.string().uuid({ message: "Invalid UUID format" }))
      .optional()
      .nullable(),
    attributes: z.array(ProductAttributeInputSchema).optional().nullable(),
    variations: z.array(ProductVariationInputSchema).optional().nullable(),
    enableReviews: z.boolean().optional(),
    isPreview: z.boolean().optional(),
    isVisible: z.boolean().optional(),
  })
  .refine(
    (data) => {
      if (data.productConfigurationType === "Simple Product") {
        // For simple product, variations must be null or undefined or empty
        return (
          data.variations === undefined ||
          data.variations === null ||
          (Array.isArray(data.variations) && data.variations.length === 0)
        );
      }
      // For non-simple product types, no restriction on variations here
      return true;
    },
    {
      message:
        "Variations are not allowed when productConfigurationType is 'Simple Product'",
      path: ["variations"], // error reported on variations field
    }
  );

/**
 * Defines the schema for validating the update of an existing product.
 *
 * Workflow:
 * 1. Validates `id` as a UUID.
 * 2. All other fields are optional and validated similarly to `createProductSchema`.
 *
 * @property id - The UUID of the product to update.
 * @property productConfigurationType - Optional configuration type of the product.
 * @property productDeliveryType - Optional delivery type(s) of the product.
 * @property name - Optional name of the product.
 * @property slug - Optional URL-friendly slug of the product.
 * @property sku - Optional Stock Keeping Unit.
 * @property model - Optional product model identifier.
 * @property defaultImage - Optional UUID of the default image.
 * @property images - Optional array of image UUIDs.
 * @property videos - Optional array of video UUIDs.
 * @property defaultMainDescription - Optional main description of the product.
 * @property defaultShortDescription - Optional short description of the product.
 * @property defaultTags - Optional array of keyword tags.
 * @property customBadge - Optional custom badge text.
 * @property purchaseNote - Optional note shown after purchase.
 * @property brandId - Optional UUID of the associated brand.
 * @property tagIds - Optional array of associated tag UUIDs.
 * @property categoryId - Optional UUID of the primary category.
 * @property subCategoryIds - Optional array of sub-category UUIDs.
 * @property warrantyDigit - Optional numeric part of warranty duration.
 * @property defaultWarrantyPeriod - Optional unit for warranty period.
 * @property warrantyPolicy - Optional description of the warranty policy.
 * @property regularPrice - Optional regular price of the product.
 * @property salePrice - Optional sale price of the product.
 * @property salePriceStartAt - Optional start date for sale pricing.
 * @property salePriceEndAt - Optional end date for sale pricing.
 * @property tierPricingInfo - Optional tiered pricing information.
 * @property saleQuantity - Optional sale quantity limit.
 * @property saleQuantityUnit - Optional unit for sale quantity.
 * @property taxStatusId - Optional UUID of the tax status.
 * @property taxClassId - Optional UUID of the tax class.
 * @property minQuantity - Optional minimum purchase quantity.
 * @property defaultQuantity - Optional default quantity in cart.
 * @property maxQuantity - Optional maximum purchase quantity.
 * @property quantityStep - Optional step value for quantity selector.
 * @property manageStock - Optional flag to toggle stock management.
 * @property stockQuantity - Optional available stock.
 * @property allowBackOrders - Optional backorder status.
 * @property lowStockThresHold - Optional low stock warning threshold.
 * @property stockStatus - Optional current stock status.
 * @property soldIndividually - Optional flag to restrict to one per order.
 * @property initialNumberInStock - Optional initial stock value.
 * @property weightUnit - Optional unit of weight.
 * @property weight - Optional weight value.
 * @property dimensionUnit - Optional unit for dimensions.
 * @property length - Optional length of the product.
 * @property width - Optional width of the product.
 * @property height - Optional height of the product.
 * @property shippingClassId - Optional UUID of the related shipping class.
 * @property upsellIds - Optional array of upsell product UUIDs.
 * @property crossSellIds - Optional array of cross-sell product UUIDs.
 * @property attributes - Optional array of product attributes.
 * @property variations - Optional array of associated variations.
 * @property enableReviews - Optional flag to enable product reviews.
 * @property isPreview - Optional flag to mark as preview-only.
 * @property isVisible - Optional flag to determine frontend visibility.
 * @property deletedAt - Optional timestamp for soft deletion.
 */
export const updateProductSchema = z
  .object({
    id: z.string().uuid({ message: "Invalid UUID format" }),
    productConfigurationType:
      ProductConfigurationTypeEnum.optional().nullable(),
    productDeliveryType: z.array(ProductDeliveryTypeEnum).optional().nullable(),
    name: z
      .string()
      .min(3, "Product name must be at least 3 characters")
      .trim()
      .optional()
      .nullable(),
    slug: z
      .string()
      .min(3, "Product slug must be at least 3 characters")
      .trim()
      .optional()
      .nullable(),
    sku: z.string().min(1, "SKU cannot be empty").optional().nullable(),
    model: z.string().min(1, "Model cannot be empty").optional().nullable(),
    defaultImage: z
      .string()
      .uuid({ message: "Invalid UUID format" })
      .optional()
      .nullable(),
    images: z
      .array(z.string().uuid({ message: "Invalid UUID format" }))
      .optional()
      .nullable(),
    videos: z
      .array(z.string().uuid({ message: "Invalid UUID format" }))
      .optional()
      .nullable(),
    defaultMainDescription: z
      .string()
      .min(1, "Main description cannot be empty")
      .trim()
      .optional()
      .nullable(),
    defaultShortDescription: z
      .string()
      .min(1, "Short description cannot be empty")
      .optional()
      .nullable(),
    defaultTags: z
      .array(z.string().min(1, "Tag cannot be empty"))
      .optional()
      .nullable(),
    customBadge: z
      .string()
      .min(1, "Custom badge cannot be empty")
      .optional()
      .nullable(),
    purchaseNote: z
      .string()
      .min(1, "Purchase note cannot be empty")
      .optional()
      .nullable(),
    brandIds: z
      .array(z.string().uuid("Invalid brand ID format"))
      .optional()
      .nullable(),
    tagIds: z
      .array(z.string().uuid({ message: "Invalid UUID format" }))
      .optional()
      .nullable(),
    categoryId: z
      .string()
      .uuid({ message: "Invalid UUID format" })
      .optional()
      .nullable(),
    subCategoryIds: z
      .array(z.string().uuid({ message: "Invalid UUID format" }))
      .optional()
      .nullable(),
    warrantyDigit: z
      .number()
      .int()
      .positive("Warranty digit must be a positive integer")
      .optional()
      .nullable(),
    defaultWarrantyPeriod: WarrantyPeriodEnum.optional().nullable(),
    warrantyPolicy: z
      .string()
      .min(1, "Warranty policy cannot be empty")
      .optional()
      .nullable(),
    regularPrice: z
      .number()
      .positive("Regular price must be a positive number")
      .optional()
      .nullable(),
    salePrice: z
      .number()
      .positive("Sale price must be a positive number")
      .optional()
      .nullable(),
    salePriceStartAt: z.string().datetime().optional().nullable(),
    salePriceEndAt: z.string().datetime().optional().nullable(),
    tierPricingInfo: ProductPriceInputSchema.optional().nullable(),
    saleQuantity: z
      .number()
      .int()
      .positive("Sale quantity must be a positive integer")
      .optional()
      .nullable(),
    saleQuantityUnit: z
      .string()
      .min(1, "Sale quantity unit cannot be empty")
      .trim()
      .optional()
      .nullable(),
    taxStatusId: z
      .string()
      .uuid({ message: "Invalid UUID format" })
      .optional()
      .nullable(),
    taxClassId: z
      .string()
      .uuid({ message: "Invalid UUID format" })
      .optional()
      .nullable(),
    minQuantity: z
      .number()
      .int()
      .positive("Min quantity must be a positive integer")
      .optional()
      .nullable(),
    defaultQuantity: z
      .number()
      .int()
      .positive("Default quantity must be a positive integer")
      .optional()
      .nullable(),
    maxQuantity: z
      .number()
      .int()
      .positive("Max quantity must be a positive integer")
      .optional()
      .nullable(),
    quantityStep: z
      .number()
      .int()
      .positive("Quantity step must be a positive integer")
      .optional()
      .nullable(),
    manageStock: z.boolean().optional().nullable(),
    stockQuantity: z
      .number()
      .int()
      .positive("Stock quantity must be a positive integer")
      .optional()
      .nullable(),
    allowBackOrders: BackOrderOptionEnum.optional().nullable(),
    lowStockThresHold: z
      .number()
      .int()
      .positive("Low stock threshold must be a positive integer")
      .optional()
      .nullable(),
    stockStatus: StockStatusEnum.optional().nullable(),
    soldIndividually: z.boolean().optional().nullable(),
    initialNumberInStock: z
      .string()
      .min(1, "Initial number in stock cannot be empty")
      .optional()
      .nullable(),
    weightUnit: WeightUnitEnum.optional().nullable(),
    weight: z
      .number()
      .positive("Weight must be a positive number")
      .optional()
      .nullable(),
    dimensionUnit: DimensionUnitEnum.optional().nullable(),
    length: z
      .number()
      .positive("Length must be a positive number")
      .optional()
      .nullable(),
    width: z
      .number()
      .positive("Width must be a positive number")
      .optional()
      .nullable(),
    height: z
      .number()
      .positive("Height must be a positive number")
      .optional()
      .nullable(),
    shippingClassId: z
      .string()
      .uuid({ message: "Invalid UUID format" })
      .optional()
      .nullable(),
    upsellIds: z
      .array(z.string().uuid({ message: "Invalid UUID format" }))
      .optional()
      .nullable(),
    crossSellIds: z
      .array(z.string().uuid({ message: "Invalid UUID format" }))
      .optional()
      .nullable(),
    attributes: z.array(ProductAttributeInputSchema).optional().nullable(),
    variations: z.array(ProductVariationInputSchema).optional().nullable(),
    enableReviews: z.boolean().optional().nullable(),
    isPreview: z.boolean().optional().nullable(),
    isVisible: z.boolean().optional().nullable(),
    deletedAt: z.string().datetime().optional().nullable(),
  })
  .refine(
    (data) => {
      if (data.productConfigurationType === "Simple Product") {
        // For simple product, variations must be null or undefined or empty
        return (
          data.variations === undefined ||
          data.variations === null ||
          (Array.isArray(data.variations) && data.variations.length === 0)
        );
      }
      // For non-simple product types, no restriction on variations here
      return true;
    },
    {
      message:
        "Variations are not allowed when productConfigurationType is 'Simple Product'",
      path: ["variations"], // error reported on variations field
    }
  );

/**
 * Defines the schema for validating product sorting parameters.
 *
 * Workflow:
 * 1. Validates `sortBy` as one of the allowed fields (name, sku, model, createdAt, deletedAt).
 * 2. Validates `sortOrder` as either 'asc' or 'desc'.
 * 3. Allows both fields to be nullable or optional.
 *
 * @property sortBy - Field to sort by (name, sku, model, createdAt, deletedAt).
 * @property sortOrder - Sort order direction (asc, desc).
 */
export const productSortingSchema = z.object({
  sortBy: z
    .enum(["name", "sku", "model", "createdAt", "deletedAt"], {
      message:
        "Sort field must be one of: name, sku, model, createdAt, deletedAt",
    })
    .nullable()
    .optional(),
  sortOrder: SortOrderTypeEnum,
});
