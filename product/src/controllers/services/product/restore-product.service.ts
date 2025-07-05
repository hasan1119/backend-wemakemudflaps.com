import { In } from "typeorm";
import { Product } from "../../../entities";
import { productRepository } from "../repositories/repositories";
import { getProductsByIds } from "./get-product.service";

/**
 * Restores one or more soft-deleted products by clearing their deletedAt timestamps.
 *
 * @param ids - Array of product UUIDs to restore.
 * @returns Array of restored Product entities.
 */
export const restoreProduct = async (ids: string[]): Promise<Product[]> => {
  if (!ids.length) return [];

  await productRepository.update({ id: In(ids) }, { deletedAt: null });

  const restoredProducts = await getProductsByIds(ids);

  return restoredProducts;
};
