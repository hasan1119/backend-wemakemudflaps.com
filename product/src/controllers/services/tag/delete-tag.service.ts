import { Tag } from "../../../entities";
import { tagRepository } from "../repositories/repositories";
import { getTagById } from "./get-tag.service";

/**
 * Soft deletes a tag by setting its deletedAt timestamp.
 *
 * @param tagId - The UUID of the tag to soft delete.
 * @returns The soft-deleted Tag entity.
 */
export const softDeleteTag = async (tagId: string): Promise<Tag> => {
  await tagRepository.update({ id: tagId }, { deletedAt: new Date() });
  const softDeletedTag = await getTagById(tagId);
  return softDeletedTag;
};

/**
 * Permanently deletes a tag from the database.
 *
 * @param tagId - The UUID of the tag to hard delete.
 */
export const hardDeleteTag = async (tagId: string): Promise<void> => {
  await tagRepository.delete({ id: tagId });
};
