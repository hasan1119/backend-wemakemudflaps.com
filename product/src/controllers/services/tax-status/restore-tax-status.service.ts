import { In } from "typeorm";
import { TaxStatus } from "../../../entities";
import { taxStatusRepository } from "../repositories/repositories";
import { getTaxStatusByIds } from "./get-tax-status.service";

/**
 * Restores one or more soft-deleted tax statuses by clearing their deletedAt timestamps.
 *
 * @param ids - Array of tax status UUIDs to restore.
 * @returns Array of restored tax status entities.
 */
export const restoreTaxStatus = async (ids: string[]): Promise<TaxStatus[]> => {
  if (!ids.length) return [];

  await taxStatusRepository.update({ id: In(ids) }, { deletedAt: null });

  const restoredTaxStatuses = await getTaxStatusByIds(ids);

  return restoredTaxStatuses;
};
