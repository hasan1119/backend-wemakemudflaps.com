import { Category } from "../../../entities";
import { categoryRepository } from "../repositories/repositories";
import { getCategoryById } from "./get-category.service";

/**
 * Soft deletes (skip to trash) a category or subcategory by setting deletedAt timestamp.
 *
 * Workflow:
 * 1. Sets the deletedAt field of the entity to current timestamp.
 * 2. The entity remains in DB but is considered soft-deleted.
 * 3. Position is NOT changed in soft delete.
 *
 * @param id - UUID of the category or subcategory.
 * @returns The soft-deleted Category entity.
 */
export async function softDeleteCategory(id: string): Promise<Category> {
  const now = new Date();
  await categoryRepository.update(id, { deletedAt: now });
  return getCategoryById(id);
}

/**
 * Hard deletes a category or subcategory and adjusts positions accordingly.
 *
 * Workflow:
 * 1. Fetch the entity and its current position.
 * 2. Check if deletion is allowed by verifying product associations.
 * 3. Delete the entity from the database.
 * 4. Decrement the position of all entities positioned after the deleted one to close the gap.
 * 5. Position update is scoped under the same parent category (i.e., same parentCategoryId).
 *
 * @param id - UUID of the entity to delete.
 */
export async function hardDeleteCategory(id: string): Promise<void> {
  await categoryRepository.manager.transaction(async (manager) => {
    const repo = manager.getRepository(Category);

    // Find entity with position and parentCategoryId
    const item = await repo.findOne({
      where: { id },
      select: ["id", "position", "parentCategory"],
      relations: ["parentCategory"],
    });
    if (!item) throw new Error(`Category with id ${id} not found`);

    // Check if allowed to delete (no product association)
    const canDelete = await canDeleteCategory(id);
    if (!canDelete)
      throw new Error(
        `Cannot delete category because it is associated with one or more products.`
      );

    // Delete entity
    await repo.delete(id);

    // Determine scope for position update (siblings with same parentCategoryId)
    const parentCategoryId = item.parentCategory?.id ?? null;

    let qb = repo
      .createQueryBuilder()
      .update()
      .set({ position: () => `"position" - 1` })
      .where(`"position" > :deletedPosition`, {
        deletedPosition: item.position,
      });

    if (parentCategoryId) {
      qb = qb.andWhere(`"parentCategoryId" = :parentCategoryId`, {
        parentCategoryId,
      });
    } else {
      qb = qb.andWhere(`"parentCategoryId" IS NULL`);
    }

    await qb.execute();
  });
}
