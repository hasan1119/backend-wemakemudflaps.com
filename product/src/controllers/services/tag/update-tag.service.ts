import { Tag } from "../../../entities";
import { tagRepository } from "../repositories/repositories";
import { getTagById } from "./get-tag.service";

/**
 * Directly updates a tag with the given fields and returns the updated entity.
 *
 * @param tagId - The UUID of the tag to update.
 * @param data - Partial data to update (e.g., name, slug).
 * @returns A promise resolving to the updated Tag entity.
 */
export const updateTag = async (
  tagId: string,
  data: Partial<Tag>
): Promise<Tag> => {
  await tagRepository.update(tagId, data);
  return await getTagById(tagId);
};
