import { Tag } from "../../../entities";
import { AppDataSource } from "../../../helper";
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
  const entityManager = AppDataSource.manager;

  // Check if product_variation_tags table exists and delete entries
  const variationTagExists = await entityManager.query(`
    SELECT to_regclass('public.product_variation_tags') IS NOT NULL AS exists
  `);
  if (variationTagExists?.[0]?.exists) {
    // First delete any related entries from the product_variation_tags junction table
    await entityManager
      .createQueryBuilder()
      .delete()
      .from("product_variation_tags")
      .where('"tagId" = :id', { id: tagId })
      .execute();
  }

  await tagRepository.delete({ id: tagId });
};
