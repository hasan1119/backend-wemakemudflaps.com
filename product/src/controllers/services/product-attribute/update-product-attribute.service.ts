import { ProductAttribute } from "../../../entities";
import { MutationUpdateProductAttributeArgs } from "../../../types";
import { productAttributeValueRepository } from "../repositories/repositories";
import { getProductAttributeById } from "./get-product-attribute.service";
/**
 * Updates a product attribute and replaces all its values.
 *
 * Workflow:
 * 1. Updates the attribute's main fields (name, slug, systemAttribute, forVariation, visible).
 * 2. Soft deletes existing attribute values.
 * 3. Creates new values.
 * 4. Returns the updated attribute with fresh values.
 *
 * @param data - Object containing fields to update and new values.
 * @param currentProductAttribute - The existing ProductAttribute entity to update.
 * @returns A promise resolving to the updated ProductAttribute.
 */
export const updateAttributeWithValues = async (
  data: MutationUpdateProductAttributeArgs,
  currentProductAttribute: ProductAttribute
): Promise<ProductAttribute> => {
  const { values, forVariation, name, slug, visible } = data;

  // Step 1: Update attribute fields
  if (name !== undefined && name !== null) currentProductAttribute.name = name;
  if (slug !== undefined && slug !== null) currentProductAttribute.slug = slug;
  if (forVariation !== undefined && forVariation !== null)
    currentProductAttribute.forVariation = forVariation;
  if (visible !== undefined && visible !== null)
    currentProductAttribute.visible = visible;

  // Step 2: Hard delete existing values
  await productAttributeValueRepository.delete({
    attribute: { id: currentProductAttribute.id },
  });

  if (values && values.length > 0) {
    const newValues = values.map((val) =>
      productAttributeValueRepository.create({
        value: val,
        attribute: { id: currentProductAttribute.id } as any,
      })
    );
    await productAttributeValueRepository.save(newValues);
  }

  // Step 3: Save updated attribute
  await productAttributeValueRepository.save(currentProductAttribute);

  // Step 4: Return updated attribute
  return await getProductAttributeById(currentProductAttribute.id);
};
