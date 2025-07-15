import { shippingMethodRepository } from "../repositories/repositories";

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
  shippingMethodId: string
): Promise<void> => {
  await shippingMethodRepository.delete({ id: shippingMethodId });
};
