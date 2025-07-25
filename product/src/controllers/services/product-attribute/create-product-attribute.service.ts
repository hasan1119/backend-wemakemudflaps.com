import { ProductAttribute } from "../../../entities";
import { MutationCreateProductAttributeArgs } from "../../../types";
import {
  productAttributeRepository,
  productAttributeValueRepository,
} from "../repositories/repositories";
import { getProductAttributeById } from "./get-product-attribute.service";

/**
 * Creates a new system product attribute and its associated values.
 *
 * Workflow:
 * 1. Creates a new product attribute entity with name, slug, systemAttribute(true), forVariation, visible.
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

  // Step 1: Create and save the attribute
  const newAttribute = productAttributeRepository.create({
    name,
    slug,
    systemAttribute: true,
    createdBy: userId,
  });

  const savedAttribute = await productAttributeRepository.save(newAttribute);

  // Step 2: Create and save values if provided
  if (values?.length) {
    const valueEntities = values.map((val) =>
      productAttributeValueRepository.create({
        value: val,
        attribute: { id: savedAttribute.id } as any,
      })
    );

    await productAttributeValueRepository.save(valueEntities);
  }

  // Step 3: Return the full attribute with values loaded
  return getProductAttributeById(savedAttribute.id);
};

/**
 * Creates a new custom product attribute and its associated values.
 *
 * Workflow:
 * 1. Creates a new product attribute entity with name, slug, systemAttribute(false), forVariation, visible.
 * 2. If provided, creates associated ProductAttributeValue entities.
 * 3. Returns the full attribute with values.
 *
 * @param userId - The ID of the user creating the attribute.
 * @param data - The data for the new attribute and its values.
 * @returns A promise resolving to the newly created ProductAttribute.
 */
export const createAttributeWithValues = async (
  userId: string,
  data: MutationCreateProductAttributeArgs,
  existingCustomAttribute?: ProductAttribute | null
): Promise<ProductAttribute> => {
  const { name, slug, values, visible, forVariation } = data ?? {};

  // Step 1: Create the attribute
  const newAttribute = productAttributeRepository.create({
    name,
    slug,
    systemAttribute: false,
    values: values?.map((value) => ({ value })),
    systemAttributeRef: existingCustomAttribute
      ? existingCustomAttribute
      : null,
    visible: visible ?? true,
    forVariation: forVariation ?? false,
    createdBy: userId,
  });

  const savedAttribute = await productAttributeRepository.save(newAttribute);

  // Step 2: Create and save values if provided
  if (values?.length) {
    const valueEntities = values.map((val) =>
      productAttributeValueRepository.create({
        value: val,
        attribute: { id: savedAttribute.id } as any,
      })
    );

    await productAttributeValueRepository.save(valueEntities);
  }

  // Step 3: Return the full attribute with values loaded
  return getProductAttributeById(savedAttribute.id);
};
