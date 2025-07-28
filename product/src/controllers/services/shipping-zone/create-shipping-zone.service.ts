import { ShippingZone } from "../../../entities";
import { MutationCreateShippingZoneArgs } from "../../../types";
import { shippingZoneRepository } from "../repositories/repositories";

/**
 * Creates a new shipping zone with the provided data.
 *
 * Workflow:
 * 1. Uses the shippingZoneRepository to create a new ShippingZone entity.
 * 2. Saves the new shipping zone to the database.
 * 3. Returns the created ShippingZone entity.
 *
 * @param data - The data for the shipping zone to create.
 * @param userId - User ID to associate with the creation.
 * @returns A promise resolving to the created ShippingZone entity.
 */
export const createShippingZone = async (
  data: MutationCreateShippingZoneArgs,
  userId: string
): Promise<ShippingZone> => {
  const shippingZone = shippingZoneRepository.create({
    ...data,
    createdBy: userId,
  });

  await shippingZoneRepository.save(shippingZone);

  return shippingZone;
};
