import { In } from "typeorm";
import { ShippingMethod } from "../../../entities";
import { shippingMethodRepository } from "../repositories/repositories";

/**
 * Restores one or more soft-deleted shipping methods by clearing their deletedAt timestamps.
 *
 * @param ids - Array of shipping method UUIDs to restore.
 * @returns Array of restored shipping method entities.
 */
export const restoreShippingMethod = async (
  ids: string[]
): Promise<ShippingMethod[]> => {
  if (!ids.length) return [];

  await shippingMethodRepository.update({ id: In(ids) }, { deletedAt: null });

  return await shippingMethodRepository.find({ where: { id: In(ids) } });
};
