import { In } from "typeorm";
import { Brand } from "../../../entities";
import { brandRepository } from "../repositories/repositories";
import { getBrandsByIds } from "./get-brand.service";

/**
 * Restores one or more soft-deleted brands by clearing their deletedAt timestamps.
 *
 * @param ids - Array of brand UUIDs to restore.
 * @returns Array of restored Brand entities.
 */
export const restoreBrand = async (ids: string[]): Promise<Brand[]> => {
  if (!ids.length) return [];

  await brandRepository.update({ id: In(ids) }, { deletedAt: null });

  const restoredBrands = await getBrandsByIds(ids);

  return restoredBrands;
};
