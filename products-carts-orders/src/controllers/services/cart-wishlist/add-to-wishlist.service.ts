import { Product, Wishlist } from "../../../entities";
import {
  wishListItemRepository,
  wishlistRepository,
} from "../repositories/repositories";
import { getWishlistByUserId } from "./get-wishlist.service";

/**
 * Adds a product to the user's wishlist.
 *
 * Workflow:
 * 1. Checks if the user already has a wishlist; creates a new one if not.
 * 2. Checks if the product or variation is already in the wishlist; skips if so.
 * 3. Creates and saves a new wishlist item if the product/variation is not in the wishlist.
 * 4. Returns the updated wishlist.
 *
 * @param data - Input data containing productId and optional productVariationId.
 * @param userId - The UUID of the user adding the item to the wishlist.
 * @returns The updated Wishlist entity.
 */
export const addToWishList = async (
  product: Product,
  productVariationId: string | undefined,
  userId: string
): Promise<Wishlist> => {
  // Step 1: Get or create wishlist
  let wishlist = await getWishlistByUserId(userId);
  if (!wishlist) {
    wishlist = wishlistRepository.create({
      createdBy: userId,
      items: [],
    });
    await wishlistRepository.save(wishlist);
  }

  // Step 2: Get full wishlist with all items
  const fullWishlist = await wishlistRepository
    .createQueryBuilder("wishlist")
    .leftJoinAndSelect("wishlist.items", "items")
    .leftJoinAndSelect("items.product", "product")
    .leftJoinAndSelect("items.productVariation", "productVariation")
    .where("wishlist.createdBy = :userId", { userId })
    .andWhere("items.deletedAt IS NULL")
    .getOne();

  const allMatchingItems =
    fullWishlist?.items.filter((item) => item.product.id === product.id) || [];

  // Case 1: Exact product + variation match already exists → skip
  const exactMatch = allMatchingItems.find((item) =>
    productVariationId
      ? item.productVariation?.id === productVariationId
      : !item.productVariation
  );

  if (exactMatch) {
    const result = await getWishlistByUserId(userId);
    return result; // Already exists, skip - fallback to current wishlist
  }

  // Case 2: Product exists with null variation → update it
  if (productVariationId) {
    const nullVariationItem = allMatchingItems.find(
      (item) => item.productVariation === null
    );

    if (nullVariationItem) {
      nullVariationItem.productVariation = { id: productVariationId } as any;
      await wishListItemRepository.save(nullVariationItem);
      const result = await getWishlistByUserId(userId);
      return result; // Fallback to current wishlist if query fails
    }
  }

  // Case 3: Add new wishlist item
  const wishlistItem = wishListItemRepository.create({
    product: { id: product.id } as any,
    productVariation: productVariationId
      ? ({ id: productVariationId } as any)
      : null,
    wishlist: { id: wishlist.id } as any,
  });

  await wishListItemRepository.save(wishlistItem);
  return await getWishlistByUserId(userId);
};
