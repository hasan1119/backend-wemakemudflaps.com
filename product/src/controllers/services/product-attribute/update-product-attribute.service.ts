import { In } from "typeorm";
import { v4 as uuidv4 } from "uuid";
import { ProductAttribute } from "../../../entities";
import { AppDataSource } from "../../../helper";
import { MutationUpdateProductAttributeArgs } from "../../../types";
import {
  productAttributeRepository,
  productAttributeValueRepository,
  productVariationAttributeValueRepository,
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
  const entityManager = AppDataSource.manager;

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

  // Current attribute values ids
  const idsToDelete = currentProductAttribute.values.map((value) => value.id);

  // Store the existing product variation attribute values
  const ProductVariationAttributeValue =
    await productVariationAttributeValueRepository.find({
      where: {
        attributeValue: In(idsToDelete),
      },
      relations: ["variation", "attributeValue"],
    });

  const processedVariationAttributeValues = await Promise.all(
    ProductVariationAttributeValue.map(async (value) => ({
      id: value.id,
      variationId: (await value.variation).id,
      attributeValue: value.attributeValue.id,
    }))
  );

  // Check if product_variation_attribute_values table exists and delete entries
  const variationAttributeValuesExists = await entityManager.query(`
        SELECT to_regclass('public.product_variation_attribute_values') IS NOT NULL AS exists
      `);

  // delete all the existing values with this attribute values id
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

  // Step 3: Hard delete existing values
  await productAttributeValueRepository.delete({
    attribute: currentProductAttribute,
  });

  // Step 4: Create and save new values if provided
  if (Array.isArray(values) && values.length > 0) {
    const newValues = values.map((v) =>
      productAttributeValueRepository.create({
        id: v.id || uuidv4(), // Use existing ID or create a new one
        value: v.value,
        attribute: currentProductAttribute as any,
      })
    );

    await productAttributeValueRepository.save(newValues);
  }

  const result = await getProductAttributeById(currentProductAttribute.id);

  const newAttributeValueIds = new Set(values.map((v) => v.id));

  const newProductVariationAttributeValues =
    processedVariationAttributeValues.filter((value) =>
      newAttributeValueIds.has(value.attributeValue)
    );

  // Check the product attribute values and update the product variation attribute values id then create only those which has the same attribute value id
  if (processedVariationAttributeValues.length > 0) {
    const newProductVariationAttributeValues = processedVariationAttributeValues
      .filter((value) => newAttributeValueIds.has(value.attributeValue))
      .map((value) =>
        productVariationAttributeValueRepository.create({
          id: value.id,
          variation: { id: value.variationId } as any,
          attributeValue: { id: value.attributeValue } as any,
        })
      );

    await productVariationAttributeValueRepository.save(
      newProductVariationAttributeValues
    );
  }

  return result;
};
