import { Product } from "../../../entities";
import { MutationCreateProductArgs } from "../../../types";
import {
  productPriceRepository,
  productRepository,
  productVariationRepository,
} from "../repositories/repositories";
import { getProductById } from "./get-product.service";

/**
 * Creates a new Product.
 *
 * Workflow:
 * 1. Validates and prepares product creation input.
 * 2. Creates the product with provided values and user context.
 *
 * @param data - Input data for creating the product.
 * @param userId - Optional user ID who creates this product.
 * @returns Created Product entity.
 */
export const createProduct = async (
  data: MutationCreateProductArgs,
  userId?: string
): Promise<Product> => {
  const {
    name,
    slug,
    defaultImage,
    images,
    videos,
    defaultMainDescription,
    defaultShortDescription,
    regularPrice,
    salePrice,
    salePriceStartAt,
    salePriceEndAt,
    saleQuantity,
    saleQuantityUnit,
    minQuantity,
    defaultQuantity,
    maxQuantity,
    quantityStep,
    sku,
    model,
    categoryIds,
    attributeIds,
    brandIds,
    crossSellIds,
    shippingClassId,
    tagIds,
    taxClassId,
    taxStatus,
    tierPricingInfo,
    upsellIds,
    variations,
    manageStock,
    stockQuantity,
    allowBackOrders,
    lowStockThresHold,
    stockStatus,
    soldIndividually,
    initialNumberInStock,
    weightUnit,
    weight,
    dimensionUnit,
    length,
    width,
    height,
    purchaseNote,
    enableReviews,
    customBadge,
    isVisible,
    productConfigurationType,
    productDeliveryType,
    isCustomized,
    warrantyDigit,
    defaultWarrantyPeriod,
    warrantyPolicy,
  } = data ?? {};

  const product = productRepository.create({
    name: name || "Example Product",
    slug: slug || `example-product-${Date.now()}`,
    defaultImage,
    images,
    videos,
    defaultMainDescription,
    defaultShortDescription,
    regularPrice,
    salePrice,
    salePriceStartAt,
    salePriceEndAt,
    saleQuantity,
    saleQuantityUnit,
    minQuantity,
    defaultQuantity,
    maxQuantity,
    quantityStep,
    sku,
    model,
    manageStock,
    stockQuantity,
    allowBackOrders,
    lowStockThresHold,
    stockStatus,
    soldIndividually,
    initialNumberInStock,
    weightUnit,
    weight,
    dimensionUnit,
    length,
    width,
    height,
    purchaseNote,
    enableReviews,
    customBadge,
    isVisible: isVisible ?? false,
    productConfigurationType,
    productDeliveryType,
    isCustomized,
    warrantyDigit,
    defaultWarrantyPeriod,
    warrantyPolicy,
    createdBy: userId ?? null,
    // Relations
    categories: categoryIds?.length
      ? (categoryIds.map((id) => ({ id })) as any)
      : [],
    brands: brandIds?.length ? brandIds.map((id) => ({ id })) : [],
    tags: tagIds?.length ? (tagIds.map((id) => ({ id })) as any) : [],
    taxClass: taxClassId ? ({ id: taxClassId } as any) : null,
    taxStatus: taxStatus,
    shippingClass: shippingClassId ? ({ id: shippingClassId } as any) : null,
    attributes: attributeIds?.length
      ? (attributeIds.map((id) => ({ id })) as any)
      : [],

    upsells: upsellIds?.length ? (upsellIds.map((id) => ({ id })) as any) : [],
    crossSells: crossSellIds?.length
      ? (crossSellIds.map((id) => ({ id })) as any)
      : [],
  });

  const savedProduct = await productRepository.save(product);

  const processedVariations = variations?.map((v) => {
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

      product: { id: savedProduct.id } as any, // Link back to the main product
    };
  });

  const processedTierPricingInfo = tierPricingInfo
    ? {
        pricingType: tierPricingInfo.pricingType,
        tieredPrices: tierPricingInfo.tieredPrices?.map((tp) => ({
          ...tp,
        })),
        product: { id: savedProduct.id } as any, // Link to product
      }
    : null;

  savedProduct.tierPricingInfo = processedTierPricingInfo
    ? await productPriceRepository.save(processedTierPricingInfo as any)
    : null;

  savedProduct.variations = processedVariations?.length
    ? await productVariationRepository.save(processedVariations as any)
    : null;

  // Save the product with variations and tier pricing
  await productRepository.save(savedProduct);

  const productData = await getProductById(savedProduct.id);

  return productData;
};
