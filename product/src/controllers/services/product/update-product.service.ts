import { In } from "typeorm";
import { Product } from "../../../entities";
import { AppDataSource } from "../../../helper";
import { MutationUpdateProductArgs } from "../../../types";
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
  const entityManager = AppDataSource.manager;

  const product = currentProduct;

  // Replace scalar fields directly
  if (data.name !== undefined && data.name !== null) product.name = data.name;

  if (data.slug !== undefined && data.slug !== null) product.slug = data.slug;

  if (data.defaultImage !== undefined) product.defaultImage = data.defaultImage;

  if (data.images !== undefined) product.images = data.images;

  if (data.videos !== undefined) product.videos = data.videos;

  if (data.defaultMainDescription !== undefined)
    product.defaultMainDescription = data.defaultMainDescription;

  if (data.defaultShortDescription !== undefined)
    product.defaultShortDescription = data.defaultShortDescription;

  if (data.regularPrice !== undefined) product.regularPrice = data.regularPrice;

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

  if (data.saleQuantity !== undefined) product.saleQuantity = data.saleQuantity;

  if (data.saleQuantityUnit !== undefined)
    product.saleQuantityUnit = data.saleQuantityUnit;

  if (data.minQuantity !== undefined) product.minQuantity = data.minQuantity;

  if (data.defaultQuantity !== undefined)
    product.defaultQuantity = data.defaultQuantity;

  if (data.maxQuantity !== undefined) product.maxQuantity = data.maxQuantity;

  if (data.quantityStep !== undefined) product.quantityStep = data.quantityStep;

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

  if (data.purchaseNote !== undefined) product.purchaseNote = data.purchaseNote;

  if (data.enableReviews !== undefined)
    product.enableReviews = data.enableReviews;

  if (data.customBadge !== undefined) product.customBadge = data.customBadge;

  if (data.isVisible !== undefined) product.isVisible = data.isVisible;

  if (data.productConfigurationType !== undefined)
    product.productConfigurationType = data.productConfigurationType;

  if (data.productDeliveryType !== undefined)
    product.productDeliveryType = data.productDeliveryType;

  if (data.isCustomized !== undefined) product.isCustomized = data.isCustomized;

  if (data.warrantyDigit !== undefined)
    product.warrantyDigit = data.warrantyDigit;

  if (data.defaultWarrantyPeriod !== undefined)
    product.defaultWarrantyPeriod = data.defaultWarrantyPeriod;

  if (data.warrantyPolicy !== undefined)
    product.warrantyPolicy = data.warrantyPolicy;

  if (data.taxStatus !== undefined) product.taxStatus = data.taxStatus;

  // Replace relational fields
  if (data.brandIds !== undefined && data.brandIds !== null) {
    if (data.brandIds?.length) {
      await entityManager
        .createQueryBuilder()
        .delete()
        .from("product_brands")
        .where('"productId" = :id', { id: product.id })
        .execute();

      product.brands = data.brandIds.map((id) => ({ id })) as any;
    }
  }

  if (data.tagIds !== undefined && data.tagIds !== null) {
    if (data.tagIds?.length) {
      await entityManager
        .createQueryBuilder()
        .delete()
        .from("product_tags")
        .where('"productId" = :id', { id: product.id })
        .execute();

      product.tags = data.tagIds.map((id) => ({ id })) as any;
    }
  }

  if (data.categoryIds !== undefined && data.categoryIds !== null) {
    if (data.categoryIds?.length) {
      await entityManager
        .createQueryBuilder()
        .delete()
        .from("product_categories")
        .where('"productId" = :id', { id: product.id })
        .execute();

      product.categories = data.categoryIds.map((id) => ({ id })) as any;
    }
  }

  if (data.taxClassId !== undefined) {
    if (data.taxClassId === null) {
      await entityManager
        .createQueryBuilder()
        .delete()
        .from("product_tax_class")
        .where('"productId" = :id', { id: product.id })
        .execute();

      product.taxClass = null;
    } else {
      product.taxClass = data.taxClassId
        ? ({ id: data.taxClassId } as any)
        : null;
    }
  }

  if (data.shippingClassId !== undefined) {
    if (data.shippingClassId === null) {
      await entityManager
        .createQueryBuilder()
        .delete()
        .from("product_shipping_class")
        .where('"productId" = :id', { id: product.id })
        .execute();

      product.shippingClass = null;
    }
  } else {
    product.shippingClass = data.shippingClassId
      ? ({ id: data.shippingClassId } as any)
      : null;
  }

  if (data.attributeIds !== undefined) {
    // Delete previous attributes using current product existing attributes ids if they exist
    if (currentProduct.attributes?.length) {
      const idsToDelete = currentProduct.attributes.map((attr) => attr.id);

      await entityManager
        .createQueryBuilder()
        .delete()
        .from("product_attributes")
        .where('"productId" = :id', { id: product.id })
        .andWhere('"attributeId" IN (:...ids)', { ids: idsToDelete })
        .execute();

      await productAttributeRepository.delete({ id: In(idsToDelete) });
    }

    product.attributes = data.attributeIds.map((id) => ({ id })) as any;
  }

  // Replace variations
  if (data.variations) {
    if (currentProduct.variations?.length) {
      const idsToDelete = currentProduct.variations.map((v) => v.id);

      await entityManager
        .createQueryBuilder()
        .delete()
        .from("product_variation_attribute_values")
        .where('"variationId" IN (:...ids)', { ids: idsToDelete })
        .execute();

      await entityManager
        .createQueryBuilder()
        .delete()
        .from("product_variation_brands")
        .where('"variationId" IN (:...ids)', { ids: idsToDelete })
        .execute();

      await entityManager
        .createQueryBuilder()
        .delete()
        .from("product_variation_shipping_class")
        .where('"variationId" IN (:...ids)', { ids: idsToDelete })
        .execute();

      await entityManager
        .createQueryBuilder()
        .delete()
        .from("product_variation_tax_class")
        .where('"variationId" IN (:...ids)', { ids: idsToDelete })
        .execute();

      await entityManager
        .createQueryBuilder()
        .delete()
        .from("product_variation_tier_pricing")
        .where('"variationId" IN (:...ids)', { ids: idsToDelete })
        .execute();

      await productVariationRepository.delete({
        id: In(idsToDelete),
      });
    }

    const processedVariations = data.variations?.map((v) => {
      return {
        ...v,
        brands: v.brandIds?.length ? v.brandIds.map((id) => ({ id })) : [],
        attributeValues: v.attributeValues?.length
          ? v.attributeValues.map((av) => ({ id: av }))
          : [],
        tierPricingInfo: v.tierPricingInfo
          ? {
              pricingType: v.tierPricingInfo.pricingType,
              tieredPrices: {
                tieredPrices: v.tierPricingInfo.tieredPrices?.map((tp) => ({
                  ...tp,
                })),
              },
            }
          : null,
        shippingClass: v.shippingClassId
          ? ({ id: v.shippingClassId } as any)
          : null,

        taxClassId: v.taxClassId ? ({ id: v.taxClassId } as any) : null,

        product: { id: product.id } as any, // Link back to the main product
      };
    });

    product.variations = processedVariations?.length
      ? (processedVariations as any)
      : [];
  }

  // Replace upsells

  if (data.upsellIds !== undefined) {
    if (data.upsellIds === null) {
      // Delete previous upsells
      await entityManager
        .createQueryBuilder()
        .delete()
        .from("product_upsells")
        .where('"productId" = :id', { id: product.id })
        .execute();

      product.upsells = [];
    } else {
      product.upsells = data.upsellIds.length
        ? data.upsellIds.map((id) => ({ id }))
        : ([] as any);
    }
  }
  // Replace cross sells

  if (data.crossSellIds !== undefined) {
    if (data.crossSellIds === null) {
      // Delete previous cross sells
      await entityManager
        .createQueryBuilder()
        .delete()
        .from("product_cross_sells")
        .where('"productId" = :id', { id: product.id })
        .execute();

      product.crossSells = [];
    } else {
      product.crossSells = data.crossSellIds.length
        ? data.crossSellIds.map((id) => ({ id }))
        : ([] as any);
    }
  }

  // Replace tier pricing info for main product
  if (data.tierPricingInfo !== undefined) {
    // Delete previous tier pricing info

    await entityManager
      .createQueryBuilder()
      .delete()
      .from("product_tier_pricing")
      .where('"productId" = :id', { id: product.id })
      .execute();

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
          product: { id: product.id } as any, // Link back to the main product
        }
      : null;

    product.tierPricingInfo = processedTierPricingInfo
      ? await productPriceRepository.save({ processedTierPricingInfo } as any)
      : null;
  }

  // Save and return updated product
  await productRepository.save(product);

  return getProductById(product.id);
};
