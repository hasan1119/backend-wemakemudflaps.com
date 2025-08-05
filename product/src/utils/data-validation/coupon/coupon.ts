import { z } from "zod";
import { SortOrderTypeEnum } from "../common/common";


/**
 * Defines the schema for validating a single coupon object creation input.
 *
 * Workflow:
 * 1. Validates thumbnail as an optional URL.
 * 2. Ensures codes are non-empty strings with a minimum length of 1 characters.
 *
 * @property code - Coupon code (minimum 1 characters).
 * @property description - Optional coupon description (minimum 1 characters).
 * @property discountType - Coupon discount type (one of the defined enum values).
 * @property freeShipping - Optional boolean indicating if the coupon provides free shipping.
 * @property discountValue - Positive number representing the discount value.
 * @property maxUsage - Optional positive number representing the maximum usage count.
 * @property expiryDate - Optional string representing the expiration date of the coupon.
 * @property minimumSpend - Optional positive number representing the minimum spend required to apply the coupon.
 * @property maximumSpend - Optional positive number representing the maximum spend allowed to apply the coupon.
 * @property applicableProducts - Optional array of UUIDs representing products the coupon applies to.
 * @property excludedProducts - Optional array of UUIDs representing products the coupon does not apply to.
 * @property applicableCategories - Optional array of UUIDs representing categories the coupon applies to.
 * @property excludedCategories - Optional array of UUIDs representing categories the coupon does not apply to.
 * @property allowedEmails - Optional array of email addresses that can use the coupon.
 */
export const createCouponSchema = z.object({
  code: z.string().min(1, "Coupon code must be at least 1 character").trim(),
  description: z
    .string()
    .min(1, "Coupon description must be at least 1 character")
    .trim()
    .optional()
    .nullable(),
  discountType: z.enum(["PERCENTAGE_DISCOUNT", "FIXED_CART_DISCOUNT", "FIXED_PRODUCT_DISCOUNT"]),
  freeShipping: z.boolean().optional().nullable(),
  discountValue: z
    .number()
    .positive("Discount value must be a positive number"),
  maxUsage: z
    .number()
    .positive("Maximum usage must be a positive number")
    .optional()
    .nullable(),
  expiryDate: z
    .string()
    .datetime({ message: "Invalid date format" })
    .nullable()
    .optional(),
  minimumSpend: z
    .number()
    .positive("Minimum spend must be a positive number")
    .optional()
    .nullable(),
  maximumSpend: z
    .number()
    .positive("Maximum spend must be a positive number")
    .optional()
    .nullable(),
  applicableProducts: z
    .array(z.string().uuid({ message: "Invalid UUID format" }))
    .min(1, { message: "At least one UUID is required" })
    .optional()
    .nullable(),
  excludedProducts: z
    .array(z.string().uuid({ message: "Invalid UUID format" }))
    .min(1, { message: "At least one UUID is required" })
    .optional()
    .nullable(),
  applicableCategories: z
    .array(z.string().uuid({ message: "Invalid UUID format" }))
    .min(1, { message: "At least one UUID is required" })
    .optional()
    .nullable(),
  excludedCategories: z
    .array(z.string().uuid({ message: "Invalid UUID format" }))
    .min(1, { message: "At least one UUID is required" })
    .optional()
    .nullable(),
  allowedEmails: z
    .array(z.string().email({ message: "Invalid email address" }))
    .optional()
    .nullable(),
});

/**
 * Defines the schema for validating updates to a coupon object.
 *
 * Workflow:
 * 1. Validates that at least one field besides `id` is provided for update.
 * 2. Ensures all fields are optional except for `id`.
 *
 * @property id - Required UUID string representing the coupon to update.
 * @property code - Optional string representing an updated coupon code.
 * @property description - Optional string representing an updated coupon description.
 * @property discountType - Optional enum indicating the updated discount type.
 * @property freeShipping - Optional boolean indicating if the coupon provides free shipping.
 * @property discountValue - Optional positive number representing the updated discount value.
 * @property maxUsage - Optional positive number representing the updated maximum usage count.
 * @property expiryDate - Optional string representing the updated expiration date of the coupon.
 * @property minimumSpend - Optional positive number representing the updated minimum spend required to apply the coupon.
 * @property maximumSpend - Optional positive number representing the updated maximum spend allowed to apply the coupon.
 * @property applicableProducts - Optional array of UUIDs representing products the coupon applies to.
 * @property excludedProducts - Optional array of UUIDs representing products the coupon does not apply to.
 * @property applicableCategories - Optional array of UUIDs representing categories the coupon applies to.
 * @property excludedCategories - Optional array of UUIDs representing categories the coupon does not apply to.
 * @property allowedEmails - Optional array of email addresses that can use the coupon.
 *
 * Validation ensures that at least one field besides `id` is provided for update.
 */
export const updateCouponSchema = z
  .object({
    id: z.string().uuid({ message: "Invalid UUID format" }),
    code: z
      .string()
      .min(1, "Coupon code must be at least 1 character")
      .trim()
      .optional(),
    description: z
      .string()
      .min(1, "Coupon description must be at least 1 character")
      .trim()
      .optional()
      .nullable(),
    discountType: z.enum(["PERCENTAGE_DISCOUNT", "FIXED_CART_DISCOUNT", "FIXED_PRODUCT_DISCOUNT"]).optional().nullable(),
    freeShipping: z.boolean().optional().nullable(),
    discountValue: z
      .number()
      .positive("Discount value must be a positive number")
      .optional()
      .nullable(),
    maxUsage: z
      .number()
      .positive("Maximum usage must be a positive number")
      .optional()
      .nullable(),
    expiryDate: z
      .string()
      .datetime({ message: "Invalid date format" })
      .optional()
      .nullable(),
    minimumSpend: z
      .number()
      .positive("Minimum spend must be a positive number")
      .optional()
      .nullable(),
    maximumSpend: z
      .number()
      .positive("Maximum spend must be a positive number")
      .optional()
      .nullable(),
    applicableProducts: z
      .array(z.string().uuid({ message: "Invalid UUID format" }))
      .optional()
      .nullable(),
    excludedProducts: z
      .array(z.string().uuid({ message: "Invalid UUID format" }))
      .optional()
      .nullable(),
    applicableCategories: z
      .array(z.string().uuid({ message: "Invalid UUID format" }))
      .optional()
      .nullable(),
    excludedCategories: z
      .array(z.string().uuid({ message: "Invalid UUID format" }))
      .optional()
      .nullable(),
    allowedEmails: z
      .array(z.string().email({ message: "Invalid email address" }))
      .optional()
      .nullable(),
  })
  .refine(
    (data) =>
      Object.keys(data).some(
        (key) => key !== "id" && data[key as keyof typeof data] !== undefined
      ),
    {
      message: "At least one field must be provided for update besides id",
      path: [],
    }
  );

/**
 * Defines the schema for validating coupon sorting parameters.
 *
 * Workflow:
 * 1. Validates sortBy as one of the allowed fields (code, createdAt).
 * 2. Validates sortOrder as either 'asc' or 'desc'.
 * 3. Allows both fields to be nullable or optional.
 *
 * @property sortBy - Field to sort by (code, createdAt).
 * @property sortOrder - Sort order direction (asc, desc).
 */
export const couponsSortingSchema = z.object({
  sortBy: z
    .enum(["code", "createdAt"], {
      message: "Sort field must be one of: code, createdAt",
    })
    .nullable()
    .optional(),
  sortOrder: SortOrderTypeEnum,
});
