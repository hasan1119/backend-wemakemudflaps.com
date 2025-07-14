import { ShippingMethod } from "../../../entities";
import { MutationCreateShippingMethodArgs } from "../../../types";
import { shippingMethodRepository } from "../repositories/repositories";

/**
 * Creates a new shipping class with the provided data.
 *
 * @param data - The data for the new shipping class.
 * @param userId - Optional user ID to associate with the creation.
 * @returns A promise resolving to the created ShippingClass entity.
 */
export const createShippingMethod = async (
  data: MutationCreateShippingMethodArgs,
  userId?: string
): Promise<ShippingMethod> => {
  const shippingMethod = shippingMethodRepository.create({
    ...data,
    createdBy: userId,
  });

  await shippingMethodRepository.save(shippingMethod);

  return shippingMethod;
};
