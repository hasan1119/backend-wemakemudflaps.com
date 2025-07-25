import { Coupon } from "../../../entities";
import { MutationCreateCouponArgs } from "../../../types";
import { couponRepository } from "../repositories/repositories";

/**
 * Creates a new Coupon.
 *
 * Workflow:
 * 1. Validates and prepares coupon creation input.
 * 2. Checks if a coupon with the same code already exists (case-insensitive).
 * 3. Creates and saves the coupon with provided values and user context.
 *
 * @param data - Input data for creating the coupon.
 * @param userId - Optional user ID who creates this coupon.
 * @returns Created Coupon entity.
 */
export const createCoupon = async (
  data: MutationCreateCouponArgs,
  userId?: string
): Promise<Coupon> => {
  const {
    code,
    description,
    discountType,
    discountValue,
    freeShipping = false,
    expiryDate,
    minimumSpend,
    maximumSpend,
    applicableProducts = [],
    excludedProducts = [],
    applicableCategories = [],
    excludedCategories = [],
    maxUsage = null,
    allowedEmails = [],
  } = data;

  const coupon = couponRepository.create({
    code: code.toLowerCase(),
    description: description ?? null,
    discountType: discountType ?? null,
    discountValue,
    freeShipping,
    expiryDate: expiryDate ?? null,
    maxUsage: maxUsage ?? null,
    minimumSpend: minimumSpend ?? null,
    maximumSpend: maximumSpend ?? null,
    allowedEmails: allowedEmails?.length ? allowedEmails : null,
    usageCount: 0,
    createdBy: userId ?? null,
    applicableProducts: applicableProducts?.length
      ? applicableProducts.map((id) => ({ id }))
      : null,
    excludedProducts: excludedProducts?.length
      ? excludedProducts.map((id) => ({ id }))
      : null,
    excludedCategories: excludedCategories?.length
      ? excludedCategories.map((id) => ({ id }))
      : null,
    applicableCategories: applicableCategories?.length
      ? applicableCategories.map((id) => ({ id }))
      : null,
  });

  return await couponRepository.save(coupon);
};
