import { Cart } from "../../../entities";
import {
  cartItemRepository,
  cartRepository,
} from "../repositories/repositories";
import { getCartByUserId } from "./get-cart.service";

/**
 * Updates the quantity of an item in the user's cart.
 *
 * Workflow:
 * 1. Validates the input product ID and retrieves the user's cart.
 * 2. Finds the cart item matching the product ID and optional variation ID.
 * 3. Updates the quantity of the cart item.
 * 4. Saves the updated cart item.
 * 5. Returns the updated cart.
 *
 * @param productId - The UUID of the product to update.
 * @param quantity - The new quantity of the product.
 * @param userId - The UUID of the user updating the cart.
 * @returns The updated Cart entity.
 */
export const updateCartItem = async (
  productId: string,
  quantity: number,
  userId: string
): Promise<Cart> => {
  // Check for existing cart or create a new one
  let cart = await getCartByUserId(userId);
  if (!cart) {
    cart = cartRepository.create({
      createdBy: userId,
      items: [],
      coupons: null,
    });
    await cartRepository.save(cart);
  }

  // Find the cart item
  const cartItem = await cartItemRepository
    .createQueryBuilder("cartItem")
    .leftJoinAndSelect("cartItem.cart", "cart")
    .where("cartItem.product.id = :productId", { productId })
    .andWhere("cartItem.cart.id = :cartId", { cartId: cart.id })
    .andWhere("cartItem.deletedAt IS NULL")
    .getOne();

  // Update the quantity
  cartItem.quantity = quantity;
  await cartItemRepository.save(cartItem);

  return getCartByUserId(userId) as Promise<Cart>;
};
