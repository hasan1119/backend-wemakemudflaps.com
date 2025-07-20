import { ShippingZone } from "../../../entities";
import { MutationUpdateShippingZoneArgs } from "../../../types";
import { shippingZoneRepository } from "../repositories/repositories";
import { getShippingZoneById } from "./get-shipping-zone.service";

/**
 * Updates an existing shipping zone with the provided data.
 *
 * Workflow:
 * 1. Directly replaces existing values with new ones (no merging).
 * 2. Saves the updated shipping zone to the database.
 * 3. Returns the updated ShippingZone entity.
 *
 * @param id - The UUID of the shipping zone to update.
 * @param data - The data for the shipping zone to update.
 * @returns A promise resolving to the updated ShippingZone entity.
 */
export const updateShippingZone = async (
  id: string,
  data: MutationUpdateShippingZoneArgs
): Promise<ShippingZone> => {
  await shippingZoneRepository.update(id, {
    ...(data.name !== undefined && data.name !== null && { name: data.name }),
    ...(data.regions !== undefined &&
      data.regions !== null && { regions: data.regions }),
    ...(data.zipCodes !== undefined &&
      data.zipCodes !== null && { zipCodes: data.zipCodes }),
  });

  return getShippingZoneById(id);
};
