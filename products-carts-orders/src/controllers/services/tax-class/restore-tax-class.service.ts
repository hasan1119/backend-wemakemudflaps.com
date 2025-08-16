import { In } from "typeorm";
import { TaxClass } from "../../../entities";
import { taxClassRepository } from "../repositories/repositories";
import { getTaxClassByIds } from "./get-tax-class.service";

/**
 * Restores one or more soft-deleted tax classes by clearing their deletedAt timestamps.
 *
 * @param ids - Array of tax class UUIDs to restore.
 * @returns Array of restored tax class entities.
 */
export const restoreTaxClass = async (ids: string[]): Promise<TaxClass[]> => {
  if (!ids.length) return [];

  await taxClassRepository.update({ id: In(ids) }, { deletedAt: null });

  const restoredTaxClasses = await getTaxClassByIds(ids);

  return restoredTaxClasses;
};
