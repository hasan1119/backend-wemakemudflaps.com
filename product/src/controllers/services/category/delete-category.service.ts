import { Category } from "../../../entities";
import { categoryRepository } from "../repositories/repositories";
import { getCategoryById } from "./get-category.service";

/**
 * Recursively soft deletes a category and all its subcategories and products.
 *
 * @param id - UUID of the category or subcategory.
 * @returns A promise that resolves when the category is soft-deleted.
 */
export async function softDeleteCategory(id: string): Promise<void> {
  const repo = categoryRepository;
  const now = new Date();

  // Recursively mark deletedAt for all children
  const recursivelySoftDelete = async (categoryId: string) => {
    const category = await getCategoryById(categoryId);
    if (!category) return;

    await repo.update(categoryId, { deletedAt: now });

    // Soft delete products: update deletedAt for products associated via join table
    await repo.manager
      .createQueryBuilder()
      .update("product")
      .set({ deletedAt: now })
      .where(
        `id IN (SELECT "productId" FROM "product_categories" WHERE "categoryId" = :id)`,
        { id: categoryId }
      )
      .execute();

    for (const sub of category.subCategories || []) {
      await recursivelySoftDelete(sub.id);
    }
  };

  await recursivelySoftDelete(id);

  return;
}

/**
 * Recursively hard deletes a category and all its subcategories and products.
 *
 * @param id - UUID of the category or subcategory.
 */
export async function hardDeleteCategory(id: string): Promise<void> {
  await categoryRepository.manager.transaction(async (manager) => {
    const repo = manager.getRepository(Category);
    const productRepo = manager.getRepository("product");

    // Recursive delete function
    const deleteRecursively = async (categoryId: string) => {
      const category = await repo.findOne({
        where: { id: categoryId },
        relations: ["subCategories"],
      });

      if (!category) return;

      // First delete subcategories recursively
      for (const sub of category.subCategories || []) {
        await deleteRecursively(sub.id);
      }

      // Remove product-category associations for this category
      await manager
        .createQueryBuilder()
        .delete()
        .from("product_categories")
        .where('"categoryId" = :id', { id: categoryId })
        .execute();

      // Delete this category
      await repo.delete(categoryId);

      // Adjust sibling positions
      const parentCategoryId = category.parentCategory?.id ?? null;
      let qb = repo
        .createQueryBuilder()
        .update()
        .set({ position: () => `"position" - 1` })
        .where(`"position" > :deletedPosition`, {
          deletedPosition: category.position,
        });

      if (parentCategoryId) {
        qb = qb.andWhere(`"parentCategoryId" = :parentCategoryId`, {
          parentCategoryId,
        });
      } else {
        qb = qb.andWhere(`"parentCategoryId" IS NULL`);
      }

      await qb.execute();
    };

    await deleteRecursively(id);
  });
}
