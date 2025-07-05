import { Product } from "../../../entities";
import { MutationUpdateProductArgs } from "../../../types";
import {
  productPriceRepository,
  productRepository,
} from "../repositories/repositories";
import { getProductById } from "./get-product.service";

/**
 * Directly updates a product with the given fields and returns the updated entity.
 *
 * @param productId - The UUID of the product to update.
 * @param data - Partial data to update.
 * @returns A promise resolving to the updated Product entity.
 */
export const updateProduct = async (
  productId: string,
  data: Partial<MutationUpdateProductArgs>
): Promise<Product> => {
  const product = await getProductById(productId);

  // Handle scalar fields
  product.name = data.name ?? product.name;
  product.slug = data.slug ?? product.slug;
  product.defaultImage = data.defaultImage ?? product.defaultImage;
  product.images = data.images ?? product.images;
  product.videos = data.videos ?? product.videos;
  product.defaultMainDescription =
    data.defaultMainDescription ?? product.defaultMainDescription;
  product.defaultShortDescription =
    data.defaultShortDescription ?? product.defaultShortDescription;
  product.defaultTags = data.defaultTags ?? product.defaultTags;
  product.regularPrice = data.regularPrice ?? product.regularPrice;
  product.salePrice = data.salePrice ?? product.salePrice;
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
  product.saleQuantity = data.saleQuantity ?? product.saleQuantity;
  product.saleQuantityUnit = data.saleQuantityUnit ?? product.saleQuantityUnit;
  product.minQuantity = data.minQuantity ?? product.minQuantity;
  product.defaultQuantity = data.defaultQuantity ?? product.defaultQuantity;
  product.maxQuantity = data.maxQuantity ?? product.maxQuantity;
  product.quantityStep = data.quantityStep ?? product.quantityStep;
  product.sku = data.sku ?? product.sku;
  product.model = data.model ?? product.model;
  product.manageStock = data.manageStock ?? product.manageStock;
  product.stockQuantity = data.stockQuantity ?? product.stockQuantity;
  product.allowBackOrders = data.allowBackOrders ?? product.allowBackOrders;
  product.lowStockThresHold =
    data.lowStockThresHold ?? product.lowStockThresHold;
  product.stockStatus = data.stockStatus ?? product.stockStatus;
  product.soldIndividually = data.soldIndividually ?? product.soldIndividually;
  product.initialNumberInStock =
    data.initialNumberInStock ?? product.initialNumberInStock;
  product.weightUnit = data.weightUnit ?? product.weightUnit;
  product.weight = data.weight ?? product.weight;
  product.dimensionUnit = data.dimensionUnit ?? product.dimensionUnit;
  product.length = data.length ?? product.length;
  product.width = data.width ?? product.width;
  product.height = data.height ?? product.height;
  product.purchaseNote = data.purchaseNote ?? product.purchaseNote;
  product.enableReviews = data.enableReviews ?? product.enableReviews;
  product.customBadge = data.customBadge ?? product.customBadge;
  product.isPreview = data.isPreview ?? product.isPreview;
  product.isVisible = data.isVisible ?? product.isVisible;
  product.productConfigurationType =
    data.productConfigurationType ?? product.productConfigurationType;
  product.productDeliveryType =
    data.productDeliveryType ?? product.productDeliveryType;
  product.isCustomized = data.isCustomized ?? product.isCustomized;
  product.warrantyDigit = data.warrantyDigit ?? product.warrantyDigit;
  product.defaultWarrantyPeriod =
    data.defaultWarrantyPeriod ?? product.defaultWarrantyPeriod;
  product.warrantyPolicy = data.warrantyPolicy ?? product.warrantyPolicy;

  // Handle relational fields
  if (data.categoryId !== undefined) {
    product.category = data.categoryId
      ? ({ id: data.categoryId } as any)
      : null;
  }

  if (data.subCategoryIds !== undefined) {
    product.subCategories = data.subCategoryIds.map((id) => ({ id })) as any;
  }

  if (data.brandIds !== undefined) {
    product.brands =
      data.brandIds.length > 0 ? ({ id: data.brandIds[0] } as any) : null;
  }

  if (data.tagIds !== undefined) {
    product.tags = data.tagIds.map((id) => ({ id })) as any;
  }

  if (data.taxClassId !== undefined) {
    product.taxClass = data.taxClassId
      ? ({ id: data.taxClassId } as any)
      : null;
  }

  if (data.taxStatusId !== undefined) {
    product.taxStatus = data.taxStatusId
      ? ({ id: data.taxStatusId } as any)
      : null;
  }

  if (data.shippingClassId !== undefined) {
    product.shippingClass = data.shippingClassId
      ? ({ id: data.shippingClassId } as any)
      : null;
  }

  if (data.attributes !== undefined) {
    product.attributes = data.attributes.map((attr) => ({
      id: attr.id,
    })) as any;
  }

  if (data.variations !== undefined) {
    product.variations = data.variations as any;
  }

  if (data.upsellIds !== undefined) {
    product.upsells = data.upsellIds.map((id) => ({ id })) as any;
  }

  if (data.crossSellIds !== undefined) {
    product.crossSells = data.crossSellIds.map((id) => ({ id })) as any;
  }

  // Tier pricing update
  if (data.tierPricingInfo !== undefined) {
    const newTier = productPriceRepository.create(data.tierPricingInfo);
    const savedTier = await productPriceRepository.save(newTier);
    product.tierPricingInfo = Promise.resolve(savedTier);
  }

  return await productRepository.save(product);
};
