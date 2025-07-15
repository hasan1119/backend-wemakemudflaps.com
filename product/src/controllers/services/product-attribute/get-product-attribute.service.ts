import { In } from "typeorm";
import { ProductAttribute } from "../../../entities";
import { productAttributeRepository } from "../repositories/repositories";

/**
 * Retrieves a ProductAttribute entity by its ID.
 *
 * Workflow:
 * 1. Uses TypeORM to find the ProductAttribute by ID.
 * 2. Filters out soft-deleted attributes (`deletedAt IS NULL`).
 *
 * @param id - The UUID of the product attribute to retrieve.
 * @returns A promise resolving to the ProductAttribute entity or null if not found.
 */
export const getAttributesById = async (
  id: string
): Promise<ProductAttribute | null> => {
  return await productAttributeRepository.findOne({
    where: {
      id,
      deletedAt: null,
    },
  });
};

/**
 * Retrieves multiple ProductAttribute entities by their IDs.
 *
 * Workflow:
 * 1. Returns an empty array if the input array is empty.
 * 2. Uses TypeORM `In` to find all ProductAttribute entities by ID.
 * 3. Filters out soft-deleted attributes (`deletedAt IS NULL`).
 *
 * @param ids - An array of product attribute UUIDs to retrieve.
 * @returns A promise resolving to an array of ProductAttribute entities.
 */
export const getProductAttributesByIds = async (
  ids: string[]
): Promise<ProductAttribute[]> => {
  if (!ids.length) return [];

  return await productAttributeRepository.find({
    where: {
      id: In(ids),
      deletedAt: null,
    },
    relations: ["values"],
  });
};
