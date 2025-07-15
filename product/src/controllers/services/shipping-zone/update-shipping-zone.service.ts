import { ShippingZone } from "../../../entities";
import { MutationUpdateShippingZoneArgs } from "../../../types";
import { shippingZoneRepository } from "../repositories/repositories";
import { getShippingZoneById } from "./get-shipping-zone.service";

/**
 * Updates an existing shipping zone with the provided data.
 *
 * Workflow:
 * 1. Uses the shippingZoneRepository to create a new ShippingZone entity.
 * 2. Saves the updated shipping zone to the database.
 * 3. Returns the updated ShippingZone entity.
 *
 * @param id - The UUID of the shipping zone to update.
 * @param data - The data for the shipping zone to update.
 * @param existingZone - The existing ShippingZone entity to update.
 * @returns A promise resolving to the updated ShippingZone entity.
 */
export const updateShippingZone = async (
  id: string,
  data: MutationUpdateShippingZoneArgs,
  existingZone: ShippingZone
): Promise<ShippingZone> => {
  let mergedShippingMethods = existingZone.shippingMethods || [];

  if (data.shippingMethodIds !== undefined && data.shippingMethodIds !== null) {
    const existingIds = new Set(mergedShippingMethods.map((m) => m.id));
    for (const methodId of data.shippingMethodIds) {
      if (!existingIds.has(methodId)) {
        mergedShippingMethods.push({ id: methodId } as any);
      }
    }
  }

  await shippingZoneRepository.update(id, {
    ...(data.name !== undefined && data.name !== null && { name: data.name }),
    ...(data.regions !== undefined &&
      data.regions !== null && { regions: data.regions }),
    ...(data.zipCodes !== undefined &&
      data.zipCodes !== null && { zipCodes: data.zipCodes }),
    ...(data.shippingMethodIds !== undefined &&
      data.shippingMethodIds !== null && {
        shippingMethods: mergedShippingMethods,
      }),
  });

  return getShippingZoneById(id);
};
