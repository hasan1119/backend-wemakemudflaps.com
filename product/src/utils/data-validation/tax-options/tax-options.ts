import { z } from "zod";

// Defines a mapping for tax calculation methods
export const CalculateTaxBasedOnMap: Record<string, string> = {
  SHIPPING_ADDRESS: "Shipping Address",
  BILLING_ADDRESS: "Billing Address",
  STORE_ADDRESS: "Store Address",
};

// Defines a mapping for display tax totals types
export const displayTaxTotalsTypeMap: Record<string, string> = {
  AS_A_SINGLE_ITEM: "As A Single Item",
  ITEMIZED: "Itemized",
};

/**
 * Enum for calculate tax based on types.
 *
 * @property {"Shipping Address" | "Billing Address" | "Store Address"} value - The type of tax calculation.
 */
export const CalculateTaxBasedOnEnum = z.preprocess((val) => {
  if (typeof val === "string" && CalculateTaxBasedOnMap[val]) {
    return CalculateTaxBasedOnMap[val];
  }
  return val;
}, z.enum([...new Set(Object.values(CalculateTaxBasedOnMap))] as [string, ...string[]]));

/**
 * Enum for display tax totals types.
 *
 * @property {"As A Single Item" | "Itemized"} value - The type of tax option.
 */
export const DisplayTaxTotalsTypeEnum = z.preprocess((val) => {
  if (typeof val === "string" && displayTaxTotalsTypeMap[val]) {
    return displayTaxTotalsTypeMap[val];
  }
  return val;
}, z.enum([...new Set(Object.values(displayTaxTotalsTypeMap))] as [string, ...string[]]));

/**
 * Schema for validating the creation of a new tax option.
 *
 * Workflow:
 * 1. Validates `pricesEnteredWithTax`, `calculateTaxBasedOn`, `displayPricesInShop`,
 * `displayPricesDuringCartAndCheckout`, `priceDisplaySuffix`, `displayTaxTotals`, and `roundTaxAtSubtotalLevel` as required fields with appropriate types.
 * 2. Validates `shippingTaxClassId` as an optional UUID to associate the tax class with shipping.
 * 3. Ensures that all fields are present and of the correct type.
 *
 * @property pricesEnteredWithTax - Whether prices are entered with tax.
 * @property calculateTaxBasedOn - Basis for tax calculation (e.g., "subtotal", "total").
 * @property shippingTaxClassId - The UUID of the tax class applied to shipping.
 * @property displayPricesInShop - Whether to display prices in the shop.
 * @property displayPricesDuringCartAndCheckout - Whether to display prices during cart and checkout.
 * @property priceDisplaySuffix - Suffix to display with prices (e.g., "incl. tax").
 * @property displayTaxTotals - Type of tax totals display (e.g., "As A Single Item", "Itemized").
 * @property roundTaxAtSubtotalLevel - Whether to round tax at the subtotal level.
 */
export const createdTaxOptionsSchema = z.object({
  pricesEnteredWithTax: z.boolean(),
  calculateTaxBasedOn: CalculateTaxBasedOnEnum,
  shippingTaxClassId: z
    .string()
    .uuid({ message: "Invalid UUID format" })
    .optional()
    .nullable(),
  displayPricesInShop: z.boolean(),
  displayPricesDuringCartAndCheckout: z.boolean(),
  priceDisplaySuffix: z.string(),
  displayTaxTotals: DisplayTaxTotalsTypeEnum,
  roundTaxAtSubtotalLevel: z.boolean(),
});

/**
 * Schema for validating the update of existing tax options.
 *
 * Workflow:
 * 1. Validates `pricesEnteredWithTax`, `calculateTaxBasedOn`, `shippingTaxClassId`, `displayPricesInShop`, `displayPricesDuringCartAndCheckout`, `priceDisplaySuffix`, `displayTaxTotals`, and `roundTaxAtSubtotalLevel` as optional fields.
 * 2. Ensures that at least one field is provided for update.
 *
 * @property pricesEnteredWithTax - Whether prices are entered with tax.
 * @property calculateTaxBasedOn - Basis for tax calculation (e.g., "subtotal", "total").
 * @property shippingTaxClassId - The UUID of the tax class applied to shipping.
 * @property pricesEnteredWithTax - Whether prices are entered with tax.
 * @property displayPricesInShop - Whether to display prices in the shop.
 * @property displayPricesDuringCartAndCheckout - Whether to display prices during cart and checkout.
 * @property priceDisplaySuffix - Suffix to display with prices (e.g., "incl. tax").
 * @property displayTaxTotals - Type of tax totals display (e.g., "As A Single Item", "Itemized").
 * @property roundTaxAtSubtotalLevel - Whether to round tax at the subtotal level.
 */
export const updatedTaxOptionsSchema = z.object({
  pricesEnteredWithTax: z.boolean().optional().nullable(),
  calculateTaxBasedOn: CalculateTaxBasedOnEnum.optional().nullable(),
  shippingTaxClassId: z
    .string()
    .uuid({ message: "Invalid UUID format" })
    .optional()
    .nullable(),
  displayPricesInShop: z.boolean().optional().nullable(),
  displayPricesDuringCartAndCheckout: z.boolean().optional().nullable(),
  priceDisplaySuffix: z.string().optional().nullable(),
  displayTaxTotals: DisplayTaxTotalsTypeEnum.optional().nullable(),
  roundTaxAtSubtotalLevel: z.boolean().optional().nullable(),
});
