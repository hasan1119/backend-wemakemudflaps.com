import { Category } from "../../../entities";
import { MutationCreateCategoryArgs } from "../../../types";
import { categoryRepository } from "../repositories/repositories";

/**
 * Creates a Category or SubCategory as a tree node under parentCategoryId if provided.
 *
 * Workflow:
 * 1. Determine if the new category has a parentCategoryId (making it a subcategory).
 * 2. Find the maximum position among siblings (categories with the same parent).
 * 3. Create new Category entity with position = maxPosition + 1.
 * 4. Save and return the created Category.
 *
 * @param data - Input data for category creation.
 * @param userId - Optional ID of the user creating this category.
 * @returns The created Category entity.
 */
export const createCategoryOrSubCategory = async (
  data: MutationCreateCategoryArgs,
  userId?: string
): Promise<Category> => {
  const { parentCategoryId, description, name, thumbnail, slug } = data ?? {};

  // Find max position among siblings under the same parentCategoryId (or top-level if null)
  const maxPositionResult = await categoryRepository
    .createQueryBuilder("category")
    .select("MAX(category.position)", "max")
    .where(
      parentCategoryId
        ? '"parentCategoryId" = :parentCategoryId'
        : '"parentCategoryId" IS NULL',
      { parentCategoryId }
    )
    .getRawOne<{ max: number }>();

  const maxPosition = maxPositionResult?.max ?? 0;

  // Create new Category entity
  const category = categoryRepository.create({
    name,
    slug,
    description: description ?? null,
    thumbnail: thumbnail ?? null,
    createdBy: userId ?? null,
    parentCategory: parentCategoryId ? ({ id: parentCategoryId } as any) : null,
    position: maxPosition + 1,
  });

  // Save and return
  return await categoryRepository.save(category);
};
