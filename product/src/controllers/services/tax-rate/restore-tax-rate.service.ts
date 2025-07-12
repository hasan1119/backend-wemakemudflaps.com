import { In } from "typeorm";
import { TaxRate } from "../../../entities";
import { taxRateRepository } from "../repositories/repositories";
import { getTaxRateByIds } from "./get-tax-rate.service";

/**
 * Restores one or more soft-deleted tax rates by clearing their deletedAt timestamps.
 *
 * @param ids - Array of tax rate UUIDs to restore.
 * @returns Array of restored tax rate entities.
 */
export const restoreTaxRate = async (ids: string[]): Promise<TaxRate[]> => {
  if (!ids.length) return [];

  await taxRateRepository.update({ id: In(ids) }, { deletedAt: null });

  const restoredTaxRates = await getTaxRateByIds(ids);

  return restoredTaxRates;
};
