import { Brand } from "../../../entities";
import { MutationUpdateBrandArgs } from "../../../types";
import { brandRepository } from "../repositories/repositories";
import { getBrandById } from "./get-brand.service";

/**
 * Directly updates a brand with the given fields and returns the updated entity.
 *
 * @param brandId - The UUID of the brand to update.
 * @param data - Partial data to update (e.g., name, slug).
 * @returns A promise resolving to the updated Brand entity.
 */
export const updateBrand = async (
  brandId: string,
  data: Partial<MutationUpdateBrandArgs>
): Promise<Brand> => {
  await brandRepository.update(brandId, {
    ...(data.name !== undefined && data.name !== null && { name: data.name }),
    ...(data.slug !== undefined && data.slug !== null && { slug: data.slug }),
    ...(data.thumbnail !== undefined &&
      data.thumbnail !== null && { thumbnail: data.thumbnail }),
  });

  return await getBrandById(brandId);
};
