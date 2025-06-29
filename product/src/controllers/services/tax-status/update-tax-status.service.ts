import { TaxStatus } from "../../../entities";
import { MutationUpdateTaxStatusArgs } from "../../../types";
import { taxStatusRepository } from "../repositories/repositories";
import { getTaxStatusById } from "./get-tax-status.service";

/**
 * Directly updates a tax status with the given fields and returns the updated entity.
 *
 * @param taxStatusId - The UUID of the taxStatus to update.
 * @param data - Partial data to update (e.g., value, description).
 * @returns A promise resolving to the updated tax status entity.
 */
export const updateTaxStatus = async (
  taxStatusId: string,
  data: Partial<MutationUpdateTaxStatusArgs>
): Promise<TaxStatus> => {
  await taxStatusRepository.update(taxStatusId, {
    ...(data.value !== undefined &&
      data.value !== null && { value: data.value }),
    ...(data.description !== undefined &&
      data.description !== null && { description: data.description }),
  });

  return await getTaxStatusById(taxStatusId);
};
