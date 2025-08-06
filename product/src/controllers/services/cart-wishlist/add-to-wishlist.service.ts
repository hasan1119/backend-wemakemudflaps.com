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
  // Check for existing wishlist or create a new one
  let wishlist = await getWishlistByUserId(userId);
  if (!wishlist) {
    wishlist = wishlistRepository.create({
      createdBy: userId,
      items: [],
    });
    await wishlistRepository.save(wishlist);
  }

  // Check if the product/variation is already in the wishlist
  const existingItem = await wishlistRepository
    .createQueryBuilder("wishlist")
    .leftJoinAndSelect("wishlist.items", "items")
    .leftJoinAndSelect("items.product", "product")
    .leftJoinAndSelect("items.productVariation", "productVariation")
    .where("wishlist.createdBy = :userId", { userId })
    .andWhere("items.product.id = :productId", { productId: product.id })
    .andWhere(
      productVariationId
        ? "items.productVariation.id = :productVariationId"
        : "items.productVariation IS NULL",
      { productVariationId }
    )
    .andWhere("items.deletedAt IS NULL")
    .getOne();

  if (existingItem) {
    // If the item already exists, skip adding it
    return wishlist;
  } else {
    // Create a new wishlist item
    const wishlistItem = await wishListItemRepository.create({
      product: { id: product.id } as any,
      productVariation: productVariationId
        ? { id: productVariationId as any }
        : null,
      wishlist: { id: wishlist.id } as any,
    });

    await wishListItemRepository.save(wishlistItem);

    // Add the new item to the wishlist's items array
    wishlist.items = [...(wishlist.items || []), wishlistItem];
    await wishlistRepository.save(wishlist);
  }
};
