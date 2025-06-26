import {
  categoryRepository,
  subCategoryRepository,
} from "../repositories/repositories";

/**
 * Restores a soft-deleted Category or SubCategory by ID and type.
 *
 * Workflow:
 * 1. Based on the provided type, attempt to find the soft-deleted entity by ID.
 * 2. If not found or not soft-deleted, throw an error.
 * 3. If found, update the deletedAt field to null to restore.
 *
 * @param id - UUID of the entity to restore.
 * @param type - Either "category" or "subcategory".
 * @throws Error if entity not found or not soft-deleted.
 */
export async function restoreCategoryOrSubCategoryById(
  id: string,
  type: "category" | "subcategory"
): Promise<void> {
  if (type === "category") {
    await categoryRepository.update(id, { deletedAt: null });
  } else {
    await subCategoryRepository.update(id, { deletedAt: null });
  }
}
