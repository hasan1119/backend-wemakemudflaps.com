import { TaxOptions } from "../../../entities";
import { MutationUpdateTaxOptionsArgs } from "../../../types";
import { taxOptionsRepository } from "../repositories/repositories";
import { getTaxOptions } from "./get-tax-options.service";

/**
 * Updates the existing TaxOptions with the provided data.
 *
 * Workflow:
 * 1. Updates the tax options with provided values.
 *
 * @param taxOptions - The existing TaxOptions entity to update.
 * @param data - Input data for updating the tax options.
 * @return Updated TaxOptions entity.
 */
export const updateTaxOptions = async (
  taxOptions: TaxOptions,
  data: MutationUpdateTaxOptionsArgs
) => {
  await taxOptionsRepository.update(taxOptions.id, {
    ...(data.calculateTaxBasedOn !== undefined &&
      data.calculateTaxBasedOn !== null && {
        calculateTaxBasedOn: data.calculateTaxBasedOn,
      }),
    ...(data.displayPricesInShop !== undefined &&
      data.displayPricesInShop !== null && {
        displayPricesInShop: data.displayPricesInShop,
      }),
    ...(data.displayPricesDuringCartAndCheckout !== undefined &&
      data.displayPricesDuringCartAndCheckout !== null && {
        displayPricesDuringCartAndCheckout:
          data.displayPricesDuringCartAndCheckout,
      }),
    ...(data.displayTaxTotals !== undefined &&
      data.displayTaxTotals !== null && {
        displayTaxTotals: data.displayTaxTotals,
      }),
    ...(data.priceDisplaySuffix !== undefined &&
      data.priceDisplaySuffix !== null && {
        priceDisplaySuffix: data.priceDisplaySuffix,
      }),
    ...(data.pricesEnteredWithTax !== undefined &&
      data.pricesEnteredWithTax !== null && {
        pricesEnteredWithTax: data.pricesEnteredWithTax,
      }),
    ...(data.roundTaxAtSubtotalLevel !== undefined &&
      data.roundTaxAtSubtotalLevel !== null && {
        roundTaxAtSubtotalLevel: data.roundTaxAtSubtotalLevel,
      }),
    ...(data.shippingTaxClassId !== undefined &&
      data.shippingTaxClassId !== null && {
        shippingTaxClass: { id: data.shippingTaxClassId },
      }),
  } as any);

  return await getTaxOptions();
};
