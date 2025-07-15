import { ProductAttribute } from "../../../entities";
import { productAttributeRepository } from "../repositories/repositories";
import { getAttributesById } from "./get-product-attribute.service";

/**
 * Updates a product attribute with the given fields and returns the updated entity.
 *
 * @param attributeId - The UUID of the product attribute to update.
 * @param data - Partial data to update (e.g., name, slug, systemAttribute).
 * @returns A promise resolving to the updated ProductAttribute entity.
 */
export const updateAttribute = async (
  attributeId: string,
  data: Partial<MutationUpdateAttributeArgs>
): Promise<ProductAttribute> => {
  await productAttributeRepository.update(attributeId, {
    ...(data.name !== undefined && data.name !== null && { name: data.name }),
    ...(data.slug !== undefined && data.slug !== null && { slug: data.slug }),
    ...(data.systemAttribute !== undefined &&
      data.systemAttribute !== null && {
        systemAttribute: data.systemAttribute,
      }),
  });

  return await getAttributesById(attributeId);
};
