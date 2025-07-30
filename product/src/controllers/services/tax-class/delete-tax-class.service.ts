import { TaxClass } from "../../../entities";
import { AppDataSource } from "../../../helper";
import { taxClassRepository } from "../repositories/repositories";
import { getTaxClassById } from "./get-tax-class.service";

/**
 * Soft deletes a tax class by setting its deletedAt timestamp.
 *
 * @param taxClassId - The UUID of the tax class to soft delete.
 * @returns The soft-deleted Tax class entity.
 */
export const softDeleteTaxClass = async (
  taxClassId: string
): Promise<TaxClass> => {
  await taxClassRepository.update(
    { id: taxClassId },
    { deletedAt: new Date() }
  );
  const softDeletedTaxClass = await getTaxClassById(taxClassId);
  return softDeletedTaxClass;
};

/**
 * Permanently deletes a tax class from the database.
 *
 * @param taxClassId - The UUID of the tax class to hard delete.
 */
export const hardDeleteTaxClass = async (taxClassId: string): Promise<void> => {
  const entityManager = AppDataSource.manager;

  // Delete from product_tax_class junction table
  await entityManager
    .createQueryBuilder()
    .delete()
    .from("product_tax_class")
    .where('"taxClassId" = :id', { id: taxClassId })
    .execute();

  // Delete from product_variation_tax_class junction table
  await entityManager
    .createQueryBuilder()
    .delete()
    .from("product_variation_tax_class")
    .where('"taxClassId" = :id', { id: taxClassId })
    .execute();

  await taxClassRepository.delete({ id: taxClassId });
};
