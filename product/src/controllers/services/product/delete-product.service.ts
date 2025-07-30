import { Product } from "../../../entities";
import { productRepository } from "../repositories/repositories";
import { getProductById } from "./get-product.service";

/**
 * Soft deletes a product by setting its deletedAt timestamp.
 *
 * @param productId - The UUID of the product to soft delete.
 * @returns The soft-deleted Product entity.
 */
export const softDeleteProduct = async (
  productId: string
): Promise<Product> => {
  await productRepository.update({ id: productId }, { deletedAt: new Date() });
  const softDeletedProduct = await getProductById(productId);
  return softDeletedProduct;
};

/**
 * Hard deletes a product from the database.
 *
 * @param productData - The Product entity to hard delete.
 * @returns Promise<void>
 */
export const hardDeleteProduct = async (
  productData: Product
): Promise<void> => {
  const entityManager = AppDataSource.manager;

  // Check if product_brands table exists and delete entries
  const brandExists = await entityManager.query(`
      SELECT to_regclass('public.product_brands') IS NOT NULL AS exists
    `);

  if (brandExists?.[0]?.exists) {
    // First delete any related entries from the product_brands junction table
    await entityManager
      .createQueryBuilder()
      .delete()
      .from("product_brands")
      .where('"productId" = :id', { id: productData.id })
      .execute();
  }

  // Check if product_tags table exists and delete entries
  const tagExists = await entityManager.query(`
      SELECT to_regclass('public.product_tags') IS NOT NULL AS exists
    `);

  if (tagExists?.[0]?.exists) {
    // First delete any related entries from the product_tags junction table
    await entityManager
      .createQueryBuilder()
      .delete()
      .from("product_tags")
      .where('"productId" = :id', { id: productData.id })
      .execute();
  }

  // Check if product_categories table exists and delete entries
  const categoryExists = await entityManager.query(`
      SELECT to_regclass('public.product_categories') IS NOT NULL AS exists
    `);

  if (categoryExists?.[0]?.exists) {
    // First delete any related entries from the product_categories junction table
    await entityManager
      .createQueryBuilder()
      .delete()
      .from("product_categories")
      .where('"productId" = :id', { id: productData.id })
      .execute();
  }

  // Check if product_tier_pricing table exists and delete entries
  const tierPricingExists = await entityManager.query(`
      SELECT to_regclass('public.product_tier_pricing') IS NOT NULL AS exists
    `);

  if (tierPricingExists?.[0]?.exists) {
    // First delete any related entries from the product_tier_pricing table
    await entityManager
      .createQueryBuilder()
      .delete()
      .from("product_tier_pricing")
      .where('"productId" = :id', { id: productData.id })
      .execute();
  }

  // Check if product_tax_class table exists and delete entries
  const taxClassExists = await entityManager.query(`
      SELECT to_regclass('public.product_tax_class') IS NOT NULL AS exists
    `);
  if (taxClassExists?.[0]?.exists) {
    // First delete any related entries from the product_tax_class junction table
    await entityManager
      .createQueryBuilder()
      .delete()
      .from("product_tax_class")
      .where('"productId" = :id', { id: productData.id })
      .execute();
  }

  // Check if product_shipping_class table exists and delete entries
  const shippingClassExists = await entityManager.query(`
      SELECT to_regclass('public.product_shipping_class') IS NOT NULL AS exists
    `);

  if (shippingClassExists?.[0]?.exists) {
    // First delete any related entries from the product_shipping_class junction table
    await entityManager
      .createQueryBuilder()
      .delete()
      .from("product_shipping_class")
      .where('"productId" = :id', { id: productData.id })
      .execute();
  }

  // Check if product_upsells table exists and delete entries
  const upsellExists = await entityManager.query(`
      SELECT to_regclass('public.product_upsells') IS NOT NULL AS exists
    `);

  if (upsellExists?.[0]?.exists) {
    // First delete any related entries from the product_upsells junction table
    await entityManager
      .createQueryBuilder()
      .delete()
      .from("product_upsells")
      .where('"productId" = :id', { id: productData.id })
      .execute();
  }

  // Check if product_cross_sells table exists and delete entries
  const crossSellExists = await entityManager.query(`
      SELECT to_regclass('public.product_cross_sells') IS NOT NULL AS exists
    `);

  if (crossSellExists?.[0]?.exists) {
    // First delete any related entries from the product_cross_sells junction table
    await entityManager
      .createQueryBuilder()
      .delete()
      .from("product_cross_sells")
      .where('"productId" = :id', { id: productData.id })
      .execute();
  }

  // Check if product_attributes table exists and delete entries
  const attributeExists = await entityManager.query(`
      SELECT to_regclass('public.product_attributes') IS NOT NULL AS exists
    `);

  if (attributeExists?.[0]?.exists) {
    // First delete any related entries from the product_attributes junction table
    await entityManager
      .createQueryBuilder()
      .delete()
      .from("product_attributes")
      .where('"productId" = :id', { id: productData.id })
      .execute();
  }

  if (productData.variations) {
    const idsToDelete = productData.variations.map((v) => v.id);

    // Check if product_variations table exists and delete entries
    const variationExists = await entityManager.query(`
        SELECT to_regclass('public.product_variations') IS NOT NULL AS exists
      `);

    if (variationExists?.[0]?.exists) {
      await entityManager
        .createQueryBuilder()
        .delete()
        .from("product_variations")
        .where('"productId" = :id', { id: productData.id })
        .andWhere('"id" IN (:...ids)', { ids: idsToDelete })
        .execute();
    }

    // Check if product_variation_brands table exists and delete entries
    const variationBrandExists = await entityManager.query(`
        SELECT to_regclass('public.product_variation_brands') IS NOT NULL AS exists
      `);

    if (variationBrandExists?.[0]?.exists) {
      await entityManager
        .createQueryBuilder()
        .delete()
        .from("product_variation_brands")
        .where('"variationId" IN (:...ids)', { ids: idsToDelete })
        .execute();
    }

    // Check if product_variation_attributes table exists and delete entries
    const variationAttributeExists = await entityManager.query(`
        SELECT to_regclass('public.product_variation_attributes') IS NOT NULL AS exists
      `);

    if (variationAttributeExists?.[0]?.exists) {
      await entityManager
        .createQueryBuilder()
        .delete()
        .from("product_variation_attributes")
        .where('"variationId" IN (:...ids)', { ids: idsToDelete })
        .execute();
    }

    // Check if product_variation_shipping_class table exists and delete entries
    const variationShippingClassExists = await entityManager.query(`
        SELECT to_regclass('public.product_variation_shipping_class') IS NOT NULL AS exists
      `);

    if (variationShippingClassExists?.[0]?.exists) {
      await entityManager
        .createQueryBuilder()
        .delete()
        .from("product_variation_shipping_class")
        .where('"variationId" IN (:...ids)', { ids: idsToDelete })
        .execute();
    }

    // Check if product_variation_tax_class table exists and delete entries
    const variationTaxClassExists = await entityManager.query(`
        SELECT to_regclass('public.product_variation_tax_class') IS NOT NULL AS exists
      `);

    if (variationTaxClassExists?.[0]?.exists) {
      await entityManager
        .createQueryBuilder()
        .delete()
        .from("product_variation_tax_class")
        .where('"variationId" IN (:...ids)', { ids: idsToDelete })
        .execute();
    }

    // Check if product_variation_tier_pricing table exists and delete entries
    const variationTierPricingExists = await entityManager.query(`
        SELECT to_regclass('public.product_variation_tier_pricing') IS NOT NULL AS exists
      `);

    if (variationTierPricingExists?.[0]?.exists) {
      await entityManager
        .createQueryBuilder()
        .delete()
        .from("product_variation_tier_pricing")
        .where('"variationId" IN (:...ids)', { ids: idsToDelete })
        .execute();
    }

    // Check if product_variations table exists and delete entries
    const variationTableExists = await entityManager.query(`
        SELECT to_regclass('public.product_variations') IS NOT NULL AS exists
      `);

    if (variationTableExists?.[0]?.exists) {
      await entityManager
        .createQueryBuilder()
        .delete()
        .from("product_variations")
        .where('"productId" = :id', { id: productData.id })
        .andWhere('"id" IN (:...ids)', { ids: idsToDelete })
        .execute();
    }
  }

  await productRepository.remove(productData);

  // if (productData.tierPricingInfo) {
  //   // Fetch and delete all associated ProductTieredPrice entities
  //   const tierPricingInfo = await productData.tierPricingInfo;
  //   if (tierPricingInfo) {
  //     await productPriceRepository.remove(tierPricingInfo);
  //   }
  // }

  // if (productData.variations) {
  //   productData.variations.map(async (variation) => {
  //     const tierPricingInfo = await variation.tierPricingInfo;
  //     if (tierPricingInfo) {
  //       await productPriceRepository.remove(tierPricingInfo);
  //     }
  //   });
  // }
};
