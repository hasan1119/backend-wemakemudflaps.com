import { TaxClass } from "../../../entities";
import { MutationUpdateTaxClassArgs } from "../../../types";
import { taxClassRepository } from "../repositories/repositories";
import { getTaxClassById } from "./get-tax-class.service";

/**
 * Directly updates a tax class with the given fields and returns the updated entity.
 *
 * @param taxClassId - The UUID of the taxClass to update.
 * @param data - Partial data to update (e.g., value, description).
 * @returns A promise resolving to the updated tax class entity.
 */
export const updateTaxClass = async (
  taxClassId: string,
  data: Partial<MutationUpdateTaxClassArgs>
): Promise<TaxClass> => {
  await taxClassRepository.update(taxClassId, {
    ...(data.value !== undefined &&
      data.value !== null && { value: data.value }),
    ...(data.description !== undefined &&
      data.description !== null && { description: data.description }),
  });

  return await getTaxClassById(taxClassId);
};
