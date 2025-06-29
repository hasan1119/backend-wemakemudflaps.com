import { Category, SubCategory } from "../../../entities";
import {
  categoryRepository,
  subCategoryRepository,
} from "../repositories/repositories";
import { getCategoryById, getSubCategoryById } from "./get-category.service";

/**
 * Checks if a category or subcategory can be deleted (i.e. no associated products).
 *
 * Workflow:
 * 1. For Category:
 *    - Query if there are any products linked via "products" relation.
 *    - If found, cannot delete.
 * 2. For SubCategory:
 *    - Load the subcategory with its "products" relation.
 *    - If products exist, cannot delete.
 *
 * @param id - UUID of the category or subcategory
 * @param type - "category" or "subcategory"
 * @returns boolean indicating deletability
 */
export async function canDeleteCategoryOrSubCategory(
  id: string,
  type: "category" | "subCategory"
): Promise<boolean> {
  const repository =
    type === "category" ? categoryRepository : subCategoryRepository;

  if (type === "category") {
    const count = await repository
      .createQueryBuilder("cat")
      .leftJoin("cat.products", "product")
      .where("cat.id = :id", { id })
      .andWhere("product.id IS NOT NULL")
      .getCount();

    return count === 0;
  } else {
    const subCategoryWithProducts = await repository.findOne({
      where: { id },
      relations: ["products"],
    });
    return subCategoryWithProducts?.products?.length === 0;
  }
}

/**
 * Soft deletes (skip to trash) a category or subcategory by setting deletedAt timestamp.
 *
 * Workflow:
 * 1. Set the deletedAt field of the entity to current timestamp.
 * 2. The entity remains in DB but considered soft-deleted.
 * 3. Position is NOT changed in soft delete.
 *
 * @param id - UUID of the category or subcategory
 * @param type - "category" or "subcategory"
 * @returns The soft-deleted Category or Sub Category entity.
 */
export async function softDeleteCategoryOrSubCategory(
  id: string,
  type: "category" | "subCategory"
): Promise<Category | SubCategory> {
  const repository =
    type === "category" ? categoryRepository : subCategoryRepository;
  const now = new Date();

  await repository.update(id, { deletedAt: now });

  const softDeletedCategory =
    type === "category" ? await getCategoryById(id) : getSubCategoryById(id);
  return softDeletedCategory;
}

/**
 * Hard deletes a category or subcategory and adjusts positions accordingly.
 *
 * Workflow:
 * 1. Fetch the entity and its current position.
 * 2. Check if deletion is allowed by verifying product associations.
 * 3. Delete the entity from the database.
 * 4. Decrement the position of all entities positioned after the deleted one to close the gap.
 * 5. For subcategories, position update is scoped by categoryId or parentSubCategoryId.
 *
 * @param id - UUID of the entity to delete.
 * @param type - "category" or "subcategory"
 * @param options - Required for subcategory to specify scope (categoryId or parentSubCategoryId).
 */
export async function hardDeleteCategoryOrSubCategory(
  id: string,
  type: "category" | "subCategory",
  options?: { categoryId?: string; parentSubCategoryId?: string }
): Promise<void> {
  const repository =
    type === "category" ? categoryRepository : subCategoryRepository;

  await repository.manager.transaction(async (manager) => {
    const repo = manager.getRepository(
      type === "category" ? Category : SubCategory
    );

    // Find entity with position
    const item = await repo.findOne({
      where: { id },
      select: ["id", "position"],
    });
    if (!item) throw new Error(`${type} with id ${id} not found`);

    // Check if allowed to delete (no product association)
    const canDelete = await canDeleteCategoryOrSubCategory(id, type);
    if (!canDelete)
      throw new Error(
        `Cannot delete ${type} because it is associated with one or more products.`
      );

    // Delete entity
    await repo.delete(id);

    // Update positions to fill gap
    if (type === "category") {
      await repo
        .createQueryBuilder()
        .update()
        .set({ position: () => `"position" - 1` })
        .where(`"position" > :deletedPosition`, {
          deletedPosition: item.position,
        })
        .execute();
    } else {
      const { categoryId, parentSubCategoryId } = options ?? {};
      if (!categoryId && !parentSubCategoryId) {
        throw new Error(
          "categoryId or parentSubCategoryId must be provided for subcategory delete"
        );
      }

      let qb = repo
        .createQueryBuilder()
        .update()
        .set({ position: () => `"position" - 1` })
        .where(`"position" > :deletedPosition`, {
          deletedPosition: item.position,
        });

      if (parentSubCategoryId) {
        qb = qb.andWhere(`"parentSubCategoryId" = :parentSubCategoryId`, {
          parentSubCategoryId,
        });
      } else {
        qb = qb.andWhere(
          `"categoryId" = :categoryId AND "parentSubCategoryId" IS NULL`,
          { categoryId }
        );
      }

      await qb.execute();
    }
  });
}
