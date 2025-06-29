import { TaxStatus } from "../../../entities";
import { taxStatusRepository } from "../repositories/repositories";
import { getTaxStatusById } from "./get-tax-status.service";

/**
 * Soft deletes a tax status by setting its deletedAt timestamp.
 *
 * @param taxStatusId - The UUID of the tax status to soft delete.
 * @returns The soft-deleted Tax status entity.
 */
export const softDeleteTaxStatus = async (
  taxStatusId: string
): Promise<TaxStatus> => {
  await taxStatusRepository.update(
    { id: taxStatusId },
    { deletedAt: new Date() }
  );
  const softDeletedTaxStatus = await getTaxStatusById(taxStatusId);
  return softDeletedTaxStatus;
};

/**
 * Permanently deletes a tax status from the database.
 *
 * @param taxStatusId - The UUID of the tax status to hard delete.
 */
export const hardDeleteTaxStatus = async (
  taxStatusId: string
): Promise<void> => {
  await taxStatusRepository.delete({ id: taxStatusId });
};
