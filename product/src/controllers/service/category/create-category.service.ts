import { Category } from "../../../entities/category.entity";
import { SubCategory } from "../../../entities/sub-category.entity";
import {
  categoryRepository,
  subCategoryRepository,
} from "../repositories/repositories";

/**
 * Handles creation of Category or SubCategory based on input.
 *
 * Workflow:
 * 1. If `parentSubCategoryId` is provided, create SubCategory under that parent.
 * 2. If no `parentSubCategoryId` but `categoryId` is provided, create top-level SubCategory under that category.
 * 3. If neither `parentSubCategoryId` nor `categoryId` is provided, create a top-level Category.
 * 4. For ordering, finds max position in the relevant scope and adds new item at position max+1.
 *
 * @param data - Partial data for Category or SubCategory creation.
 * @param userId - Optional user ID who creates this.
 * @param options - Optional context: categoryId and parentSubCategoryId.
 * @returns Created Category or SubCategory entity.
 */
export const createCategoryOrSubCategory = async (
  data: Partial<Category> & Partial<SubCategory>,
  userId?: string,
  options?: { categoryId?: string; parentSubCategoryId?: string }
): Promise<Category | SubCategory> => {
  const { categoryId, parentSubCategoryId } = options ?? {};

  if (parentSubCategoryId) {
    // Create nested SubCategory
    const maxPositionResult = await subCategoryRepository
      .createQueryBuilder("sub")
      .select("MAX(sub.position)", "max")
      .where('"parentSubCategoryId" = :parentSubCategoryId', {
        parentSubCategoryId,
      })
      .getRawOne<{ max: number }>();

    const maxPosition = maxPositionResult?.max ?? 0;

    const subCategory = subCategoryRepository.create({
      name: data.name,
      description: data.description ?? null,
      thumbnail: data.thumbnail ?? null,
      createdBy: userId ?? null,
      category: { id: categoryId } as any,
      parentSubCategory: { id: parentSubCategoryId } as any,
      position: maxPosition + 1,
    });

    return await subCategoryRepository.save(subCategory);
  } else if (categoryId) {
    // Create top-level SubCategory under Category
    const maxPositionResult = await subCategoryRepository
      .createQueryBuilder("sub")
      .select("MAX(sub.position)", "max")
      .where('"categoryId" = :categoryId AND "parentSubCategoryId" IS NULL', {
        categoryId,
      })
      .getRawOne<{ max: number }>();

    const maxPosition = maxPositionResult?.max ?? 0;

    const subCategory = subCategoryRepository.create({
      name: data.name,
      description: data.description ?? null,
      thumbnail: data.thumbnail ?? null,
      createdBy: userId ?? null,
      category: { id: categoryId } as any,
      parentSubCategory: null,
      position: maxPosition + 1,
    });

    return await subCategoryRepository.save(subCategory);
  } else {
    // Create top-level Category
    const maxPositionResult = await categoryRepository
      .createQueryBuilder("category")
      .select("MAX(category.position)", "max")
      .getRawOne<{ max: number }>();

    const maxPosition = maxPositionResult?.max ?? 0;

    const category = categoryRepository.create({
      name: data.name,
      description: data.description ?? null,
      thumbnail: data.thumbnail ?? null,
      createdBy: userId ?? null,
      position: maxPosition + 1,
    });

    return await categoryRepository.save(category);
  }
};
