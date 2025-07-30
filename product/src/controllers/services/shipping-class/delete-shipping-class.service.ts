import { ShippingClass } from "../../../entities";
import { AppDataSource } from "../../../helper";
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
  const entityManager = AppDataSource.manager;

  // Check if product_variation_shipping_class table exists and delete entries
  const variationShippingClassExists = await entityManager.query(`
    SELECT to_regclass('public.product_variation_shipping_class') IS NOT NULL AS exists
  `);
  if (variationShippingClassExists?.[0]?.exists) {
    // First delete any related entries from the product_variation_shipping_class junction table
    await entityManager
      .createQueryBuilder()
      .delete()
      .from("product_variation_shipping_class")
      .where('"shippingClassId" = :id', { id: shippingClassId })
      .execute();
  }

  // Check if product_shipping_class table exists and delete entries
  const productShippingClassExists = await entityManager.query(`
    SELECT to_regclass('public.product_shipping_class') IS NOT NULL AS exists
  `);
  if (productShippingClassExists?.[0]?.exists) {
    // First delete any related entries from the product_shipping_class junction table
    await entityManager
      .createQueryBuilder()
      .delete()
      .from("product_shipping_class")
      .where('"shippingClassId" = :id', { id: shippingClassId })
      .execute();
  }

  await shippingClassRepository.delete({ id: shippingClassId });
};
