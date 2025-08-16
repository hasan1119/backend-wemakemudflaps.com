import { ShippingClass } from "../../../entities";
import { MutationUpdateShippingClassArgs } from "../../../types";
import { shippingClassRepository } from "../repositories/repositories";
import { getShippingClassById } from "./get-shipping-class.service";

/**
 * Directly updates a shipping class with the given fields and returns the updated entity.
 *
 * @param shippingClassId - The UUID of the shippingClass to update.
 * @param data - Partial data to update (e.g., value, description).
 * @returns A promise resolving to the updated shipping class entity.
 */
export const updateShippingClass = async (
  shippingClassId: string,
  data: Partial<MutationUpdateShippingClassArgs>
): Promise<ShippingClass> => {
  await shippingClassRepository.update(shippingClassId, {
    ...(data.value !== undefined &&
      data.value !== null && { value: data.value }),
    ...(data.description !== undefined &&
      data.description !== null && { description: data.description }),
  });

  return await getShippingClassById(shippingClassId);
};
