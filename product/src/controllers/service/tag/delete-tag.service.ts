import { In } from "typeorm";
import { Tag } from "../../../entities";
import { tagRepository } from "../repositories/repositories";

/**
 * Soft deletes multiple tags by setting their deletedAt timestamp.
 *
 * @param ids - Array of tag UUIDs to soft delete.
 * @returns An array of soft-deleted Tag entities.
 */
export const softDeleteTags = async (ids: string[]): Promise<Tag[]> => {
  const now = new Date();

  // Update deletedAt for all tags matching the IDs
  await tagRepository.update({ id: In(ids) }, { deletedAt: now });

  // Fetch and return updated tags
  const softDeletedTags = await tagRepository.findBy({ id: In(ids) });
  return softDeletedTags;
};

/**
 * Permanently deletes multiple tags from the database.
 *
 * @param ids - Array of tag UUIDs to hard delete.
 */
export const hardDeleteTags = async (ids: string[]): Promise<void> => {
  await tagRepository.delete({ id: In(ids) });
};
