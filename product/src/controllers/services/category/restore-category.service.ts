import { In, Not } from "typeorm";
import {
  categoryRepository,
  subCategoryRepository,
} from "../repositories/repositories";

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
  type: "category" | "subcategory"
): Promise<void> {
  const repository =
    type === "category" ? categoryRepository : subCategoryRepository;

  // Find soft-deleted entities matching the given ids
  const entitiesToRestore = await repository.find({
    where: {
      id: In(ids),
      deletedAt: Not(null),
    },
    select: ["id"],
  });

  if (entitiesToRestore.length === 0) {
    throw new Error(
      `No soft-deleted ${type}(s) found with the provided IDs to restore.`
    );
  }

  const entityIds = entitiesToRestore.map((entity) => entity.id);

  await repository.update({ id: In(entityIds) }, { deletedAt: null });
}
