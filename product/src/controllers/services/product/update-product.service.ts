import { In } from "typeorm";
import { Product } from "../../../entities";
import { MutationUpdateProductArgs } from "../../../types";
import {
  productAttributeRepository,
  productPriceRepository,
  productRepository,
  productVariationRepository,
} from "../repositories/repositories";

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
  const product = currentProduct;

  // Replace scalar fields directly
  if (data.name) product.name = data.name;
  if (data.slug) product.slug = data.slug;
  if (data.defaultImage) product.defaultImage = data.defaultImage;
  if (data.images) product.images = data.images;
  if (data.videos) product.videos = data.videos;
  if (data.defaultMainDescription)
    product.defaultMainDescription = data.defaultMainDescription;
  if (data.defaultShortDescription)
    product.defaultShortDescription = data.defaultShortDescription;
  if (data.regularPrice) product.regularPrice = data.regularPrice;
  if (data.salePrice) product.salePrice = data.salePrice;

  if (data.salePriceStartAt !== undefined) {
    product.salePriceStartAt =
      typeof data.salePriceStartAt === "string"
        ? new Date(data.salePriceStartAt)
        : data.salePriceStartAt;
  }

  if (data.salePriceEndAt !== undefined) {
    product.salePriceEndAt =
      typeof data.salePriceEndAt === "string"
        ? new Date(data.salePriceEndAt)
        : data.salePriceEndAt;
  }

  if (data.saleQuantity) product.saleQuantity = data.saleQuantity;
  if (data.saleQuantityUnit) product.saleQuantityUnit = data.saleQuantityUnit;
  if (data.minQuantity) product.minQuantity = data.minQuantity;
  if (data.defaultQuantity) product.defaultQuantity = data.defaultQuantity;
  if (data.maxQuantity) product.maxQuantity = data.maxQuantity;
  if (data.quantityStep) product.quantityStep = data.quantityStep;
  if (data.sku) product.sku = data.sku;
  if (data.model) product.model = data.model;
  if (data.manageStock) product.manageStock = data.manageStock;
  if (data.stockQuantity) product.stockQuantity = data.stockQuantity;
  if (data.allowBackOrders) product.allowBackOrders = data.allowBackOrders;
  if (data.lowStockThresHold)
    product.lowStockThresHold = data.lowStockThresHold;
  if (data.stockStatus) product.stockStatus = data.stockStatus;
  if (data.soldIndividually) product.soldIndividually = data.soldIndividually;
  if (data.initialNumberInStock)
    product.initialNumberInStock = data.initialNumberInStock;
  if (data.weightUnit) product.weightUnit = data.weightUnit;
  if (data.weight) product.weight = data.weight;
  if (data.dimensionUnit) product.dimensionUnit = data.dimensionUnit;
  if (data.length) product.length = data.length;
  if (data.width) product.width = data.width;
  if (data.height) product.height = data.height;
  if (data.purchaseNote) product.purchaseNote = data.purchaseNote;
  if (data.enableReviews) product.enableReviews = data.enableReviews;
  if (data.customBadge) product.customBadge = data.customBadge;
  if (data.isVisible) product.isVisible = data.isVisible;
  if (data.productConfigurationType)
    product.productConfigurationType = data.productConfigurationType;
  if (data.productDeliveryType)
    product.productDeliveryType = data.productDeliveryType;
  if (data.isCustomized) product.isCustomized = data.isCustomized;
  if (data.warrantyDigit) product.warrantyDigit = data.warrantyDigit;
  if (data.defaultWarrantyPeriod)
    product.defaultWarrantyPeriod = data.defaultWarrantyPeriod;
  if (data.warrantyPolicy) product.warrantyPolicy = data.warrantyPolicy;
  if (data.taxStatus) product.taxStatus = data.taxStatus;

  // Replace relational fields

  if (data.categoryIds !== undefined) {
    if (data.categoryIds === null) {
      product.categories = [];
    } else {
      product.categories = data.categoryIds.length
        ? data.categoryIds.map((id) => ({ id }))
        : ([] as any);
    }
  }

  if (data.brandIds !== undefined) {
    if (data.brandIds === null) {
      product.brands = [];
    } else {
      product.brands = data.brandIds.length
        ? data.brandIds.map((id) => ({ id }))
        : ([] as any);
    }
  }

  if (data.tagIds !== undefined) {
    if (data.tagIds === null) {
      product.tags = [];
    } else {
      product.tags = data.tagIds.length
        ? data.tagIds.map((id) => ({ id }))
        : ([] as any);
    }
  }

  if (data.taxClassId !== undefined) {
    if (data.taxClassId === null) {
      product.taxClass = null;
    } else {
      product.taxClass = data.taxClassId
        ? ({ id: data.taxClassId } as any)
        : null;
    }
  }

  if (data.shippingClassId !== undefined) {
    if (data.shippingClassId === null) {
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
      await productAttributeRepository.delete({ id: In(idsToDelete) });
    }

    product.attributes = data.attributeIds.map((id) => ({ id })) as any;
  }

  // Replace variations
  if (data.variations) {
    if (currentProduct.variations?.length) {
      const idsToDelete = currentProduct.variations.map((v) => v.id);
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
      product.crossSells = [];
    } else {
      product.crossSells = data.crossSellIds.length
        ? data.crossSellIds.map((id) => ({ id }))
        : ([] as any);
    }
  }

  // Replace tier pricing info for main product
  if (data.tierPricingInfo !== undefined) {
    // Delete previous
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
  return await productRepository.save(product);
};
