import { Product } from "../../../entities";
import { productRepository } from "../repositories/repositories";
import { getProductById } from "./get-product.service";

/**
 * Creates a new Product.
 *
 * Workflow:
 * 1. Validates and prepares product creation input.
 * 2. Creates the product with provided values and user context.
 *
 * @param data - Input data for creating the product.
 * @param userId - User ID who creates this product.
 * @returns Created Product entity.
 */
export const createProduct = async (userId: string): Promise<Product> => {
  const product = productRepository.create({
    name: "Example Product",
    slug: `example-product-${Date.now()}`,
    isVisible: false,
    createdBy: userId,
  });

  const result = await productRepository.save(product);

  const productData = await getProductById(result.id);

  return productData;
};
