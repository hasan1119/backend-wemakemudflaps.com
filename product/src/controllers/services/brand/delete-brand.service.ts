import { Brand } from "../../../entities";
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
  await brandRepository.delete({ id: brandId });
};
