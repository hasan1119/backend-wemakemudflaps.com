import { z } from "zod";
import { SortOrderTypeEnum } from "../common/common";

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
 * @property minQuantity - The minimum quantity for this price tier.
 * @property maxQuantity - The maximum quantity for this price tier.
 * @property quantityUnit - The unit of quantity (e.g., "piece", "liter").
 * @property fixedPrice - Optional fixed price for the tier.
 * @property percentageDiscount - Optional percentage discount for the tier.
 */
export const ProductTieredPriceInputSchema = z
  .object({
    minQuantity: z
      .number()
      .int()
      .positive("Min quantity must be a positive integer")
      .optional()
      .nullable(),
    maxQuantity: z
      .number()
      .int()
      .positive("Max quantity must be a positive integer")
      .optional()
      .nullable(),
    quantityUnit: z
      .string()
      .min(1, "Quantity unit cannot be empty")
      .trim()
      .optional()
      .nullable(),
    fixedPrice: z
      .number()
      .positive("Fixed price must be a positive number")
      .optional()
      .nullable(),
    percentageDiscount: z.number().min(0).max(100).optional().nullable(),
  })
  .refine(
    (data) => {
      if (!data.minQuantity && !data.maxQuantity) {
        return data.minQuantity < data.maxQuantity;
      }
      return true; // Skip check if either is null/undefined
    },
    {
      message:
        "minQuantity must be less than maxQuantity when both are provided.",
      path: ["minQuantity"],
    }
  )
  .refine(
    (data) => data.fixedPrice !== null || data.percentageDiscount !== null,
    {
      message: "You must provide either fixedPrice or percentageDiscount.",
      path: ["fixedPrice"],
    }
  );

/**
 * Defines the schema for validating product price input.
 *
 * Workflow:
 * 1. Validates `id` as an optional UUID.
 * 2. Ensures `pricingType` is either "Fixed" or "Percentage".
 * 3. Validates `tieredPrices` as an optional array of `ProductTieredPriceInputSchema`.
 * 5. Validates `productVariationId` as an optional UUID.
 *
 * @property pricingType - The type of pricing (Fixed or Percentage).
 * @property tieredPrices - Optional array of tiered pricing details.
 */
export const ProductPriceInputSchema = z
  .object({
    pricingType: z
      .enum(["Fixed", "Percentage"], {
        errorMap: () => ({
          message: "Pricing type must be 'Fixed' or 'Percentage'",
        }),
      })
      .optional()
      .nullable(),
    tieredPrices: z.array(ProductTieredPriceInputSchema).optional().nullable(),
  })
  .refine(
    (data) => {
      if (!data.tieredPrices || !Array.isArray(data.tieredPrices)) return true;

      let previousMax: number | null = null;

      for (let i = 0; i < data.tieredPrices.length; i++) {
        const tier = data.tieredPrices[i];
        const { minQuantity, maxQuantity } = tier;

        // minQuantity must be a number
        if (typeof minQuantity !== "number") return false;

        // If previousMax exists, minQuantity must be exactly bigger than previousMax
        if (previousMax !== null && minQuantity <= previousMax) return false;

        // maxQuantity can be null only for the last item
        const isLast = i === data.tieredPrices.length - 1;
        if (maxQuantity == null && !isLast) return false;

        // If maxQuantity is defined, must be > minQuantity
        if (typeof maxQuantity === "number" && minQuantity >= maxQuantity)
          return false;

        previousMax = maxQuantity ?? null; // carry forward for next iteration
      }

      return true;
    },
    {
      message:
        "Each tier's minQuantity must be exactly one more than previous maxQuantity. Only the last tier can have an open-ended maxQuantity (null).",
      path: ["tieredPrices"],
    }
  );

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
 * 9. Validates `stockStatus` as an optional `StockStatusEnum`.
 * 10. Validates `weightUnit` as an optional `WeightUnitEnum`.
 * 11. Validates `weight` as an optional positive number.
 * 12. Validates `dimensionUnit` as an optional `DimensionUnitEnum`.
 * 13. Validates `length`, `width`, `height` as optional positive numbers.
 * 14. Validates `attributeValueIds` as an optional array of UUIDs.
 * 15. Validates `warrantyDigit` as an optional positive integer.
 * 16. Validates `defaultWarrantyPeriod` as an optional `WarrantyPeriodEnum`.
 * 17. Validates `warrantyPolicy` as an optional non-empty string.
 * 18. Validates `shippingClassId`, `taxClassId` as optional UUIDs.
 * 19. Validates `taxStatus` as an optional `TaxStatusTypeEnum`.
 * 20. Validates `description` as an optional non-empty string.
 * 21. Validates `images` and `videos` as optional arrays of UUIDs.
 * 22. Validates `deletedAt` as an optional datetime string.
 *
 * @property id - Optional unique identifier for the product variation.
 * @property sku - Optional Stock Keeping Unit for the variation.
 * @property brandIds - Optional UUIDs of the associated brands.
 * @property productDeliveryType - Optional array of product delivery types.
 * @property minQuantity - Optional minimum quantity for the variation.
 * @property defaultQuantity - Optional default quantity for the variation.
 * @property maxQuantity - Optional maximum quantity for the variation.
 * @property quantityStep - Optional step increment for quantity.
 * @property regularPrice - The regular price of the variation.
 * @property salePrice - Optional sale price of the variation.
 * @property salePriceStartAt - Optional start date for sale pricing.
 * @property salePriceEndAt - Optional end date for sale pricing.
 * @property stockStatus - Optional stock status of the variation.
 * @property weightUnit - Optional unit of weight for the variation.
 * @property weight - Optional weight of the variation.
 * @property dimensionUnit - Optional unit of dimension for the variation.
 * @property length - Optional length of the variation.
 * @property width - Optional width of the variation.
 * @property height - Optional height of the variation.
 * @property attributeValueIds - Optional array of variation-specific attribute values.
 * @property warrantyDigit - Optional numeric part of warranty duration.
 * @property defaultWarrantyPeriod - Optional period unit for warranty.
 * @property warrantyPolicy - Optional description of the warranty policy.
 * @property shippingClassId - Optional UUID of the shipping class.
 * @property taxStatus - Optional tax status of the variation.
 * @property taxClassId - Optional UUID of the tax class.
 * @property description - Optional description specific to the variation.
 * @property images - Optional array of image UUIDs.
 * @property videos - Optional array of video UUIDs.
 * @property isActive - Optional flag indicating if the variation is active.
 */
export const ProductVariationInputSchema = z.object({
  id: z.string().uuid({ message: "Invalid UUID format" }).nullable().optional(),
  sku: z.string().min(1, "SKU cannot be empty").optional().nullable(),
  productDeliveryType: z
    .array(
      z.enum(["PHYSICAL_PRODUCT", "DOWNLOADABLE_PRODUCT", "VIRTUAL_PRODUCT"])
    )
    .optional()
    .nullable(),
  // remove duplicate brandIds
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
  stockStatus: z
    .enum(["IN_STOCK", "OUT_OF_STOCK", "ON_BACKORDER"])
    .optional()
    .nullable(),
  weightUnit: z
    .enum([
      "MILLIGRAM",
      "GRAM",
      "KILOGRAM",
      "TON",
      "POUND",
      "OUNCE",
      "STONE",
      "CARAT",
      "GRAIN",
      "QUINTAL",
      "METRIC_TON",
    ])
    .optional()
    .nullable(),
  weight: z
    .number()
    .positive("Weight must be a positive number")
    .optional()
    .nullable(),
  dimensionUnit: z
    .enum([
      "MILLIMETER",
      "CENTIMETER",
      "METER",
      "KILOMETER",
      "INCH",
      "FOOT",
      "YARD",
    ])
    .optional()
    .nullable(),
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
  attributeValueIds: z
    .array(z.string().uuid({ message: "Invalid UUID format" }))
    .optional()
    .nullable(),
  warrantyDigit: z
    .number()
    .int()
    .positive("Warranty digit must be a positive integer")
    .optional()
    .nullable(),
  defaultWarrantyPeriod: z
    .enum([
      "DAY",
      "DAYS",
      "WEEK",
      "WEEKS",
      "MONTH",
      "MONTHS",
      "YEAR",
      "YEARS",
      "LIFE_TIME",
    ])
    .optional()
    .nullable(),
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
  taxStatus: z
    .enum(["TAXABLE", "PRODUCT_ONLY", "SHIPPING_ONLY", "NONE"])
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
  isActive: z.boolean().optional().nullable(),
});

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
 * @property isCustomized - Optional flag indicating if the product is customized.
 * @property name - Optional name of the product.
 * @property slug - Optional URL-friendly slug of the product.
 * @property sku - Optional Stock Keeping Unit.
 * @property model - Optional product model identifier.
 * @property defaultImage - Optional UUID of the default image.
 * @property images - Optional array of image UUIDs.
 * @property videos - Optional array of video UUIDs.
 * @property defaultMainDescription - Optional main description of the product.
 * @property defaultShortDescription - Optional short description of the product.
 * @property customBadge - Optional custom badge text.
 * @property purchaseNote - Optional note shown after purchase.
 * @property brandIds - Optional UUIDs of the associated brands.
 * @property tagIds - Optional array of associated tag UUIDs.
 * @property categoryIds - Optional array of category UUIDs.
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
 * @property taxStatus - Optional tax status of the product.
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
 * @property attributeIds - Optional array of product attribute UUIDs.
 * @property variations - Optional array of associated variations.
 * @property enableReviews - Optional flag to enable product reviews.
 * @property isVisible - Optional flag to determine frontend visibility.
 * @property deletedAt - Optional timestamp for soft deletion.
 */
export const updateProductSchema = z
  .object({
    id: z.string().uuid({ message: "Invalid UUID format" }),
    productConfigurationType: z
      .enum(["SIMPLE_PRODUCT", "VARIABLE_PRODUCT"])
      .optional()
      .nullable(),
    productDeliveryType: z
      .array(
        z.enum(["PHYSICAL_PRODUCT", "DOWNLOADABLE_PRODUCT", "VIRTUAL_PRODUCT"])
      )
      .optional()
      .nullable(),
    isCustomized: z.boolean().optional().nullable(),
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
    categoryIds: z
      .array(z.string().uuid({ message: "Invalid UUID format" }))
      .optional()
      .nullable(),
    warrantyDigit: z
      .number()
      .int()
      .positive("Warranty digit must be a positive integer")
      .optional()
      .nullable(),
    defaultWarrantyPeriod: z
      .enum([
        "DAY",
        "DAYS",
        "WEEK",
        "WEEKS",
        "MONTH",
        "MONTHS",
        "YEAR",
        "YEARS",
        "LIFE_TIME",
      ])
      .optional()
      .nullable(),
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
    taxStatus: z
      .enum(["TAXABLE", "PRODUCT_ONLY", "SHIPPING_ONLY", "NONE"])
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
    allowBackOrders: z
      .enum(["DONT_ALLOW", "ALLOW_BUT_NOTIFY_CUSTOMER", "ALLOW"])
      .optional()
      .nullable(),
    lowStockThresHold: z
      .number()
      .int()
      .positive("Low stock threshold must be a positive integer")
      .optional()
      .nullable(),
    stockStatus: z
      .enum(["IN_STOCK", "OUT_OF_STOCK", "ON_BACKORDER"])
      .optional()
      .nullable(),
    soldIndividually: z.boolean().optional().nullable(),
    initialNumberInStock: z
      .number()
      .int()
      .min(0, "Initial number in stock must be a non-negative integer")
      .optional()
      .nullable(),
    weightUnit: z
      .enum([
        "MILLIGRAM",
        "GRAM",
        "KILOGRAM",
        "TON",
        "POUND",
        "OUNCE",
        "STONE",
        "CARAT",
        "GRAIN",
        "QUINTAL",
        "METRIC_TON",
      ])
      .optional()
      .nullable(),
    weight: z
      .number()
      .positive("Weight must be a positive number")
      .optional()
      .nullable(),
    dimensionUnit: z
      .enum([
        "MILLIMETER",
        "CENTIMETER",
        "METER",
        "KILOMETER",
        "INCH",
        "FOOT",
        "YARD",
      ])
      .optional()
      .nullable(),
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
    attributeIds: z
      .array(z.string().uuid({ message: "Invalid UUID format" }))
      .min(1, { message: "At least one UUID is required" })
      .optional()
      .nullable(),
    variations: z.array(ProductVariationInputSchema).optional().nullable(),
    enableReviews: z.boolean().optional().nullable(),
    isVisible: z.boolean().optional().nullable(),
    deletedAt: z.string().datetime().optional().nullable(),
  })
  .refine(
    (data) => {
      if (data.productConfigurationType === "SIMPLE_PRODUCT") {
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
  )
  .refine(
    (data) =>
      Object.keys(data).some(
        (key) => key !== "id" && data[key as keyof typeof data] !== undefined
      ),
    {
      message: "At least one field must be provided for update besides id",
      path: [],
    }
  );

/**
 * Defines the schema for validating product sorting parameters.
 *
 * Workflow:
 * 1. Validates `sortBy` as one of the allowed fields (name, sku, model, createdAt).
 * 2. Validates `sortOrder` as either 'asc' or 'desc'.
 * 3. Validates `filtering` as an optional object containing:
 *   - `brandIds`: Optional array of brand UUIDs.
 *   - `categoryIds`: Optional array of category UUIDs.
 *   - `tagIds`: Optional array of tag UUIDs.
 *   - `productDeliveryType`: Optional array of product delivery types.
 * 3. Allows both fields to be nullable or optional.
 *
 * @property sortBy - Field to sort by (name, sku, model, createdAt).
 * @property sortOrder - Sort order direction (asc, desc).
 * @property filtering - Optional object containing filters:
 *   - `brandIds`: Optional array of brand UUIDs.
 *   - `categoryIds`: Optional array of category UUIDs.
 *   - `tagIds`: Optional array of tag UUIDs.
 *   - `productDeliveryType`: Optional array of product delivery types.
 */
export const productSortingSchema = z.object({
  sortBy: z
    .enum(["name", "sku", "model", "regularPrice", "salePrice", "createdAt"], {
      message:
        "Sort field must be one of: name, sku, model, regularPrice, salePrice, createdAt",
    })
    .nullable()
    .optional(),
  sortOrder: SortOrderTypeEnum,
  filtering: z
    .object({
      brandIds: z
        .array(z.string().uuid({ message: "Invalid UUID format" }))
        .optional()
        .nullable(),
      categoryIds: z
        .array(z.string().uuid({ message: "Invalid UUID format" }))
        .optional()
        .nullable(),
      tagIds: z
        .array(z.string().uuid({ message: "Invalid UUID format" }))
        .optional()
        .nullable(),
      productDeliveryType: z
        .array(
          z.enum([
            "PHYSICAL_PRODUCT",
            "DOWNLOADABLE_PRODUCT",
            "VIRTUAL_PRODUCT",
          ])
        )
        .optional()
        .nullable(),
    })
    .optional()
    .nullable(),
});
