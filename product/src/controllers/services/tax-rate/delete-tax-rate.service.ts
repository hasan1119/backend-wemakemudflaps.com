import { TaxRate } from "../../../entities";
import { taxRateRepository } from "../repositories/repositories";
import { getTaxRateById } from "./get-tax-rate.service";

/**
 * Soft deletes a tax rate by setting its deletedAt timestamp.
 *
 * @param taxRateId - The UUID of the tax rate to soft delete.
 * @returns The soft-deleted Tax rate entity.
 */
export const softDeleteTaxRate = async (
  taxRateId: string
): Promise<TaxRate> => {
  await taxRateRepository.update({ id: taxRateId }, { deletedAt: new Date() });
  const softDeletedTaxRate = await getTaxRateById(undefined, taxRateId);
  return softDeletedTaxRate;
};

/**
 * Permanently deletes a tax rate from the database.
 *
 * @param taxRateId - The UUID of the tax rate to hard delete.
 */
export const hardDeleteTaxRate = async (taxRateId: string): Promise<void> => {
  await taxRateRepository.delete({ id: taxRateId });
};
