import { ProductAttribute } from "../../../entities";
import { MutationCreateProductAttributeArgs } from "../../../types";
import { productAttributeRepository } from "../repositories/repositories";

/**
 * Creates a new system product attribute and its associated values.
 *
 * Workflow:
 * 1. Creates a new product attribute entity with name, slug, systemAttribute set to true.
 * 2. If provided, creates associated ProductAttributeValue entities.
 * 3. Returns the full attribute with values.
 *
 * @param data - The data for the new attribute and its values.
 * @returns A promise resolving to the newly created ProductAttribute.
 */
export const createSystemAttributeWithValues = async (
  userId: string,
  data: MutationCreateProductAttributeArgs
): Promise<ProductAttribute> => {
  const { name, slug, values } = data ?? {};

  // Step 1: Create the attribute
  const newAttribute = productAttributeRepository.create({
    name,
    slug,
    systemAttribute: true,
    values,
    createdBy: userId,
  });

  return await productAttributeRepository.save(newAttribute);
};

/**
 * Creates a new custom product attribute and its associated values.
 *
 * Workflow:
 * 1. Creates a new product attribute entity with name, slug, systemAttribute set to false.
 * 2. If provided, creates associated ProductAttributeValue entities.
 * 3. Returns the full attribute with values.
 *
 * @param userId - The ID of the user creating the attribute.
 * @param data - The data for the new attribute and its values.
 * @returns A promise resolving to the newly created ProductAttribute.
 */
export const createAttributeWithValues = async (
  userId: string,
  data: MutationCreateProductAttributeArgs
): Promise<ProductAttribute> => {
  const { name, slug, values } = data ?? {};

  // Step 1: Create the attribute
  const newAttribute = productAttributeRepository.create({
    name,
    slug,
    systemAttribute: false,
    values,
    createdBy: userId,
  });

  return await productAttributeRepository.save(newAttribute);
};
