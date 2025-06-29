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

// import { In, Not } from "typeorm";
// import { Category, SubCategory } from "../../../entities";
// import {
//   categoryRepository,
//   subCategoryRepository,
// } from "../repositories/repositories";

// /**
//  * Restores soft-deleted Categories or SubCategories by their IDs.
//  *
//  * Workflow:
//  * 1. Checks if the entities with the given IDs exist and are soft-deleted.
//  * 2. Updates their `deletedAt` field to null to restore them.
//  * 3. Returns the restored entities.
//  * 4. Throws an error if no matching soft-deleted entities are found.
//  *
//  * @param ids - Array of UUIDs of entities to restore.
//  * @param type - Either "category" or "subcategory".
//  * @returns Array of restored entities.
//  * @throws Error if no matching soft-deleted entities found.
//  */
// export async function restoreCategoryOrSubCategoryById(
//   ids: string[],
//   type: "category" | "subcategory"
// ): Promise<(Category | SubCategory)[]> {
//   const repository =
//     type === "category" ? categoryRepository : subCategoryRepository;

//   // Step 1: Find soft-deleted entities matching the given IDs
//   const softDeletedEntities = await repository.find({
//     where: {
//       id: In(ids),
//       deletedAt: Not(null),
//     },
//     select: ["id"],
//   });

//   if (softDeletedEntities.length === 0) {
//     throw new Error("No soft-deleted entities found to restore.");
//   }

//   const entityIds = softDeletedEntities.map((entity) => entity.id);

//   // Step 2: Restore by updating deletedAt to null
//   await repository.update({ id: In(entityIds) }, { deletedAt: null });

//   // Step 3: Refetch and return the full restored entities
//   return await repository.find({
//     where: {
//       id: In(entityIds),
//     },
//     relations:
//       type === "subcategory"
//         ? ["category", "parentSubCategory", "subCategories", "products"]
//         : ["products"],
//   });
// }
