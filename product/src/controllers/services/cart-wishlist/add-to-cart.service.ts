import { Cart, CartItem, Product, WishlistItem } from "../../../entities";
import {
  cartItemRepository,
  cartRepository,
  wishlistRepository,
} from "../repositories/repositories";
import { getCartByUserId } from "./get-cart.service";

/**
 * Adds a product to the user's cart.
 *
 * Workflow:
 * 1. Checks if the user already has a cart; creates a new one if not.
 * 2. Checks if the product or variation is already in the cart; updates quantity if so.
 * 3. Creates and saves a new cart item if the product/variation is not in the cart.
 * 4. Returns the updated cart.
 *
 * @param product - The Product entity to add to the cart.
 * @param productVariationId - Optional UUID of the product variation.
 * @param quantity - The quantity of the product to add.
 * @param userId - The UUID of the user adding the item to the cart.
 * @returns The updated Cart entity.
 */
export const addToCart = async (
  product: Product,
  productVariationId: string | undefined,
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

  // Check if the product/variation is already in the cart
  const existingItem = await cartRepository
    .createQueryBuilder("cart")
    .leftJoinAndSelect("cart.items", "items")
    .leftJoinAndSelect("items.product", "product")
    .leftJoinAndSelect("items.productVariation", "productVariation")
    .where("cart.createdBy = :userId", { userId })
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
    // Update quantity if item already exists
    const cartItem = existingItem.items.find(
      (item: CartItem) =>
        item.product.id === product.id &&
        (productVariationId
          ? item.productVariation?.id === productVariationId
          : !item.productVariation)
    );
    if (cartItem) {
      cartItem.quantity = quantity;
      await cartItemRepository.save(cartItem);
    }
  } else {
    // Check if the product/variation is already in the wishlist
    const existingItemToWishlist = await wishlistRepository
      .createQueryBuilder("wishlist")
      .leftJoinAndSelect("wishlist.items", "items")
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

    // Create a new cart item if not already in the cart
    const cartItem = cartItemRepository.create({
      quantity,
      product: { id: product.id } as any,
      productVariation: productVariationId
        ? { id: productVariationId as any }
        : null,
      cart: { id: cart.id } as any,
    });

    await cartItemRepository.save(cartItem);
    cart.items = [...(cart.items || []), cartItem];
    await cartRepository.save(cart);

    if (existingItemToWishlist) {
      existingItemToWishlist.items.find(
        (item: WishlistItem) =>
          item.product.id === product.id &&
          (productVariationId
            ? item.productVariation?.id === productVariationId
            : !item.productVariation)
      );

      // If the item already exists in the wishlist, remove it
      await wishlistRepository.remove(existingItemToWishlist);
    }
  }

  return getCartByUserId(userId);
};
