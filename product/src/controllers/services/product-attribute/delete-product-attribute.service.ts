import { productAttributeRepository } from "../repositories/repositories";

/**
 * Permanently deletes a Product Attribute from the database.
 *
 * @param attributeId - The UUID of the attribute to hard delete.
 */
export const hardDeleteAttribute = async (
  attributeId: string
): Promise<void> => {
  await productAttributeRepository.delete({
    id: attributeId,
    systemAttribute: true,
  });
};
