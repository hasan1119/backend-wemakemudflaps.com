import { Brand } from "../../../entities";
import { AppDataSource } from "../../../helper";
import { brandRepository } from "../repositories/repositories";
import { getBrandById } from "./get-brand.service";

/**
 * Soft deletes a brand by setting its deletedAt timestamp.
 *
 * @param brandId - The UUID of the brand to soft delete.
 * @returns The soft-deleted Brand entity.
 */
export const softDeleteBrand = async (brandId: string): Promise<Brand> => {
  await brandRepository.update({ id: brandId }, { deletedAt: new Date() });
  const softDeletedBrand = await getBrandById(brandId);
  return softDeletedBrand;
};

/**
 * Permanently deletes a brand from the database.
 *
 * @param brandId - The UUID of the brand to hard delete.
 */
export const hardDeleteBrand = async (brandId: string): Promise<void> => {
  const entityManager = AppDataSource.manager;

  // Check if product_variation_brands table exists and delete entries
  const variationBrandExists = await entityManager.query(`
    SELECT to_regclass('public.product_variation_brands') IS NOT NULL AS exists
  `);
  if (variationBrandExists?.[0]?.exists) {
    await entityManager
      .createQueryBuilder()
      .delete()
      .from("product_variation_brands")
      .where('"brandId" = :id', { id: brandId })
      .execute();
  }

  // Check if product_brands table exists and delete entries
  const productBrandExists = await entityManager.query(`

    SELECT to_regclass('public.product_brands') IS NOT NULL AS exists
  `);
  if (productBrandExists?.[0]?.exists) {
    await entityManager
      .createQueryBuilder()
      .delete()
      .from("product_brands")
      .where('"brandId" = :id', { id: brandId })
      .execute();
  }

  await brandRepository.delete({ id: brandId });
};
