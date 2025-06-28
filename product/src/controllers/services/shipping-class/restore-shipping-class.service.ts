import { In } from "typeorm";
import { ShippingClass } from "../../../entities";
import { shippingClassRepository } from "../repositories/repositories";
import { getShippingClassesByIds } from "./get-shipping-class.service";

/**
 * Restores one or more soft-deleted shipping classes by clearing their deletedAt timestamps.
 *
 * @param ids - Array of shipping class UUIDs to restore.
 * @returns Array of restored shipping class entities.
 */
export const restoreShippingClass = async (
  ids: string[]
): Promise<ShippingClass[]> => {
  if (!ids.length) return [];

  await shippingClassRepository.update({ id: In(ids) }, { deletedAt: null });

  const restoredShippingClasses = await getShippingClassesByIds(ids);

  return restoredShippingClasses;
};
