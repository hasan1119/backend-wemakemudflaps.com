import { Category, SubCategory } from "../../../entities";
import { MutationUpdateCategoryArgs } from "../../../types";
import {
  categoryRepository,
  subCategoryRepository,
} from "../repositories/repositories";
import { getCategoryById, getSubCategoryById } from "./get-category.service";

interface UpdatePositionOptions {
  categoryId?: string;
  parentSubCategoryId?: string;
}

/**
 * Handles updating the position/order of a Category or SubCategory within its respective list.
 *
 * Workflow:
 * 1. Fetches the current item to get its current position.
 * 2. Validates the new position is within allowed bounds.
 * 3. If moving the item to an earlier position (e.g., 10 → 2):
 *    - Increment positions of items between newPosition and currentPosition - 1 by 1.
 * 4. If moving the item to a later position (e.g., 2 → 5):
 *    - Decrement positions of items between currentPosition + 1 and newPosition by 1.
 * 5. Updates the target item's position to the newPosition.
 * 6. All database updates run inside a transaction for consistency.
 *
 * Notes on Scope:
 * - For Categories, position is global among all categories.
 * - For SubCategories, position is scoped under either a Category (top-level) or a parent SubCategory (nested).
 *
 * @param id - The UUID of the Category or SubCategory to update.
 * @param newPosition - The desired new position (1-based index).
 * @param type - The type of the item: "category" or "subcategory".
 * @param options - Optional context for SubCategory scope:
 *                  - categoryId for top-level SubCategories,
 *                  - parentSubCategoryId for nested SubCategories.
 * @returns Promise<void | string> - Resolves after successful update.
 *
 * @throws Error if:
 *  - Item with the given id is not found.
 *  - newPosition is out of valid range.
 *  - Required scope parameters for SubCategory are missing.
 */
export const updatePosition = async (
  id: string,
  newPosition: number,
  type: "category" | "subCategory",
  options?: UpdatePositionOptions
): Promise<void | string> => {
  // Use the transaction from repository's manager
  const repository =
    type === "category" ? categoryRepository : subCategoryRepository;

  await repository.manager.transaction(async (manager) => {
    // Use transactional entity manager to get fresh repository instance
    const repo = manager.getRepository(
      type === "category" ? Category : SubCategory
    );

    // Fetch current item with position
    const item = await repo.findOne({
      where: { id },
      select: ["id", "position"],
    });

    const currentPosition = item.position;
    if (currentPosition === newPosition) return; // no update needed

    if (type === "category") {
      // Validate newPosition within category list range
      const maxPosResult = await repo
        .createQueryBuilder("cat")
        .select("MAX(cat.position)", "max")
        .getRawOne<{ max: number }>();
      const maxPosition = maxPosResult?.max ?? 0;

      if (newPosition < 1 || newPosition > maxPosition) {
        throw new Error(
          `New position: ${newPosition} is out of range 1-${maxPosition}`
        );
      }

      if (newPosition < currentPosition) {
        // Increment positions between newPosition and currentPosition - 1
        await repo
          .createQueryBuilder()
          .update()
          .set({ position: () => `"position" + 1` })
          .where(
            `"position" >= :newPosition AND "position" < :currentPosition`,
            { newPosition, currentPosition }
          )
          .execute();
      } else {
        // Decrement positions between currentPosition + 1 and newPosition
        await repo
          .createQueryBuilder()
          .update()
          .set({ position: () => `"position" - 1` })
          .where(
            `"position" <= :newPosition AND "position" > :currentPosition`,
            { newPosition, currentPosition }
          )
          .execute();
      }

      // Update the moved category's position
      await repo.update(id, { position: newPosition });
    } else {
      // SubCategory logic with scope check
      const { categoryId, parentSubCategoryId } = options ?? {};
      if (!categoryId && !parentSubCategoryId) {
        throw new Error(
          "categoryId or parentSubCategoryId must be provided for subcategory position update"
        );
      }

      // Find max position in scoped subcategories
      let maxPosQuery = repo
        .createQueryBuilder("sub")
        .select("MAX(sub.position)", "max");
      if (parentSubCategoryId) {
        maxPosQuery = maxPosQuery.where(
          '"parentSubCategoryId" = :parentSubCategoryId',
          { parentSubCategoryId }
        );
      } else {
        maxPosQuery = maxPosQuery.where(
          '"categoryId" = :categoryId AND "parentSubCategoryId" IS NULL',
          { categoryId }
        );
      }
      const maxPosResult = await maxPosQuery.getRawOne<{ max: number }>();
      const maxPosition = maxPosResult?.max ?? 0;

      if (newPosition < 1 || newPosition > maxPosition) {
        throw new Error(
          `newPosition ${newPosition} is out of range 1-${maxPosition}`
        );
      }

      if (newPosition < currentPosition) {
        // Increment positions in range [newPosition, currentPosition - 1]
        await repo
          .createQueryBuilder()
          .update()
          .set({ position: () => `"position" + 1` })
          .where(
            `"position" >= :newPosition AND "position" < :currentPosition`,
            { newPosition, currentPosition }
          )
          .andWhere(
            parentSubCategoryId
              ? `"parentSubCategoryId" = :parentSubCategoryId`
              : `"categoryId" = :categoryId AND "parentSubCategoryId" IS NULL`,
            parentSubCategoryId ? { parentSubCategoryId } : { categoryId }
          )
          .execute();
      } else {
        // Decrement positions in range [currentPosition + 1, newPosition]
        await repo
          .createQueryBuilder()
          .update()
          .set({ position: () => `"position" - 1` })
          .where(
            `"position" <= :newPosition AND "position" > :currentPosition`,
            { newPosition, currentPosition }
          )
          .andWhere(
            parentSubCategoryId
              ? `"parentSubCategoryId" = :parentSubCategoryId`
              : `"categoryId" = :categoryId AND "parentSubCategoryId" IS NULL`,
            parentSubCategoryId ? { parentSubCategoryId } : { categoryId }
          )
          .execute();
      }

      // Update the moved subcategory's position
      await repo.update(id, { position: newPosition });
    }
  });
};

/**
 * Updates Category or SubCategory fields: name, description, thumbnail.
 *
 * Workflow:
 * 1. Detects entity type by `type` parameter ("category" or "subcategory").
 * 2. Updates fields if provided in `data`.
 * 3. Saves updated entity to database.
 *
 * @param id - UUID of the entity to update.
 * @param data - Partial update data (name, description, thumbnail).
 * @param type - "category" or "subcategory" to detect entity and repo.
 * @returns Updated Category or SubCategory entity.
 *
 * @throws Error if entity not found.
 */
export async function updateCategoryOrSubCategory(
  id: string,
  data: MutationUpdateCategoryArgs,
  type: "category" | "subCategory"
): Promise<Category | SubCategory> {
  const repository = (
    type === "category" ? categoryRepository : subCategoryRepository
  ) as import("typeorm").Repository<Category | SubCategory>;

  // Step 2.5: Directly update the entity in the database
  await repository.update(id, {
    ...(data.name !== undefined && { name: data.name }),
    ...(data.slug !== undefined && { slug: data.slug }),
    ...(data.description !== undefined && { description: data.description }),
    ...(data.thumbnail !== undefined && { thumbnail: data.thumbnail }),
  });

  return type === "category" ? getCategoryById(id) : getSubCategoryById(id);
}
