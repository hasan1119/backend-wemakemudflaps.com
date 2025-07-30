import { z } from "zod";

/**
 * Defines the schema for validating input when adding a product to the cart.
 *
 * Workflow:
 * 1. Validates productId as a required UUID.
 * 2. Validates productVariationId as an optional and nullable UUID.
 * 3. Ensures quantity is a number >= 1.
 *
 * @property productId - UUID of the product being added to cart.
 * @property productVariationId - Optional UUID of the selected product variation.
 * @property quantity - Number of items to add (minimum: 1).
 */
export const addToCartSchema = z.object({
  productId: z.string().uuid({ message: "Invalid product ID format" }),
  productVariationId: z
    .string()
    .uuid({ message: "Invalid product variation ID format" })
    .optional()
    .nullable(),
  quantity: z.number().min(1, "Quantity must be at least 1"),
});

/**
 * Defines the schema for validating input when adding a product to the wishlist.
 *
 * Workflow:
 * 1. Validates productId as a required UUID.
 * 2. Validates productVariationId as an optional and nullable UUID.
 *
 * @property productId - UUID of the product being added to wishlist.
 * @property productVariationId - Optional UUID of the selected product variation.
 */
export const addToWishListSchema = z.object({
  productId: z.string().uuid({ message: "Invalid product ID format" }),
  productVariationId: z
    .string()
    .uuid({ message: "Invalid product variation ID format" })
    .optional()
    .nullable(),
});

/**
 * Defines the schema for validating input when updating a cart item.
 *
 * Workflow:
 * 1. Validates cartItemId and productId as required UUIDs.
 * 2. Ensures quantity is a number >= 1.
 *
 * @property cartItemId - UUID of the cart item to be updated.
 * @property productId - UUID of the associated product.
 * @property quantity - Updated quantity (minimum: 1).
 */
export const updateCartItemSchema = z.object({
  productId: z.string().uuid({ message: "Invalid product ID format" }),
  quantity: z.number().min(1, "Quantity must be at least 1"),
});

/**
 * Defines the schema for validating input when applying coupons.
 *
 * Workflow:
 * 1. Validates couponCodes as an array of non-empty strings.
 *
 * @property couponCodes- Array of coupon code strings (each must be non-empty).
 */
export const applyCouponSchema = z.object({
  couponCodes: z.array(z.string().min(1, "Coupon code cannot be empty"), {
    message: "Coupon code must be a string",
  }),
});
