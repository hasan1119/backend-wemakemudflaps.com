import { ShippingMethod } from "../../../entities";
import { MutationCreateShippingMethodArgs } from "../../../types";
import { shippingMethodRepository } from "../repositories/repositories";

/**
 * Creates a new shipping method with the provided data.
 *
 * Workflow:
 * 1. Cleans up nested method objects by removing their `id`, including nested `costs`.
 * 2. Uses the shippingMethodRepository to create a new ShippingMethod entity.
 * 3. Saves the new shipping method to the database.
 * 4. Returns the created ShippingMethod entity.
 *
 * @param data - The data for the shipping method to create.
 * @param userId - Optional user ID to associate with the creation.
 */
export const createShippingMethod = async (
  data: MutationCreateShippingMethodArgs,
  userId?: string
): Promise<ShippingMethod> => {
  const removeId = <T extends object>(obj?: T | null): T | null => {
    if (!obj) return null;
    const { id, ...rest } = obj as any;
    return rest as T;
  };

  const flatRate = data.flatRate
    ? {
        ...removeId(data.flatRate),
        costs:
          data.flatRate.costs?.map(({ id, shippingClassId, ...rest }) => ({
            ...rest,
            shippingClass: { id: shippingClassId } as any,
          })) || [],
        createdBy: userId,
      }
    : null;

  const freeShipping = data.freeShipping
    ? {
        ...removeId(data.freeShipping),
        createdBy: userId,
      }
    : null;

  const localPickUp = data.localPickUp
    ? {
        ...removeId(data.localPickUp),
        createdBy: userId,
      }
    : null;

  const ups = data.ups
    ? {
        ...removeId(data.ups),
        createdBy: userId,
      }
    : null;

  const shippingMethod = shippingMethodRepository.create({
    title: data.title,
    shippingZone: { id: data.shippingZoneId },
    status: data.status ?? true,
    description: data.description ?? null,
    flatRate,
    freeShipping,
    localPickUp,
    ups,
    createdBy: userId,
  });

  return await shippingMethodRepository.save(shippingMethod);
};
