import { SelectQueryBuilder } from "typeorm";
import { Wishlist } from "../../../entities";
import { wishlistRepository } from "../repositories/repositories";
import {
  addProductRelationsToQuery,
  addProductVariationRelationsToQuery,
} from "./shared/query-builder.utils";

/**
 * Creates a base wishlist query builder with all necessary relations.
 * This function eliminates code duplication across wishlist query functions.
 *
 * @returns A configured QueryBuilder instance with all wishlist and product relations loaded
 */
const createWishlistQueryBuilder = (): SelectQueryBuilder<Wishlist> => {
  let queryBuilder = wishlistRepository
    .createQueryBuilder("wishlist")
    .leftJoinAndSelect("wishlist.items", "items")
    .leftJoinAndSelect("items.product", "product");

  // Add all product relations
  queryBuilder = addProductRelationsToQuery(queryBuilder, "product");

  // Add product variation relations for items
  queryBuilder = queryBuilder.leftJoinAndSelect(
    "items.productVariation",
    "variation"
  );
  queryBuilder = addProductVariationRelationsToQuery(queryBuilder, "variation");

  return queryBuilder;
};

/**
 * Retrieves a single Wishlist entity by its ID using QueryBuilder.
 *
 * Workflow:
 * 1. Creates a QueryBuilder to find a wishlist matching the provided ID.
 * 2. Left joins "items" relation, including nested product and productVariation.
 * 3. Filters out soft-deleted wishlists (deletedAt IS NULL).
 * 4. Returns the Wishlist entity or null if not found.
 *
 * @param id - The UUID of the wishlist to retrieve.
 * @returns A promise that resolves to the Wishlist entity, or null if no match is found.
 */
export const getWishlistById = async (id: string): Promise<Wishlist | null> => {
  return await createWishlistQueryBuilder()
    .where("wishlist.id = :id", { id })
    .andWhere("wishlist.deletedAt IS NULL")
    .getOne();
};

/**
 * Retrieves multiple Wishlist entities by their IDs using QueryBuilder.
 *
 * Workflow:
 * 1. Checks if the input array is non-empty.
 * 2. Creates a QueryBuilder to match all wishlist IDs in the provided list using IN clause.
 * 3. Left joins "items" relation, including nested product and productVariation.
 * 4. Filters out soft-deleted wishlists (deletedAt IS NULL).
 * 5. Returns an array of matching Wishlist entities.
 *
 * @param ids - An array of wishlist UUIDs to retrieve.
 * @returns A promise resolving to an array of Wishlist entities.
 */
export const getWishlistsByIds = async (ids: string[]): Promise<Wishlist[]> => {
  if (!ids.length) return [];

  return await createWishlistQueryBuilder()
    .where("wishlist.id IN (:...ids)", { ids })
    .andWhere("wishlist.deletedAt IS NULL")
    .getMany();
};

/**
 * Retrieves a single Wishlist entity by its associated user ID using QueryBuilder.
 *
 * Workflow:
 * 1. Creates a QueryBuilder to find a wishlist matching the provided user ID (createdBy).
 * 2. Left joins "items" relation, including nested product and productVariation.
 * 3. Filters out soft-deleted wishlists (deletedAt IS NULL).
 * 4. Returns the Wishlist entity or null if not found.
 *
 * @param userId - The UUID of the user associated with the wishlist.
 * @returns A promise that resolves to the Wishlist entity, or null if no match is found.
 */
export const getWishlistByUserId = async (
  userId: string
): Promise<Wishlist | null> => {
  return await createWishlistQueryBuilder()
    .where("wishlist.createdBy = :userId", { userId })
    .andWhere("wishlist.deletedAt IS NULL")
    .getOne();
};
