import { Product } from "../../../entities";
import {
  productPriceRepository,
  productRepository,
} from "../repositories/repositories";
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
  await productRepository.remove(productData);

  if (productData.tierPricingInfo) {
    // Fetch and delete all associated ProductTieredPrice entities
    const tierPricingInfo = await productData.tierPricingInfo;
    if (tierPricingInfo) {
      await productPriceRepository.remove(tierPricingInfo);
    }
  }

  if (productData.variations) {
    productData.variations.map(async (variation) => {
      const tierPricingInfo = await variation.tierPricingInfo;
      if (tierPricingInfo) {
        await productPriceRepository.remove(tierPricingInfo);
      }
    });
  }
};
