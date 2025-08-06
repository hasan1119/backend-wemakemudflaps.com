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
 * @param cartItemIds - Array of cart item IDs to remove from the cart.
 * @param userId - The UUID of the user whose cart is being modified.
 * @returns The updated Cart entity.
 */
export const removeItemsFromCart = async (
  cartItemIds: string[],
  userId: string
): Promise<Cart> => {
  const res = await cartItemRepository.find({
    where: {
      id: In(cartItemIds),
      cart: { createdBy: userId },
    },
  });

  await cartItemRepository.remove(res);

  // Retrieve the updated cart with relations
  const cart = await getCartByUserId(userId);

  console.log(cart);
  return cart;
};
