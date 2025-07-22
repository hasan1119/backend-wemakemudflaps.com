import { Coupon } from "../../../entities";
import { MutationUpdateCouponArgs } from "../../../types";
import { couponRepository } from "../repositories/repositories";
import { getCouponById } from "./get-coupon.service";

/**
 * Updates an existing coupon by its ID with new data.
 *
 * Workflow:
 * 1. Resolves new relations based on provided IDs.
 * 2. Updates only provided fields, replacing existing data.
 * 3. Returns the fully updated coupon entity with relations.
 *
 * @param couponId - The UUID of the coupon to update.
 * @param data - Fields to update.
 * @returns Updated Coupon entity.
 */
export const updateCoupon = async (
  couponId: string,
  data: Partial<MutationUpdateCouponArgs>
): Promise<Coupon> => {
  const {
    code,
    description,
    discountType,
    discountValue,
    freeShipping,
    expiryDate,
    maxUsage,
    minimumSpend,
    maximumSpend,
    allowedEmails,
    applicableProducts,
    excludedProducts,
    applicableCategories,
    excludedCategories,
  } = data;

  await couponRepository.update(couponId, {
    ...(code !== undefined && code !== null && { code: code.toLowerCase() }),
    ...(description !== undefined && description !== null && { description }),
    ...(discountType !== undefined &&
      discountType !== null && { discountType }),
    ...(discountValue !== undefined &&
      discountValue !== null && { discountValue }),
    ...(freeShipping !== undefined &&
      freeShipping !== null && { freeShipping }),
    ...(expiryDate !== undefined && expiryDate !== null && { expiryDate }),
    ...(maxUsage !== undefined && maxUsage !== null && { maxUsage }),
    ...(minimumSpend !== undefined &&
      minimumSpend !== null && { minimumSpend }),
    ...(maximumSpend !== undefined &&
      maximumSpend !== null && { maximumSpend }),
    ...(allowedEmails !== undefined &&
      allowedEmails !== null && {
        allowedEmails: allowedEmails.length ? allowedEmails : null,
      }),
    ...(applicableProducts !== undefined &&
      applicableProducts !== null && {
        applicableProducts: applicableProducts.length
          ? applicableProducts.map((id) => ({ id }))
          : null,
      }),
    ...(excludedProducts !== undefined &&
      excludedProducts !== null && {
        excludedProducts: excludedProducts.length
          ? excludedProducts.map((id) => ({ id }))
          : null,
      }),
    ...(applicableCategories !== undefined &&
      applicableCategories !== null && {
        applicableCategories: applicableCategories.length
          ? applicableCategories.map((id) => ({ id }))
          : null,
      }),
    ...(excludedCategories !== undefined &&
      excludedCategories !== null && {
        excludedCategories: excludedCategories.length
          ? excludedCategories.map((id) => ({ id }))
          : null,
      }),
  });

  return await getCouponById(couponId);
};
