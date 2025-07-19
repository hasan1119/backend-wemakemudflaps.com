import { Product } from "../../../entities";
import { MutationUpdateProductArgs } from "../../../types";
import {
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
  product.name = data.name;
  product.slug = data.slug;
  product.defaultImage = data.defaultImage;
  product.images = data.images;
  product.videos = data.videos;
  product.defaultMainDescription = data.defaultMainDescription;
  product.defaultShortDescription = data.defaultShortDescription;
  product.regularPrice = data.regularPrice;
  product.salePrice = data.salePrice;

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

  product.saleQuantity = data.saleQuantity;
  product.saleQuantityUnit = data.saleQuantityUnit;
  product.minQuantity = data.minQuantity;
  product.defaultQuantity = data.defaultQuantity;
  product.maxQuantity = data.maxQuantity;
  product.quantityStep = data.quantityStep;
  product.sku = data.sku;
  product.model = data.model;
  product.manageStock = data.manageStock;
  product.stockQuantity = data.stockQuantity;
  product.allowBackOrders = data.allowBackOrders;
  product.lowStockThresHold = data.lowStockThresHold;
  product.stockStatus = data.stockStatus;
  product.soldIndividually = data.soldIndividually;
  product.initialNumberInStock = data.initialNumberInStock;
  product.weightUnit = data.weightUnit;
  product.weight = data.weight;
  product.dimensionUnit = data.dimensionUnit;
  product.length = data.length;
  product.width = data.width;
  product.height = data.height;
  product.purchaseNote = data.purchaseNote;
  product.enableReviews = data.enableReviews;
  product.customBadge = data.customBadge;
  product.isVisible = data.isVisible;
  product.productConfigurationType = data.productConfigurationType;
  product.productDeliveryType = data.productDeliveryType;
  product.isCustomized = data.isCustomized;
  product.warrantyDigit = data.warrantyDigit;
  product.defaultWarrantyPeriod = data.defaultWarrantyPeriod;
  product.warrantyPolicy = data.warrantyPolicy;
  product.taxStatus = data.taxStatus;

  // Replace relational fields
  if (data.categoryIds !== undefined) {
    product.categories = data.categoryIds.map((id) => ({ id })) as any;
  }

  if (data.brandIds !== undefined) {
    product.brands = data.brandIds.map((id) => ({ id })) as any;
  }

  if (data.tagIds !== undefined) {
    product.tags = data.tagIds.map((id) => ({ id })) as any;
  }

  if (data.taxClassId !== undefined) {
    product.taxClass = data.taxClassId as any;
  }

  if (data.shippingClassId !== undefined) {
    product.shippingClass = data.shippingClassId
      ? ({ id: data.shippingClassId } as any)
      : null;
  }

  if (data.attributeIds !== undefined) {
    product.attributes = data.attributeIds.map((id) => ({ id })) as any;
  }

  // Replace variations
  if (data.variations) {
    // Delete previous
    await productVariationRepository.delete({
      product: { id: currentProduct.id },
    });

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
    product.upsells = data.upsellIds.map((id) => ({ id })) as any;
  }

  // Replace cross sells
  if (data.crossSellIds !== undefined) {
    product.crossSells = data.crossSellIds.map((id) => ({ id })) as any;
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
