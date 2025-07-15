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
  await taxRateRepository.update(taxRateId, {
    ...(data.country !== undefined && { country: data.country }),
    ...(data.state !== undefined && { state: data.state }),
    ...(data.city !== undefined && { city: data.city }),
    ...(data.postcode !== undefined && { postcode: data.postcode }),
    ...(data.rate !== undefined && { rate: data.rate }),
    ...(data.label !== undefined && { label: data.label }),
    ...(data.appliesToShipping !== undefined && {
      appliesToShipping: data.appliesToShipping,
    }),
    ...(data.isCompound !== undefined && { isCompound: data.isCompound }),
    ...(data.priority !== undefined && { priority: data.priority }),
  });

  return await getTaxRateById(taxRateId);
};
