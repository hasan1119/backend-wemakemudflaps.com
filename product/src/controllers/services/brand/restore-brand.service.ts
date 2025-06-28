import { In } from "typeorm";
import { Tag } from "../../../entities";
import { tagRepository } from "../repositories/repositories";
import { getBrandsByIds } from "./get-brand.service";

/**
 * Restores one or more soft-deleted brands by clearing their deletedAt timestamps.
 *
 * @param ids - Array of tag UUIDs to restore.
 * @returns Array of restored Tag entities.
 */
export const restoreTag = async (ids: string[]): Promise<Tag[]> => {
  if (!ids.length) return [];

  await tagRepository.update({ id: In(ids) }, { deletedAt: null });

  const restoredBrands = await getBrandsByIds(ids);

  return restoredBrands;
};
