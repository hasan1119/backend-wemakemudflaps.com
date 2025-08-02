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

  // Ensure the product table exists
  const productTableExists = await entityManager.query(`
    SELECT to_regclass('public.product') IS NOT NULL AS exists
  `);

  if (productTableExists?.[0]?.exists) {
    // Nullify the shippingClass field in Product before deleting the shipping class
    await entityManager
      .createQueryBuilder()
      .update("product")
      .set({ product_shipping_class: null })
      .where("product_shipping_class = :shippingClassId", { shippingClassId })
      .execute();
  }

  // Ensure the product_variation table exists
  const productVariationTableExists = await entityManager.query(`
    SELECT to_regclass('public.product_variation') IS NOT NULL AS exists
  `);

  if (productVariationTableExists?.[0]?.exists) {
    // Nullify the shippingClass field in ProductVariation before deleting the shipping class
    await entityManager
      .createQueryBuilder()
      .update("product_variation")
      .set({ product_variation_shipping_class: null })
      .where("product_variation_shipping_class = :shippingClassId", {
        shippingClassId,
      })
      .execute();
  }

  await shippingClassRepository.delete({ id: shippingClassId });
};
