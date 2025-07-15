import { ProductAttribute } from "../../../entities";
import { MutationCreateProductAttributeArgs } from "../../../types";
import { productAttributeRepository } from "../repositories/repositories";

/**
 * Creates a new product attribute and its associated values.
 *
 * Workflow:
 * 1. Creates a new ProductAttribute entity with name, slug, systemAttribute.
 * 2. If provided, creates associated ProductAttributeValue entities.
 * 3. Returns the full attribute with values.
 *
 * @param data - The data for the new attribute and its values.
 * @returns A promise resolving to the newly created ProductAttribute.
 */
export const createAttributeWithValues = async (
  userId: string,
  data: MutationCreateProductAttributeArgs
): Promise<ProductAttribute> => {
  const { name, slug, systemAttribute, values } = data ?? {};

  // Step 1: Create the attribute
  const newAttribute = productAttributeRepository.create({
    name,
    slug,
    systemAttribute,
    values,
    createdBy: userId,
  });

  return await productAttributeRepository.save(newAttribute);
};
