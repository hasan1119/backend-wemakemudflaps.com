import { Tag } from "../../../entities";
import { MutationCreateTagArgs } from "../../../types";
import { tagRepository } from "../repositories/repositories";

/**
 * Creates a new Tag.
 *
 * Workflow:
 * 1. Validates and prepares tag creation input.
 * 2. Checks if a tag with the same name already exists (case-insensitive).
 * 3. Creates the tag with provided values and user context.
 *
 * @param data - Input data for creating the tag.
 * @param userId - Optional user ID who creates this tag.
 * @returns Created Tag entity.
 */
export const createTag = async (
  data: MutationCreateTagArgs,
  userId?: string
): Promise<Tag> => {
  const { name, slug } = data ?? {};

  const tag = tagRepository.create({
    name,
    slug,
    createdBy: userId ?? null,
  });

  return await tagRepository.save(tag);
};
