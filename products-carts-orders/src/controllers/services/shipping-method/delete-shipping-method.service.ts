import { ShippingMethod } from "../../../entities";
import {
  flatRateRepository,
  freeShippingRepository,
  localPickUpRepository,
  shippingMethodRepository,
  upsRepository,
} from "../repositories/repositories";

/**
 * Permanently deletes a shipping method from the database.
 *
 * Workflow:
 * 1. Uses the shippingMethodRepository to delete the shipping method by its ID.
 * 2. Returns a promise that resolves when the deletion is complete.
 *
 * @param shippingMethodId - The UUID of the shipping method to delete.
 * @returns A promise that resolves when the deletion is complete.
 */
export const deleteShippingMethod = async (
  shippingMethod: ShippingMethod
): Promise<void> => {
  if (shippingMethod?.flatRate?.id) {
    await flatRateRepository.delete({ id: shippingMethod.flatRate.id });
  }
  if (shippingMethod?.freeShipping?.id) {
    await freeShippingRepository.delete({ id: shippingMethod.freeShipping.id });
  }
  if (shippingMethod?.localPickUp?.id) {
    await localPickUpRepository.delete({ id: shippingMethod.localPickUp.id });
  }
  if (shippingMethod?.ups?.id) {
    await upsRepository.delete({ id: shippingMethod.ups.id });
  }
  await shippingMethodRepository.delete({ id: shippingMethod.id });
};
