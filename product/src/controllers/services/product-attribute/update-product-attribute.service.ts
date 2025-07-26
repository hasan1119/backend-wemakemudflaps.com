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
 * 1. Updates the attribute's main fields (name, slug, forVariation, visible).
 * 2. Soft deletes existing attribute values.
 * 3. Creates new values linked to the updated attribute.
 * 4. Returns the updated attribute with fresh values.
 */
export const updateAttributeWithValues = async (
  data: MutationUpdateProductAttributeArgs,
  currentProductAttribute: ProductAttribute
): Promise<ProductAttribute> => {
  const { values, forVariation, name, slug, visible } = data;

  // Step 1: Update basic fields only if they are explicitly provided
  if (name !== undefined && name !== null) {
    currentProductAttribute.name = name;
  }
  if (slug !== undefined && slug !== null) {
    currentProductAttribute.slug = slug;
  }
  if (forVariation !== undefined && forVariation !== null) {
    currentProductAttribute.forVariation = forVariation;
  }
  if (visible !== undefined && visible !== null) {
    currentProductAttribute.visible = visible;
  }

  // Step 2: Save the updated attribute first
  await productAttributeRepository.save(currentProductAttribute);

  // Step 3: Hard delete existing values
  await productAttributeValueRepository.delete({
    attribute: currentProductAttribute,
  });

  // Step 4: Create and save new values if provided
  if (Array.isArray(values) && values.length > 0) {
    const newValues = values.map((v) =>
      productAttributeValueRepository.create({
        value: v,
        attribute: currentProductAttribute as any,
      })
    );

    await productAttributeValueRepository.save(newValues);
  }

  // Step 5: Return the fully updated attribute with fresh values
  return await getProductAttributeById(currentProductAttribute.id);
};
