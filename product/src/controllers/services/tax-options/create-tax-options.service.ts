import { MutationCreateTaxOptionsArgs } from "../../../types";
import { taxOptionsRepository } from "../repositories/repositories";
import { getTaxOptions } from "./get-tax-options.service";

/**
 * Creates a new TaxOptions.
 *
 * Workflow:
 * 1. Creates the tax options with provided values and user context.
 *
 * @param data - Input data for creating the tax options.
 * @param userId - User ID who creates this tax options.
 * @returns Created TaxOptions entity.
 */
export const createTaxOptions = async (
  userId: string,
  data: MutationCreateTaxOptionsArgs
) => {
  const newTaxOptions = taxOptionsRepository.create({
    calculateTaxBasedOn: data.calculateTaxBasedOn,
    displayPricesInShop: data.displayPricesInShop,
    displayPricesDuringCartAndCheckout: data.displayPricesDuringCartAndCheckout,
    displayTaxTotals: data.displayTaxTotals,
    priceDisplaySuffix: data.priceDisplaySuffix,
    pricesEnteredWithTax: data.pricesEnteredWithTax,
    roundTaxAtSubtotalLevel: data.roundTaxAtSubtotalLevel,
    shippingTaxClass: data.shippingTaxClassId
      ? { id: data.shippingTaxClassId }
      : null,
    createdBy: userId,
  });

  await taxOptionsRepository.save(newTaxOptions);

  return await getTaxOptions();
};
