import { In } from "typeorm";
import { Cart } from "../../../entities";
import { cartItemRepository } from "../repositories/repositories";
import { getCartByUserId } from "./get-cart.service";

/**
 * Removes items from the user's cart.
 *
 * Workflow:
 * 1. Deletes cart items matching the provided product IDs and user ID.
 * 2. Retrieves the updated cart with relations.
 *
 * @param productIds - Array of product IDs to remove from the cart.
 * @param userId - The UUID of the user whose cart is being modified.
 * @returns The updated Cart entity.
 */
export const removeItemsFromCart = async (
  productIds: string[],
  userId: string
): Promise<Cart> => {
  // Hard delete cart items
  await cartItemRepository.delete({
    product: { id: In(productIds) },
    cart: { createdBy: userId },
  });

  // Retrieve the updated cart with relations
  return await getCartByUserId(userId);
};
