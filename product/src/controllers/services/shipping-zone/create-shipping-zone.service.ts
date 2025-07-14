import { ShippingZone } from "../../../entities";
import { MutationCreateShippingZoneArgs } from "../../../types";
import { shippingZoneRepository } from "../repositories/repositories";

/**
 * Creates a new shipping zone with the provided data.
 *
 * @param data - The data for the new shipping zone.
 * @param userId - Optional user ID to associate with the creation.
 * @returns A promise resolving to the created ShippingZone entity.
 */
export const createShippingZone = async (
  data: MutationCreateShippingZoneArgs,
  userId?: string
): Promise<ShippingZone> => {
  const shippingZone = shippingZoneRepository.create({
    ...data,
    createdBy: userId,
  });

  await shippingZoneRepository.save(shippingZone);

  return shippingZone;
};
