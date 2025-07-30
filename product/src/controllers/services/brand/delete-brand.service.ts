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

  // Delete from product_variation_brands junction table
  await entityManager
    .createQueryBuilder()
    .delete()
    .from("product_variation_brands")
    .where('"brandId" = :id', { id: brandId })
    .execute();

  // Delete from product_brands junction table if that still exists
  await entityManager
    .createQueryBuilder()
    .delete()
    .from("product_brands")
    .where('"brandId" = :id', { id: brandId })
    .execute();

  await brandRepository.delete({ id: brandId });
};
