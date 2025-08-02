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

  // Check if product table exists and delete entries
  const productExists = await entityManager.query(`
      SELECT to_regclass('public.product') IS NOT NULL AS exists
    `);

  if (productExists?.[0]?.exists) {
    // set the tax class of all products to null
    await entityManager
      .createQueryBuilder()
      .update("product")
      .set({ product_tax_class: null })
      .where("product_tax_class = :taxClassId", { taxClassId })
      .execute();
  }

  // Check if product_variation table exists and delete entries
  const productVariationExists = await entityManager.query(`

      SELECT to_regclass('public.product_variation') IS NOT NULL AS exists
    `);

  if (productVariationExists?.[0]?.exists) {
    // set the tax class of all product variations to null
    await entityManager
      .createQueryBuilder()
      .update("product_variation")
      .set({ product_variation_tax_class: null })
      .where("product_variation_tax_class = :taxClassId", { taxClassId })
      .execute();
  }

  await taxClassRepository.delete({ id: taxClassId });
};
