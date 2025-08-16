import { In } from "typeorm";
import { Category } from "../../../entities";
import { categoryRepository } from "../repositories/repositories";
import { getCategoryByIds } from "./get-category.service";

/**
 * Restores soft-deleted Categories by their IDs.
 *
 * Workflow:
 * 1. Finds Categories by IDs that are soft-deleted (deletedAt NOT NULL).
 * 2. Updates their deletedAt field to null to restore them.
 * 3. Throws an error if none found to restore.
 *
 * @param ids - Array of UUIDs of categories to restore.
 * @returns Restored Category entities.
 *
 * @throws Error if no matching soft-deleted categories found.
 */
export async function restoreCategoriesByIds(
  ids: string[]
): Promise<Category[]> {
  const categoryIds = ids.filter((id) => id);

  // Restore categories by setting deletedAt to null
  await categoryRepository.update({ id: In(categoryIds) }, { deletedAt: null });

  // Return restored categories with full data
  return getCategoryByIds(categoryIds);
}
