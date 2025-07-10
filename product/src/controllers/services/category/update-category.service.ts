import { Category } from "../../../entities";
import { MutationUpdateCategoryArgs } from "../../../types";
import { categoryRepository } from "../repositories/repositories";
import { getCategoryById } from "./get-category.service";

interface UpdatePositionOptions {
  parentCategoryId?: string | null;
}

/**
 * Handles updating the position/order of a Category within its respective sibling list.
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
 * - Position is scoped among sibling categories sharing the same `parentCategoryId`.
 * - For root categories, `parentCategoryId` is null.
 *
 * @param id - The UUID of the Category to update.
 * @param newPosition - The desired new position (1-based index).
 * @param options - Optional context for position scope: parentCategoryId (null for root).
 * @returns Promise<void>
 *
 * @throws Error if:
 *  - Item with the given id is not found.
 *  - newPosition is out of valid range.
 */
export const updatePosition = async (
  id: string,
  newPosition: number,
  options?: UpdatePositionOptions
): Promise<void> => {
  await categoryRepository.manager.transaction(async (manager) => {
    const repo = manager.getRepository(Category);

    // Fetch current item with position and parentCategoryId if needed
    const item = await repo.findOne({
      where: { id },
      select: ["id", "position", "parentCategory"],
      relations: ["parentCategory"],
    });
    if (!item) throw new Error(`Category with id ${id} not found`);

    const currentPosition = item.position;
    const parentCategoryId =
      options?.parentCategoryId ?? item.parentCategory?.id ?? null;

    if (newPosition === currentPosition) return; // no update needed

    // Validate newPosition within sibling scope
    const maxPosResult = await repo
      .createQueryBuilder("category")
      .select("MAX(category.position)", "max")
      .where(
        parentCategoryId
          ? '"parentCategoryId" = :parentCategoryId'
          : '"parentCategoryId" IS NULL',
        { parentCategoryId }
      )
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
        .where(`"position" >= :newPosition AND "position" < :currentPosition`, {
          newPosition,
          currentPosition,
        })
        .andWhere(
          parentCategoryId
            ? `"parentCategoryId" = :parentCategoryId`
            : `"parentCategoryId" IS NULL`,
          parentCategoryId ? { parentCategoryId } : {}
        )
        .execute();
    } else {
      // Decrement positions between currentPosition + 1 and newPosition
      await repo
        .createQueryBuilder()
        .update()
        .set({ position: () => `"position" - 1` })
        .where(`"position" <= :newPosition AND "position" > :currentPosition`, {
          newPosition,
          currentPosition,
        })
        .andWhere(
          parentCategoryId
            ? `"parentCategoryId" = :parentCategoryId`
            : `"parentCategoryId" IS NULL`,
          parentCategoryId ? { parentCategoryId } : {}
        )
        .execute();
    }

    // Update the moved category's position
    await repo.update(id, { position: newPosition });
  });
};

/**
 * Updates Category fields: name, slug, description, thumbnail.
 *
 * Workflow:
 * 1. Updates fields if provided in `data`.
 * 2. Saves updated entity to database.
 *
 * @param id - UUID of the category to update.
 * @param data - Partial update data (name, slug, description, thumbnail).
 * @returns Updated Category entity.
 *
 * @throws Error if category not found.
 */
export async function updateCategory(
  id: string,
  data: MutationUpdateCategoryArgs
): Promise<Category> {
  // Update only provided fields
  await categoryRepository.update(id, {
    ...(data.name !== undefined && data.name !== null && { name: data.name }),
    ...(data.slug !== undefined && data.slug !== null && { slug: data.slug }),
    ...(data.description !== undefined &&
      data.description !== null && { description: data.description }),
    ...(data.thumbnail !== undefined &&
      data.thumbnail !== null && { thumbnail: data.thumbnail }),
  });

  // Return updated category with relations if needed
  return getCategoryById(id);
}
