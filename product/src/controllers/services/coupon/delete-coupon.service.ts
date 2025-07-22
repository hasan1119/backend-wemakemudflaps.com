import { Coupon } from "../../../entities";
import { couponRepository } from "../repositories/repositories";
import { getCouponById } from "./get-coupon.service";

/**
 * Soft deletes a coupon by setting its deletedAt timestamp.
 *
 * @param couponId - The UUID of the coupon to soft delete.
 * @returns The soft-deleted Coupon entity.
 */
export const softDeleteCoupon = async (couponId: string): Promise<Coupon> => {
  await couponRepository.update({ id: couponId }, { deletedAt: new Date() });
  const softDeletedCoupon = await getCouponById(couponId);
  return softDeletedCoupon;
};

/**
 * Permanently deletes a coupon from the database.
 *
 * @param couponId - The UUID of the coupon to hard delete.
 */
export const hardDeleteCoupon = async (couponId: string): Promise<void> => {
  await couponRepository.delete({ id: couponId });
};
