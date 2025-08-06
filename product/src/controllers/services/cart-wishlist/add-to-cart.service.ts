import { Cart, Product } from "../../../entities";
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
import { WishlistItem } from "../../../entities";

/**
 * Adds a product to the user's cart, handling all edge cases:
 * - Updates if product+variation exists.
 * - Converts a null-variation product to the given variation.
 * - Creates new if not found.
 * - Removes matched wishlist item.
 */
export const addToCart = async (
  product: Product,
  productVariationId: string | undefined,
  quantity: number,
  userId: string
): Promise<Cart> => {
  // Step 1: Get or create cart
  let cart = await getCartByUserId(userId);
  if (!cart) {
    cart = cartRepository.create({
      createdBy: userId,
      items: [],
      coupons: null,
    });
    await cartRepository.save(cart);
  }

  // Step 2: Load full cart with items
  const userCart = await cartRepository
    .createQueryBuilder("cart")
    .leftJoinAndSelect("cart.items", "items")
    .leftJoinAndSelect("items.product", "product")
    .leftJoinAndSelect("items.productVariation", "productVariation")
    .where("cart.createdBy = :userId", { userId })
    .andWhere("items.deletedAt IS NULL")
    .getOne();

  const allMatchingItems =
    userCart?.items.filter((item) => item.product.id === product.id) || [];

  // Case 1: Exact match (product + variation)
  const exactMatch = allMatchingItems.find((item) =>
    productVariationId
      ? item.productVariation?.id === productVariationId
      : !item.productVariation
  );

  if (exactMatch) {
    exactMatch.quantity = quantity;
    await cartItemRepository.save(exactMatch);
  } else if (productVariationId) {
    // Case 2: Find any one item with same product and null variation
    const nullVariationItem = allMatchingItems.find(
      (item) => item.productVariation === null
    );

    if (nullVariationItem) {
      // Update that item with the new variation
      nullVariationItem.productVariation = { id: productVariationId } as any;
      nullVariationItem.quantity = quantity;
      await cartItemRepository.save(nullVariationItem);
    } else {
      // Case 3: Create new cart item with product + variation
      const newCartItem = cartItemRepository.create({
        quantity,
        product: { id: product.id } as any,
        productVariation: { id: productVariationId } as any,
        cart: { id: cart.id } as any,
      });
      await cartItemRepository.save(newCartItem);
      cart.items = [...(cart.items || []), newCartItem];
      await cartRepository.save(cart);
    }
  } else {
    // Case 4: No variation provided and no exact match → create new
    const newCartItem = cartItemRepository.create({
      quantity,
      product: { id: product.id } as any,
      productVariation: null,
      cart: { id: cart.id } as any,
    });
    await cartItemRepository.save(newCartItem);
    cart.items = [...(cart.items || []), newCartItem];
    await cartRepository.save(cart);
  }

  // Step 3: Remove from wishlist (only matched item, not whole wishlist)
  const wishlist = await wishlistRepository
    .createQueryBuilder("wishlist")
    .leftJoinAndSelect("wishlist.items", "items")
    .leftJoinAndSelect("items.product", "product")
    .leftJoinAndSelect("items.productVariation", "productVariation")
    .where("wishlist.createdBy = :userId", { userId })
    .andWhere("items.deletedAt IS NULL")
    .getOne();

  if (wishlist) {
    const matchingWishlistItem = wishlist.items.find(
      (item: WishlistItem) =>
        item.product.id === product.id &&
        (productVariationId
          ? item.productVariation?.id === productVariationId
          : !item.productVariation)
    );

    if (matchingWishlistItem) {
      wishlist.items = wishlist.items.filter(
        (item) => item.id !== matchingWishlistItem.id
      );
      await wishlistRepository.save(wishlist);
    }
  }

  return getCartByUserId(userId);
};
