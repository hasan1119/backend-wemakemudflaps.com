import { ShippingMethod } from "../../../entities";
import { shippingMethodRepository } from "../repositories/repositories";

/**
 * Soft deletes a shipping method by setting its deletedAt timestamp.
 *
 * @param shippingMethodId - The UUID of the shipping method to soft delete.
 * @returns The soft-deleted ShippingMethod entity.
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
 * @param shippingMethodId - The UUID of the shipping method to hard delete.
 */
export const hardDeleteShippingMethod = async (
  shippingMethodId: string
): Promise<void> => {
  await shippingMethodRepository.delete({ id: shippingMethodId });
};
