import { In, Not } from "typeorm";
import { Category, SubCategory } from "../../../entities";
import {
  categoryRepository,
  subCategoryRepository,
} from "../repositories/repositories";
import { getCategoryByIds, getSubCategoryByIds } from "./get-category.service";

/**
 * Restores soft-deleted Categories or SubCategories by their IDs.
 *
 * Workflow:
 * 1. Checks if the entities with the given IDs exist and are soft-deleted.
 * 2. Updates their `deletedAt` field to null to restore them.
 * 3. Throws an error if none found to restore.
 *
 * @param ids - Array of UUIDs of entities to restore.
 * @param type - Either "category" or "subcategory".
 * @throws Error if no matching soft-deleted entities found.
 */
export async function restoreCategoryOrSubCategoryById(
  ids: string[],
  type: "category" | "subCategory"
): Promise<Category[] | SubCategory[]> {
  const repository =
    type === "category" ? categoryRepository : subCategoryRepository;

  const entitiesToRestore = await repository.find({
    where: {
      id: In(ids),
      deletedAt: Not(null),
    },
  });

  if (entitiesToRestore.length === 0) {
    throw new Error(
      `No soft-deleted ${type}(s) found with the provided IDs to restore.`
    );
  }

  const entityIds = entitiesToRestore.map((entity) => entity.id);

  await repository.update({ id: In(entityIds) }, { deletedAt: null });

  return type === "category"
    ? await getCategoryByIds(ids)
    : await getSubCategoryByIds(ids);
}
