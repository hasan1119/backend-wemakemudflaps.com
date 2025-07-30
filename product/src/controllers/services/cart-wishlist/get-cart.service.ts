import { Cart } from "../../../entities";
import { cartRepository } from "../repositories/repositories";

/**
 * Retrieves a single Cart entity by its ID using QueryBuilder.
 *
 * Workflow:
 * 1. Creates a QueryBuilder to find a cart matching the provided ID.
 * 2. Left joins "items" and "coupons" relations, including nested product and productVariation.
 * 3. Filters out soft-deleted carts (deletedAt IS NULL).
 * 4. Returns the Cart entity or null if not found.
 *
 * @param id - The UUID of the cart to retrieve.
 * @returns A promise that resolves to the Cart entity, or null if no match is found.
 */
export const getCartById = async (id: string): Promise<Cart | null> => {
  return await cartRepository
    .createQueryBuilder("cart")
    .leftJoinAndSelect("cart.items", "items")
    .leftJoinAndSelect("items.product", "product")
    .leftJoinAndSelect("items.productVariation", "productVariation")
    .leftJoinAndSelect("cart.coupons", "coupons")
    .where("cart.id = :id", { id })
    .andWhere("cart.deletedAt IS NULL")
    .getOne();
};

/**
 * Retrieves multiple Cart entities by their IDs using QueryBuilder.
 *
 * Workflow:
 * 1. Checks if the input array is non-empty.
 * 2. Creates a QueryBuilder to match all cart IDs in the provided list using IN clause.
 * 3. Left joins "items" and "coupons" relations, including nested product and productVariation.
 * 4. Filters out soft-deleted carts (deletedAt IS NULL).
 * 5. Returns an array of matching Cart entities.
 *
 * @param ids - An array of cart UUIDs to retrieve.
 * @returns A promise resolving to an array of Cart entities.
 */
export const getCartsByIds = async (ids: string[]): Promise<Cart[]> => {
  if (!ids.length) return [];
  return await cartRepository
    .createQueryBuilder("cart")
    .leftJoinAndSelect("cart.items", "items")
    .leftJoinAndSelect("items.product", "product")
    .leftJoinAndSelect("items.productVariation", "productVariation")
    .leftJoinAndSelect("cart.coupons", "coupons")
    .where("cart.id IN (:...ids)", { ids })
    .andWhere("cart.deletedAt IS NULL")
    .getMany();
};

/**
 * Retrieves a single Cart entity by its associated user ID using QueryBuilder.
 *
 * Workflow:
 * 1. Creates a QueryBuilder to find a cart matching the provided user ID (createdBy).
 * 2. Left joins "items" and "coupons" relations, including nested product and productVariation.
 * 3. Filters out soft-deleted carts (deletedAt IS NULL).
 * 4. Returns the Cart entity or null if not found.
 *
 * @param userId - The UUID of the user associated with the cart.
 * @returns A promise that resolves to the Cart entity, or null if no match is found.
 */
export const getCartByUserId = async (userId: string): Promise<Cart | null> => {
  return await cartRepository
    .createQueryBuilder("cart")
    .leftJoinAndSelect("cart.items", "items")
    .leftJoinAndSelect("items.product", "product")
    .leftJoinAndSelect("items.productVariation", "productVariation")
    .leftJoinAndSelect("cart.coupons", "coupons")
    .where("cart.createdBy = :userId", { userId })
    .andWhere("cart.deletedAt IS NULL")
    .getOne();
};
