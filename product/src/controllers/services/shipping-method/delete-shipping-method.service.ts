import { ShippingMethod } from "../../../entities";
import { shippingMethodRepository } from "../repositories/repositories";

/**
 * Soft deletes a shipping method by setting its deletedAt timestamp.
 *
 * Workflow:
 * 1. Updates the shipping method in the repository to set the deletedAt field to the
 * current date.
 * 2. Returns the updated ShippingMethod entity.
 *
 * @param shippingMethodId - The UUID of the shipping method to soft delete.
 * @returns A promise resolving to the updated ShippingMethod entity.
 */
export const softDeleteShippingMethod = async (
  shippingMethodId: string
): Promise<ShippingMethod> => {
  await shippingMethodRepository.update(
    { id: shippingMethodId },
    { deletedAt: new Date() }
  );
  return await shippingMethodRepository.findOneByOrFail({
    id: shippingMethodId,
  });
};

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
export const hardDeleteShippingMethod = async (
  shippingMethodId: string
): Promise<void> => {
  await shippingMethodRepository.delete({ id: shippingMethodId });
};
