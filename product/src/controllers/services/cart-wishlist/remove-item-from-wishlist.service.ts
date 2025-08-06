import { In } from "typeorm";
import { Wishlist } from "../../../entities";
import { wishListItemRepository } from "../repositories/repositories";
import { getWishlistByUserId } from "./get-wishlist.service";

/**
 * Removes items from the user's wishlist.
 *
 * Workflow:
 * 1. Deletes wishlist items matching the provided product IDs and user ID.
 * 2. Retrieves the updated wishlist with relations.
 *
 * @param wishListItemIds - Array of wishlist item IDs to remove from the wishlist.
 * @param userId - The UUID of the user whose wishlist is being modified.
 * @returns The updated Wishlist entity.
 */
export const removeItemsFromWishlist = async (
  wishListItemIds: string[],
  userId: string
): Promise<Wishlist> => {
  const wishlistItem = await wishListItemRepository.find({
    where: { id: In(wishListItemIds), wishlist: { createdBy: userId } },
  });

  // Hard delete wishlist items
  await wishListItemRepository.remove(wishlistItem);

  // Retrieve the updated wishlist with relations
  return await getWishlistByUserId(userId);
};
