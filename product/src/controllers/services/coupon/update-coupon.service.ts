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
 * 3. Treats `null` values for product/category relations as empty lists (clearing).
 * 4. Returns the fully updated coupon entity with relations.
 *
 * @param data - Fields to update.
 * @param coupon - Existing Coupon entity to update.
 * @returns Updated Coupon entity.
 */
export const updateCoupon = async (
  data: MutationUpdateCouponArgs,
  coupon: Coupon
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

  if (code !== undefined && code !== null) coupon.code = code.toLowerCase();
  if (description !== undefined && description !== null)
    coupon.description = description;
  if (discountType !== undefined && discountType !== null)
    coupon.discountType = discountType;
  if (discountValue !== undefined && discountValue !== null)
    coupon.discountValue = discountValue;
  if (freeShipping !== undefined && freeShipping !== null)
    coupon.freeShipping = freeShipping;
  if (expiryDate !== undefined) coupon.expiryDate = new Date(expiryDate);
  if (maxUsage !== undefined) coupon.maxUsage = maxUsage;
  if (minimumSpend !== undefined) coupon.minimumSpend = minimumSpend;
  if (maximumSpend !== undefined) coupon.maximumSpend = maximumSpend;
  if (allowedEmails !== undefined) coupon.allowedEmails = allowedEmails ?? [];
  if (applicableProducts !== undefined) {
    coupon.applicableProducts =
      applicableProducts === null
        ? []
        : (applicableProducts.map((id) => ({ id })) as any);
  }
  if (excludedProducts !== undefined) {
    coupon.excludedProducts =
      excludedProducts === null
        ? []
        : (excludedProducts.map((id) => ({ id })) as any);
  }
  if (applicableCategories !== undefined) {
    coupon.applicableCategories =
      applicableCategories === null
        ? []
        : (applicableCategories.map((id) => ({ id })) as any);
  }
  if (excludedCategories !== undefined) {
    coupon.excludedCategories =
      excludedCategories === null
        ? []
        : (excludedCategories.map((id) => ({ id })) as any);
  }

  // Save the updated coupon entity
  await couponRepository.save(coupon);

  return await getCouponById(coupon.id);
};
