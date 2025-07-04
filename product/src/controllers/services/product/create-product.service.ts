import { Product, ProductPrice } from "../../../entities";
import { MutationCreateProductArgs } from "../../../types";
import {
  productPriceRepository,
  productRepository,
} from "../repositories/repositories";

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
    defaultTags,
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
    categoryId,
    attributes,
    brandIds,
    crossSellIds,
    shippingClassId,
    subCategoryIds,
    tagIds,
    taxClassId,
    taxStatusId,
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
    isPreview,
    isVisible,
    productConfigurationType,
    productDeliveryType,
    isCustomized,
    warrantyDigit,
    defaultWarrantyPeriod,
    warrantyPolicy,
  } = data ?? {};

  // Handle tier pricing creation separately
  let createdTierPricing: ProductPrice | null = null;
  if (tierPricingInfo) {
    const newTierPricing = productPriceRepository.create(tierPricingInfo);
    createdTierPricing = await productPriceRepository.save(newTierPricing);
  }

  const product = productRepository.create({
    name,
    slug,
    defaultImage,
    images,
    videos,
    defaultMainDescription,
    defaultShortDescription,
    defaultTags,
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
    isPreview,
    isVisible,
    productConfigurationType,
    productDeliveryType,
    isCustomized,
    warrantyDigit,
    defaultWarrantyPeriod,
    warrantyPolicy,
    createdBy: userId ?? null,

    // Relations
    category: categoryId ? ({ id: categoryId } as any) : null,
    subCategories: subCategoryIds?.length
      ? (subCategoryIds.map((id) => ({ id })) as any)
      : [],
    brands: brandIds?.length ? ({ id: brandIds[0] } as any) : null,
    tags: tagIds?.length ? (tagIds.map((id) => ({ id })) as any) : [],
    taxClass: taxClassId ? ({ id: taxClassId } as any) : null,
    taxStatus: taxStatusId ? ({ id: taxStatusId } as any) : null,
    shippingClass: shippingClassId ? ({ id: shippingClassId } as any) : null,
    tierPricingInfo: (createdTierPricing as any) ?? null,
    attributes: attributes?.length
      ? (attributes.map((attr) => ({ id: attr.id })) as any)
      : [],
    variations: variations?.length ? (variations as any) : [],
    upsells: upsellIds?.length ? (upsellIds.map((id) => ({ id })) as any) : [],
    crossSells: crossSellIds?.length
      ? (crossSellIds.map((id) => ({ id })) as any)
      : [],
  });

  return await productRepository.save(product);
};
