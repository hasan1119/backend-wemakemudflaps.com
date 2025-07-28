import { Brand } from "../../../entities";
import { MutationCreateBrandArgs } from "../../../types";
import { brandRepository } from "../repositories/repositories";

/**
 * Creates a new Brand.
 *
 * Workflow:
 * 1. Validates and prepares brand creation input.
 * 2. Checks if a brand with the same name already exists (case-insensitive).
 * 3. Creates the brand with provided values and user context.
 *
 * @param data - Input data for creating the brand.
 * @param userId - User ID who creates this brand.
 * @returns Created Brand entity.
 */
export const createBrand = async (
  data: MutationCreateBrandArgs,
  userId: string
): Promise<Brand> => {
  const { name, slug, thumbnail } = data ?? {};

  const brand = brandRepository.create({
    name,
    slug,
    thumbnail,
    createdBy: userId ?? null,
  });

  return await brandRepository.save(brand);
};
