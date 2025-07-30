import { AppDataSource } from "../../../helper";
import { productAttributeRepository } from "../repositories/repositories";

/**
 * Permanently deletes a Product Attribute from the database.
 *
 * @param attributeId - The UUID of the attribute to hard delete.
 */
export const hardDeleteAttribute = async (
  attributeId: string
): Promise<void> => {
  const entityManager = AppDataSource.manager;

  // First delete any related entries from the product_variation_attribute_values junction table
  await entityManager
    .createQueryBuilder()
    .delete()
    .from("product_variation_attribute_values")
    .where('"attributeId" = :id', { id: attributeId })
    .execute();

  // Secondly, delete any related entries from the product_attributes junction table
  await entityManager
    .createQueryBuilder()
    .delete()
    .from("product_attributes")
    .where('"attributeId" = :id', { id: attributeId })
    .execute();

  await productAttributeRepository.delete({ id: attributeId });
};
