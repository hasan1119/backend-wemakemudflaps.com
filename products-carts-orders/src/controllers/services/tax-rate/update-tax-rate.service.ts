import { TaxRate } from "../../../entities";
import { MutationUpdateTaxRateArgs } from "../../../types";
import { taxRateRepository } from "../repositories/repositories";
import { getTaxRateById } from "./get-tax-rate.service";

/**
 * Directly updates a tax rate with the given fields and returns the updated entity.
 *
 * @param taxRateId - The UUID of the taxRate to update.
 * @param data - Partial data to update (e.g., country, state, city, postcode, rate, label, appliesToShipping, isCompound, priority).
 * @returns A promise resolving to the updated tax rate entity.
 */
export const updateTaxRate = async (
  taxRateId: string,
  data: Partial<MutationUpdateTaxRateArgs>
): Promise<TaxRate> => {
  // Update the taxRate
  await taxRateRepository.update(taxRateId, {
    ...(data.country !== undefined &&
      data.country !== null && {
        country: data.country,
      }),
    ...(data.state !== undefined &&
      data.state !== null && { state: data.state }),
    ...(data.city !== undefined && data.city !== null && { city: data.city }),
    ...(data.postcode !== undefined &&
      data.postcode !== null && { postcode: data.postcode }),
    ...(data.rate !== undefined && data.rate !== null && { rate: data.rate }),
    ...(data.label !== undefined &&
      data.label !== null && { label: data.label }),
    ...(data.appliesToShipping !== undefined &&
      data.appliesToShipping !== null && {
        appliesToShipping: data.appliesToShipping,
      }),
    ...(data.isCompound !== undefined &&
      data.isCompound !== null && { isCompound: data.isCompound }),
    ...(data.priority !== undefined &&
      data.priority !== null && { priority: data.priority }),
  });

  // return updated entity
  return await getTaxRateById(taxRateId);
};
