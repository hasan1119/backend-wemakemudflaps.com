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
export async function applyCoupon(
  coupons: Coupon[],
  userCart: Cart,
  userId: string
): Promise<Cart> {
  // Check for already applied coupons
  const appliedCoupons = await cartRepository
    .createQueryBuilder("cart")
    .leftJoinAndSelect("cart.coupons", "coupons")
    .where("cart.id = :cartId", { cartId: userCart.id })
    .andWhere("coupons.deletedAt IS NULL")
    .getOne();

  const appliedCouponIds = appliedCoupons?.coupons?.map((c) => c.id) || [];
  const newCouponIds = coupons
    .map((c) => c.id)
    .filter((id) => !appliedCouponIds.includes(id));

  if (newCouponIds.length === 0) {
    return userCart;
  }

  // Increment usage count for new coupons
  const newCoupons = coupons.filter((c) => newCouponIds.includes(c.id));
  for (const coupon of newCoupons) {
    coupon.usageCount = (coupon.usageCount || 0) + 1;
    await couponRepository.save(coupon);
  }

  // Update cart with new coupons
  userCart.coupons = [...(userCart.coupons || []), ...newCoupons];
  await cartRepository.save(userCart);

  return await getCartByUserId(userId);
}
