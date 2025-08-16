import { SelectQueryBuilder } from "typeorm";
import { Cart, CartItem } from "../../../entities";
import {
  cartItemRepository,
  cartRepository,
} from "../repositories/repositories";
import {
  addProductRelationsToQuery,
  addProductVariationRelationsToQuery,
} from "./shared/query-builder.utils";

/**
 * Creates a base cart query builder with all necessary relations.
 * This function eliminates code duplication across cart query functions.
 *
 * @returns A configured QueryBuilder instance with all cart and product relations loaded
 */
const createCartQueryBuilder = (): SelectQueryBuilder<Cart> => {
  let queryBuilder = cartRepository
    .createQueryBuilder("cart")
    .leftJoinAndSelect("cart.items", "items")
    .leftJoinAndSelect("items.product", "product");

  // Add all product relations with visibility filtering (customer-facing)
  queryBuilder = addProductRelationsToQuery(queryBuilder, "product", {
    includeOnlyVisible: true,
  });

  // Add product variation relations for items
  queryBuilder = queryBuilder.leftJoinAndSelect(
    "items.productVariation",
    "variation"
  );
  queryBuilder = addProductVariationRelationsToQuery(queryBuilder, "variation");

  // Add cart-specific relations
  queryBuilder = queryBuilder.leftJoinAndSelect("cart.coupons", "coupons");

  return queryBuilder;
};

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
  return await createCartQueryBuilder()
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

  return await createCartQueryBuilder()
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
  return await createCartQueryBuilder()
    .where("cart.createdBy = :userId", { userId })
    .andWhere("cart.deletedAt IS NULL")
    .getOne();
};

/**
 * Finds a CartItem by product ID, product variation ID, and user ID.
 *
 * Workflow:
 * 1. Creates a QueryBuilder to find a cart item matching the provided criteria.
 * 2. Left joins "product" and "variation" relations for detailed information.
 * 3. Returns the CartItem entity or null if not found.
 *
 * @param productId - The UUID of the product to search for.
 * @param productVariationId - The UUID of the product variation (can be null).
 * @param userId - The UUID of the user who owns the cart item.
 * @returns A promise resolving to the CartItem entity or null if not found.
 */
export const findCartItem = async (
  productId: string,
  productVariationId: string | null,
  userId: string
): Promise<CartItem | null> => {
  return await cartItemRepository
    .createQueryBuilder("cartItem")
    .leftJoinAndSelect("cartItem.product", "product")
    .leftJoinAndSelect("cartItem.productVariation", "variation")
    .where("cartItem.userId = :userId", { userId })
    .andWhere("product.id = :productId", { productId })
    .andWhere("variation.id = :productVariationId", {
      productVariationId,
    })
    .getOne();
};
