import { In } from "typeorm";
import { Product } from "../../../entities";
import { AppDataSource } from "../../../helper";
import { Brand, MutationUpdateProductArgs } from "../../../types";
import { getBrandsByIds } from "../brand/get-brand.service";
import {
  productAttributeRepository,
  productPriceRepository,
  productRepository,
  productVariationRepository,
} from "../repositories/repositories";
import { getProductById } from "./get-product.service";

/**
 * Updates a product and its related entities including variations and tier pricing.
 *
 * Handles:
 * - Scalar fields replacement
 * - Relations replacement (category, subcategories, brands, tags, tax, shipping, etc.)
 * - Variations replacement with proper create/update/delete and tierPricingInfo association by ID
 * - Tier pricing for main product replacement
 *
 * @param productId - UUID of product to update
 * @param currentProduct - The current product entity to update
 * @param data - Partial data to update the product
 * @returns Updated Product entity
 */
export const updateProduct = async (
  currentProduct: Product,
  data: Partial<MutationUpdateProductArgs>
): Promise<Product> => {
  return await AppDataSource.manager.transaction(async (entityManager) => {
    const product = currentProduct;

    // Replace scalar fields directly
    if (data.name !== undefined && data.name !== null) product.name = data.name;
    if (data.slug !== undefined && data.slug !== null) product.slug = data.slug;
    if (data.defaultImage !== undefined)
      product.defaultImage = data.defaultImage;
    if (data.images !== undefined) product.images = data.images;
    if (data.videos !== undefined) product.videos = data.videos;
    if (data.defaultMainDescription !== undefined)
      product.defaultMainDescription = data.defaultMainDescription;
    if (data.defaultShortDescription !== undefined)
      product.defaultShortDescription = data.defaultShortDescription;
    if (data.regularPrice !== undefined)
      product.regularPrice = data.regularPrice;
    if (data.salePrice !== undefined) product.salePrice = data.salePrice;
    if (data.salePriceStartAt !== undefined) {
      product.salePriceStartAt =
        data.salePriceStartAt === null
          ? null
          : typeof data.salePriceStartAt === "string"
          ? new Date(data.salePriceStartAt)
          : data.salePriceStartAt;
    }
    if (data.salePriceEndAt !== undefined) {
      product.salePriceEndAt =
        data.salePriceEndAt === null
          ? null
          : typeof data.salePriceEndAt === "string"
          ? new Date(data.salePriceEndAt)
          : data.salePriceEndAt;
    }
    if (data.saleQuantity !== undefined)
      product.saleQuantity = data.saleQuantity;
    if (data.saleQuantityUnit !== undefined)
      product.saleQuantityUnit = data.saleQuantityUnit;
    if (data.minQuantity !== undefined) product.minQuantity = data.minQuantity;
    if (data.defaultQuantity !== undefined)
      product.defaultQuantity = data.defaultQuantity;
    if (data.maxQuantity !== undefined) product.maxQuantity = data.maxQuantity;
    if (data.quantityStep !== undefined)
      product.quantityStep = data.quantityStep;
    if (data.sku !== undefined) product.sku = data.sku;
    if (data.model !== undefined) product.model = data.model;
    if (data.manageStock !== undefined) product.manageStock = data.manageStock;
    if (data.stockQuantity !== undefined)
      product.stockQuantity = data.stockQuantity;
    if (data.allowBackOrders !== undefined)
      product.allowBackOrders = data.allowBackOrders;
    if (data.lowStockThresHold !== undefined)
      product.lowStockThresHold = data.lowStockThresHold;
    if (data.stockStatus !== undefined) product.stockStatus = data.stockStatus;
    if (data.soldIndividually !== undefined)
      product.soldIndividually = data.soldIndividually;
    if (data.initialNumberInStock !== undefined)
      product.initialNumberInStock = data.initialNumberInStock;
    if (data.weightUnit !== undefined) product.weightUnit = data.weightUnit;
    if (data.weight !== undefined) product.weight = data.weight;
    if (data.dimensionUnit !== undefined)
      product.dimensionUnit = data.dimensionUnit;
    if (data.length !== undefined) product.length = data.length;
    if (data.width !== undefined) product.width = data.width;
    if (data.height !== undefined) product.height = data.height;
    if (data.purchaseNote !== undefined)
      product.purchaseNote = data.purchaseNote;
    if (data.enableReviews !== undefined)
      product.enableReviews = data.enableReviews;
    if (data.customBadge !== undefined) product.customBadge = data.customBadge;
    if (data.isVisible !== undefined) product.isVisible = data.isVisible;
    if (data.productConfigurationType !== undefined)
      product.productConfigurationType = data.productConfigurationType;
    if (data.productDeliveryType !== undefined)
      product.productDeliveryType = data.productDeliveryType;
    if (data.isCustomized !== undefined)
      product.isCustomized = data.isCustomized;
    if (data.warrantyDigit !== undefined)
      product.warrantyDigit = data.warrantyDigit;
    if (data.defaultWarrantyPeriod !== undefined)
      product.defaultWarrantyPeriod = data.defaultWarrantyPeriod;
    if (data.warrantyPolicy !== undefined)
      product.warrantyPolicy = data.warrantyPolicy;
    if (data.taxStatus !== undefined) product.taxStatus = data.taxStatus;

    // Replace relational fields
    if (data.brandIds !== undefined) {
      product.brands = data.brandIds?.length
        ? data.brandIds.map((id) => ({ id } as any))
        : null;
    }

    if (data.tagIds !== undefined) {
      product.tags = data.tagIds?.length
        ? data.tagIds.map((id) => ({ id } as any))
        : null;
    }

    if (data.categoryIds !== undefined && data.categoryIds !== null) {
      product.categories = data.categoryIds?.length
        ? data.categoryIds.map((id) => ({ id } as any))
        : null;
    }

    if (data.taxClassId !== undefined) {
      product.taxClass = data.taxClassId
        ? ({ id: data.taxClassId } as any)
        : null;
    }

    if (data.shippingClassId !== undefined) {
      product.shippingClass = data.shippingClassId
        ? ({ id: data.shippingClassId } as any)
        : null;
    }

    if (data.attributeIds !== undefined) {
      const idsToDelete = currentProduct.attributes.map((attr) => attr.id);
      await productAttributeRepository.delete({ id: In(idsToDelete) });
      product.attributes = data.attributeIds?.length
        ? data.attributeIds.map((id) => ({ id } as any))
        : null;
    }

    // Process variations
    const processedVariations = [];
    const variationBrandMap: { variation: any; brands: Brand[] }[] = [];

    // Replace variations
    if (data.variations !== undefined) {
      const idsToDelete = currentProduct.variations.map((v) => v.id);
      // Check if product_variation_brands table exists and delete entries
      const variationBrandExists = await entityManager.query(`
          SELECT to_regclass('public.product_variation_brands') IS NOT NULL AS exists
        `);
      if (variationBrandExists?.[0]?.exists) {
        if (idsToDelete?.length > 0) {
          await entityManager
            .createQueryBuilder()
            .delete()
            .from("product_variation_brands")
            .where('"productVariationId" IN (:...ids)', { ids: idsToDelete })
            .execute();
        }
      }
      // Check if product_variation_attribute_values table exists and delete entries
      const variationAttributeExists = await entityManager.query(`
        SELECT to_regclass('public.product_variation_attribute_values') IS NOT NULL AS exists
      `);
      if (variationAttributeExists?.[0]?.exists) {
        if (idsToDelete?.length > 0) {
          await entityManager
            .createQueryBuilder()
            .delete()
            .from("product_variation_attribute_values")
            .where('"productVariationId" IN (:...ids)', { ids: idsToDelete })
            .execute();
        }
      }
      // Check if product_variation table exists and delete entries
      const variationExists = await entityManager.query(`
          SELECT to_regclass('public.product_variation') IS NOT NULL AS exists
        `);
      if (variationExists?.[0]?.exists) {
        if (idsToDelete?.length > 0) {
          await entityManager
            .createQueryBuilder()
            .delete()
            .from("product_variation")
            .where('"productId" = :id', { id: currentProduct.id })
            .andWhere('"id" IN (:...ids)', { ids: idsToDelete })
            .execute();
        }
      }
    }

    for (const v of data.variations) {
      // Fetch brands for this variation
      const variationBrands = v.brandIds?.length
        ? await getBrandsByIds(v.brandIds)
        : [];
      // Create variation without brands to avoid type mismatch
      const variation = productVariationRepository.create({
        ...v,
        attributeValues: v.attributeValues?.length
          ? v.attributeValues.map((av) => ({ id: av }))
          : [],
        shippingClass: v.shippingClassId ? { id: v.shippingClassId } : null,
        taxClass: v.taxClassId ? { id: v.taxClassId } : null,
        product: currentProduct, // Link to the main product
      } as any);
      processedVariations.push(variation);
      variationBrandMap.push({
        variation,
        brands: variationBrands as any,
      });
    }

    currentProduct.variations = processedVariations?.length
      ? await productVariationRepository.save(processedVariations as any)
      : null;

    // Replace upsells
    if (data.upsellIds !== undefined) {
      if (data.upsellIds === null) {
        const upsellExists = await entityManager.query(`
          SELECT to_regclass('public.product_upsells') IS NOT NULL AS exists
        `);
        if (upsellExists?.[0]?.exists) {
          await entityManager
            .createQueryBuilder()
            .delete()
            .from("product_upsells")
            .where('"productId" = :id', { id: product.id })
            .execute();
        }
        product.upsells = [];
      } else {
        product.upsells = data.upsellIds.length
          ? data.upsellIds.map((id) => ({ id } as any))
          : [];
      }
    }

    // Replace cross sells
    if (data.crossSellIds !== undefined) {
      if (data.crossSellIds === null) {
        const crossSellExists = await entityManager.query(`
          SELECT to_regclass('public.product_cross_sells') IS NOT NULL AS exists
        `);
        if (crossSellExists?.[0]?.exists) {
          await entityManager
            .createQueryBuilder()
            .delete()
            .from("product_cross_sells")
            .where('"productId" = :id', { id: product.id })
            .execute();
        }
        product.crossSells = [];
      } else {
        product.crossSells = data.crossSellIds.length
          ? data.crossSellIds.map((id) => ({ id } as any))
          : [];
      }
    }

    // Replace tier pricing info for main product
    if (data.tierPricingInfo !== undefined) {
      const tierPricingExists = await entityManager.query(`
        SELECT to_regclass('public.product_tier_pricing') IS NOT NULL AS exists
      `);
      if (tierPricingExists?.[0]?.exists) {
        await entityManager
          .createQueryBuilder()
          .delete()
          .from("product_tier_pricing")
          .where('"productId" = :id', { id: product.id })
          .execute();
      }
      await productPriceRepository.delete({
        product: { id: currentProduct.id },
      });

      const processedTierPricingInfo = data.tierPricingInfo
        ? {
            pricingType: data.tierPricingInfo.pricingType,
            tieredPrices: {
              tieredPrices: data.tierPricingInfo.tieredPrices?.map((tp) => ({
                ...tp,
              })),
            },
            product: currentProduct, // Assign the full product entity
          }
        : null;

      product.tierPricingInfo = processedTierPricingInfo
        ? await productPriceRepository.save(processedTierPricingInfo as any)
        : null;
    }

    // Save and return updated product
    await productRepository.save(product);
    return getProductById(product.id);
  });
};
