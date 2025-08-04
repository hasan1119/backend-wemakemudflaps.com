import { ProductAttribute } from "../../../entities";
import { AppDataSource } from "../../../helper";
import { productAttributeRepository } from "../repositories/repositories";

/**
 * Permanently deletes a Product Attribute from the database.
 *
 * @param currentProductAttribute - The ProductAttribute entity to hard delete.
 * @param attributeId - The UUID of the attribute to hard delete.
 * @return Promise<void>
 */
export const hardDeleteAttribute = async (
  currentProductAttribute: ProductAttribute,
  attributeId: string
): Promise<void> => {
  const entityManager = AppDataSource.manager;

  // Current attribute values ids
  const idsToDelete = currentProductAttribute.values.map((value) => value.id);

  // Check if product_variation_attribute_values table exists and delete entries
  const variationAttributeValuesExists = await entityManager.query(`
        SELECT to_regclass('public.product_variation_attribute_values') IS NOT NULL AS exists
      `);

  if (variationAttributeValuesExists?.[0]?.exists) {
    if (currentProductAttribute.id) {
      await entityManager
        .createQueryBuilder()
        .delete()
        .from("product_variation_attribute_values")
        .where('"productAttributeValueId" IN (:...ids)', {
          ids: idsToDelete,
        })
        .execute();
    }
  }

  await productAttributeRepository.delete({
    id: attributeId,
  });
};
