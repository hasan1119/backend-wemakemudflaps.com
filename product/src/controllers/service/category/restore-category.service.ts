import { Not } from "typeorm";
import {
  categoryRepository,
  subCategoryRepository,
} from "../repositories/repositories";

/**
 * Restores a soft-deleted Category or SubCategory by clearing the deletedAt timestamp,
 * automatically detecting entity type by ID.
 *
 * Workflow:
 * 1. Try to find soft-deleted entity in Category repository.
 * 2. If not found, try in SubCategory repository.
 * 3. If found, clear deletedAt to restore.
 * 4. If not found or not soft-deleted, throw error.
 *
 * @param id - UUID of the entity to restore.
 */
export async function restoreCategoryOrSubCategoryById(
  id: string
): Promise<void> {
  // Try find in Category soft deleted
  let item = await categoryRepository.findOne({
    where: { id, deletedAt: Not(null) },
  });
  let type: "category" | "subcategory" | null = null;

  if (item) {
    type = "category";
  } else {
    // Try find in SubCategory soft deleted
    item = await subCategoryRepository.findOne({
      where: { id, deletedAt: Not(null) },
    });
    if (item) {
      type = "subcategory";
    }
  }

  // Throw error if not found or not soft-deleted
  if (!item || !type) {
    throw new Error(`Entity with id ${id} not found or not soft-deleted`);
  }

  // Step 4: Clear deletedAt to restore
  if (type === "category") {
    await categoryRepository.update(id, { deletedAt: null });
  } else {
    await subCategoryRepository.update(id, { deletedAt: null });
  }
}
