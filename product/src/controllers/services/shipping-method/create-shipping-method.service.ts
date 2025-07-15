import { ShippingMethod } from "../../../entities";
import { MutationCreateShippingMethodArgs } from "../../../types";
import { shippingMethodRepository } from "../repositories/repositories";

/**
 * Creates a new shipping class with the provided data.
 *
 * Workflow:
 * 1. Uses the shippingMethodRepository to create a new ShippingMethod entity.
 * 2. Saves the new shipping method to the database.
 * 3. Returns the created ShippingMethod entity.
 *
 * @param data - The data for the shipping method to create.
 * @param userId - Optional user ID to associate with the creation.
 */
export const createShippingMethod = async (
  data: MutationCreateShippingMethodArgs,
  userId?: string
): Promise<ShippingMethod> => {
  const shippingMethod = shippingMethodRepository.create({
    title: data.title,
    shippingZone: { id: data.shippingZoneId },
    status: data.status ?? true,
    description: data.description ?? null,
    flatRate: data.flatRate ?? null,
    freeShipping: data.freeShipping ?? null,
    localPickUp: data.localPickUp ?? null,
    ups: data.ups ?? null,
    createdBy: userId,
  });

  await shippingMethodRepository.save(shippingMethod);

  return shippingMethod;
};
