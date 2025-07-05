import { Product } from "../../../entities";
import { productRepository } from "../repositories/repositories";
import { getProductById } from "./get-product.service";

/**
 * Soft deletes a product by setting its deletedAt timestamp.
 *
 * @param productId - The UUID of the product to soft delete.
 * @returns The soft-deleted Product entity.
 */
export const softDeleteProduct = async (productId: string): Promise<Product> => {
  await productRepository.update({ id: productId }, { deletedAt: new Date() });
  const softDeletedProduct = await getProductById(productId);
  return softDeletedProduct;
};

/**
 * Permanently deletes a product from the database.
 *
 * @param productId - The UUID of the product to hard delete.
 */
export const hardDeleteProduct = async (productId: string): Promise<void> => {
  await productRepository.delete({ id: productId });
};
