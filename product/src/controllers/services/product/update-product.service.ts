import { Product } from "../../../entities";
import { MutationUpdateProductArgs } from "../../../types";
import { productRepository } from "../repositories/repositories";
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
  await productRepository.update(productId, {
    ...(data.name !== undefined && data.name !== null && { name: data.name }),
    ...(data.slug !== undefined && data.slug !== null && { slug: data.slug }),
    ...(data.defaultImage !== undefined &&
      data.defaultImage !== null && { defaultImage: data.defaultImage }),
    ...(data.images !== undefined && data.images !== null && { images: data.images }),
    ...(data.videos !== undefined && data.videos !== null && { videos: data.videos }),
    ...(data.defaultMainDescription !== undefined &&
      data.defaultMainDescription !== null && {
        defaultMainDescription: data.defaultMainDescription,
      }),
    ...(data.defaultShortDescription !== undefined &&
      data.defaultShortDescription !== null && {
        defaultShortDescription: data.defaultShortDescription,
      }),
    ...(data.defaultTags !== undefined &&
      data.defaultTags !== null && { defaultTags: data.defaultTags }),
    ...(data.regularPrice !== undefined &&
      data.regularPrice !== null && { regularPrice: data.regularPrice }),
    ...(data.salePrice !== undefined &&
      data.salePrice !== null && { salePrice: data.salePrice }),
    ...(data.salePriceStartAt !== undefined &&
      data.salePriceStartAt !== null && { salePriceStartAt: data.salePriceStartAt }),
    ...(data.salePriceEndAt !== undefined &&
      data.salePriceEndAt !== null && { salePriceEndAt: data.salePriceEndAt }),
    ...(data.saleQuantity !== undefined &&
      data.saleQuantity !== null && { saleQuantity: data.saleQuantity }),
    ...(data.saleQuantityUnit !== undefined &&
      data.saleQuantityUnit !== null && { saleQuantityUnit: data.saleQuantityUnit }),
    ...(data.minQuantity !== undefined &&
      data.minQuantity !== null && { minQuantity: data.minQuantity }),
    ...(data.defaultQuantity !== undefined &&
      data.defaultQuantity !== null && { defaultQuantity: data.defaultQuantity }),
    ...(data.maxQuantity !== undefined &&
      data.maxQuantity !== null && { maxQuantity: data.maxQuantity }),
    ...(data.quantityStep !== undefined &&
      data.quantityStep !== null && { quantityStep: data.quantityStep }),
    ...(data.sku !== undefined && data.sku !== null && { sku: data.sku }),
    ...(data.model !== undefined && data.model !== null && { model: data.model }),
    ...(data.manageStock !== undefined &&
      data.manageStock !== null && { manageStock: data.manageStock }),
    ...(data.stockQuantity !== undefined &&
      data.stockQuantity !== null && { stockQuantity: data.stockQuantity }),
    ...(data.allowBackOrders !== undefined &&
      data.allowBackOrders !== null && { allowBackOrders: data.allowBackOrders }),
    ...(data.lowStockThresHold !== undefined &&
      data.lowStockThresHold !== null && {
        lowStockThresHold: data.lowStockThresHold,
      }),
    ...(data.stockStatus !== undefined &&
      data.stockStatus !== null && { stockStatus: data.stockStatus }),
    ...(data.soldIndividually !== undefined &&
      data.soldIndividually !== null && { soldIndividually: data.soldIndividually }),
    ...(data.initialNumberInStock !== undefined &&
      data.initialNumberInStock !== null && {
        initialNumberInStock: data.initialNumberInStock,
      }),
    ...(data.weightUnit !== undefined &&
      data.weightUnit !== null && { weightUnit: data.weightUnit }),
    ...(data.weight !== undefined && data.weight !== null && { weight: data.weight }),
    ...(data.dimensionUnit !== undefined &&
      data.dimensionUnit !== null && { dimensionUnit: data.dimensionUnit }),
    ...(data.length !== undefined && data.length !== null && { length: data.length }),
    ...(data.width !== undefined && data.width !== null && { width: data.width }),
    ...(data.height !== undefined && data.height !== null && { height: data.height }),
    ...(data.purchaseNote !== undefined &&
      data.purchaseNote !== null && { purchaseNote: data.purchaseNote }),
    ...(data.enableReviews !== undefined &&
      data.enableReviews !== null && { enableReviews: data.enableReviews }),
    ...(data.customBadge !== undefined &&
      data.customBadge !== null && { customBadge: data.customBadge }),
    ...(data.isPreview !== undefined &&
      data.isPreview !== null && { isPreview: data.isPreview }),
    ...(data.isVisible !== undefined &&
      data.isVisible !== null && { isVisible: data.isVisible }),
    ...(data.productConfigurationType !== undefined &&
      data.productConfigurationType !== null && {
        productConfigurationType: data.productConfigurationType,
      }),
    ...(data.productDeliveryType !== undefined &&
      data.productDeliveryType !== null && {
        productDeliveryType: data.productDeliveryType,
      }),
    ...(data.isCustomized !== undefined &&
      data.isCustomized !== null && { isCustomized: data.isCustomized }),
    ...(data.warrantyDigit !== undefined &&
      data.warrantyDigit !== null && { warrantyDigit: data.warrantyDigit }),
    ...(data.defaultWarrantyPeriod !== undefined &&
      data.defaultWarrantyPeriod !== null && {
        defaultWarrantyPeriod: data.defaultWarrantyPeriod,
      }),
    ...(data.warrantyPolicy !== undefined &&
      data.warrantyPolicy !== null && { warrantyPolicy: data.warrantyPolicy }),
  });

  return await getProductById(productId);
};
