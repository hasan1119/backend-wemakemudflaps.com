import { ShippingClass } from "../../../entities";
import { shippingClassRepository } from "../repositories/repositories";
import { getShippingClassById } from "./get-shipping-class.service";

/**
 * Soft deletes a shipping class by setting its deletedAt timestamp.
 *
 * @param shippingClassId - The UUID of the shipping class to soft delete.
 * @returns The soft-deleted Shipping class entity.
 */
export const softDeleteShippingClass = async (
  shippingClassId: string
): Promise<ShippingClass> => {
  await shippingClassRepository.update(
    { id: shippingClassId },
    { deletedAt: new Date() }
  );
  const softDeletedShippingClass = await getShippingClassById(shippingClassId);
  return softDeletedShippingClass;
};

/**
 * Permanently deletes a shipping class from the database.
 *
 * @param shippingClassId - The UUID of the shipping class to hard delete.
 */
export const hardDeleteShippingClass = async (
  shippingClassId: string
): Promise<void> => {
  await shippingClassRepository.delete({ id: shippingClassId });
};
