import { Cart, Coupon } from "../../../entities";
import { cartRepository, couponRepository } from "../repositories/repositories";
import { getCartByUserId } from "./get-cart.service";

/**
 * Applies coupons to the user's cart.
 *
 * Workflow:
 * 1. Validates the coupon codes against valid coupons.
 * 2. Checks if any valid coupons are already applied to the cart.
 * 3. If not, increments usage count and adds new coupons to the cart.
 * 4. Returns the updated cart.
 *
 * @param couponCodes - Array of coupon codes to apply.
 * @param userCart - The Cart entity of the user.
 * @param userId - The UUID of the user applying the coupons.
 * @returns The updated Cart entity with applied coupons.
 */
export const applyCoupon = async (
  couponCodes: Coupon[],
  userCart: Cart,
  userId: string
): Promise<Cart> => {
  //Validate coupon codes against valid coupons
  const validCouponIds = couponCodes.map((c) => c.id);

  // Check if all valid coupons are already applied using TypeORM
  const appliedCoupons = await cartRepository
    .createQueryBuilder("cart")
    .leftJoinAndSelect("cart.coupons", "coupons")
    .where("cart.id = :cartId", { cartId: userCart.id })
    .andWhere("coupons.id IN (:...validCouponIds)", { validCouponIds })
    .andWhere("coupons.deletedAt IS NULL")
    .getMany();

  const appliedCouponIds = appliedCoupons.map((c) => c.id);

  //  Check if any valid coupon is not already applied
  const newCouponIds = validCouponIds.filter(
    (id) => !appliedCouponIds.includes(id)
  );

  if (newCouponIds.length === 0) {
    // All coupons already applied — return cart
    return userCart;
  }

  //  Increment usage and fetch new coupon entities
  const newCoupons = couponCodes.filter((c) => newCouponIds.includes(c.id));

  for (const coupon of newCoupons) {
    coupon.usageCount = (coupon.usageCount || 0) + 1;
    await couponRepository.save(coupon);
  }

  //  Append new coupons to cart and save
  userCart.coupons = [...(userCart.coupons || []), ...newCoupons];
  await cartRepository.save(userCart);

  return await getCartByUserId(userId);
};
