import { z } from "zod";

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
  calculateTaxBasedOn: z.enum([
    "SHIPPING_ADDRESS",
    "BILLING_ADDRESS",
    "STORE_ADDRESS",
  ]),
  shippingTaxClassId: z
    .string()
    .uuid({ message: "Invalid UUID format" })
    .optional()
    .nullable(),
  displayPricesInShop: z.boolean(),
  displayPricesDuringCartAndCheckout: z.boolean(),
  priceDisplaySuffix: z.string(),
  displayTaxTotals: z.enum(["AS_A_SINGLE_ITEM", "ITEMIZED"]),
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
  calculateTaxBasedOn: z
    .enum(["SHIPPING_ADDRESS", "BILLING_ADDRESS", "STORE_ADDRESS"])
    .optional()
    .nullable(),
  shippingTaxClassId: z
    .string()
    .uuid({ message: "Invalid UUID format" })
    .optional()
    .nullable(),
  displayPricesInShop: z.boolean().optional().nullable(),
  displayPricesDuringCartAndCheckout: z.boolean().optional().nullable(),
  priceDisplaySuffix: z.string().optional().nullable(),
  displayTaxTotals: z
    .enum(["AS_A_SINGLE_ITEM", "ITEMIZED"])
    .optional()
    .nullable(),
  roundTaxAtSubtotalLevel: z.boolean().optional().nullable(),
});
