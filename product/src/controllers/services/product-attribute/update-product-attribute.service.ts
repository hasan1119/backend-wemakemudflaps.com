import { ProductAttribute } from "../../../entities";
import { MutationUpdateProductAttributeArgs } from "../../../types";
import {
  productAttributeRepository,
  productAttributeValueRepository,
} from "../repositories/repositories";
import { getProductAttributeById } from "./get-product-attribute.service";
/**
 * Updates a product attribute and replaces all its values.
 *
 * Workflow:
 * 1. Updates the attribute's main fields (name, slug, systemAttribute).
 * 2. Soft deletes existing attribute values.
 * 3. Creates new values.
 * 4. Returns the updated attribute with fresh values.
 *
 * @param attributeId - UUID of the attribute to update.
 * @param data - Object containing fields to update and new values.
 * @returns A promise resolving to the updated ProductAttribute.
 */
export const updateAttributeWithValues = async (
  attributeId: string,
  data: MutationUpdateProductAttributeArgs
): Promise<ProductAttribute> => {
  // Step 1: Update attribute fields
  await productAttributeRepository.update(attributeId, {
    ...(data.name !== undefined && { name: data.name }),
    ...(data.slug !== undefined && { slug: data.slug }),
  });

  // Step 2: Soft delete existing values
  await productAttributeValueRepository.update(
    { attribute: { id: attributeId } },
    { deletedAt: new Date() }
  );

  // Step 3: Insert new values
  if (data.values && data.values.length > 0) {
    const newValues = data.values.map((val) =>
      productAttributeValueRepository.create({
        value: val.value,
        attribute: Promise.resolve({ id: attributeId } as ProductAttribute),
      })
    );
    await productAttributeValueRepository.save(newValues);
  }

  // Step 4: Return updated attribute
  return await getProductAttributeById(attributeId);
};
