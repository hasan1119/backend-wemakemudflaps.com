import CONFIG from "../../../config/config";
import { Context } from "../../../context";
import {
  ApplyCouponResponseOrError,
  MutationApplyCouponArgs,
} from "../../../types";
import { applyCouponSchema } from "../../../utils/data-validation";
import {
  applyCoupon as applyCouponService,
  checkUserAuth,
  findCouponsByCodes,
  getCartByUserId,
  mapProductRecursive,
  mapProductVariationRecursive,
} from "../../services";

/**
 * Applies a coupon to the user's cart.
 *
 * Workflow:
 * 1. Validates user authentication.
 * 2. Validates input data against Zod schema.
 * 3. Fetches the user's cart.
 * 4. Validates coupon codes against existing coupons.
 * 5. Calls the service to apply the coupon to the cart.
 * 6. Returns the updated cart with coupon details.
 *
 * @param _ - Unused parent argument for GraphQL resolver
 * @param args - Arguments for the mutation, including coupon codes
 * @param user - Authenticated user context
 * @returns The updated cart or an error response
 */
export const applyCoupon = async (
  _: any,
  args: MutationApplyCouponArgs,
  { user }: Context
): Promise<ApplyCouponResponseOrError> => {
  try {
    // Verify user authentication
    const authError = checkUserAuth(user);
    if (authError) return authError;

    // Validate input data with Zod schema
    const result = await applyCouponSchema.safeParseAsync(args);
    if (!result.success) {
      const errors = result.error.errors.map((e) => ({
        field: e.path.join("."),
        message: e.message,
      }));

      return {
        statusCode: 400,
        success: false,
        message: "Validation failed",
        errors,
        __typename: "ErrorResponse",
      };
    }

    const userCart = await getCartByUserId(user.id);

    if (!userCart) {
      return {
        statusCode: 404,
        success: false,
        message: "Cart not found",
        __typename: "ErrorResponse",
      };
    }

    const { couponCodes } = result.data;

    const coupons = await findCouponsByCodes(couponCodes);

    if (coupons.length !== couponCodes.length) {
      return {
        statusCode: 400,
        success: false,
        message: "One or more coupon codes are invalid",
      };
    }

    for (const coupon of coupons) {
      if (
        coupon.allowedEmails?.length &&
        !coupon.allowedEmails.includes(user.email)
      ) {
        return {
          statusCode: 403,
          success: false,
          message: `Coupon ${coupon.code} is not allowed for your email address.`,
          __typename: "ErrorResponse",
        };
      }

      if (coupon.expiryDate && new Date(coupon.expiryDate) < new Date()) {
        return {
          statusCode: 400,
          success: false,
          message: `Coupon ${coupon.code} has expired.`,
          __typename: "ErrorResponse",
        };
      }

      // Check if coupon is applicable to the total cart price
      // if (coupon.minimumSpend && userCart.items< coupon.minimumSpend) {
      //   return {
      //     statusCode: 400,
      //     success: false,
      //     message: `Coupon ${coupon.code} requires a minimum spend of ${coupon.minimumSpend}.`,
      //     __typename: "ErrorResponse",
      //   };
      // }

      // if(coupon.maximumSpend && userCart.items > coupon.maximumSpend) {
      //   return {
      //     statusCode: 400,
      //     success: false,
      //     message: `Coupon ${coupon.code} cannot be applied to a cart total exceeding ${coupon.maximumSpend}.`,
      //     __typename: "ErrorResponse",
      //   };
      // }

      // Check if coupon is applicable to the user's cart items
      const applicableToCartItems = userCart.items?.some((item) => {
        const product = item.product;
        if (!product) return false;

        // Check if coupon is applicable to any of the product's categories
        const isApplicableCategory = product.categories?.some((cat) =>
          coupon.applicableCategories?.some((c) => c.id === cat.id)
        );

        // Check if coupon is applicable to the product itself
        const isApplicableProduct = coupon.applicableProducts?.some(
          (p) => p.id === product.id
        );

        return (
          isApplicableCategory ||
          isApplicableProduct ||
          (!coupon.applicableCategories?.length &&
            !coupon.applicableProducts?.length)
        );
      });

      if (!applicableToCartItems) {
        return {
          statusCode: 400,
          success: false,
          message: `Coupon ${coupon.code} is not applicable to your cart items.`,
          __typename: "ErrorResponse",
        };
      }

      const excludedFromCartItems = userCart.items?.some((item) => {
        const product = item.product;
        if (!product) return false;

        // Check if coupon excludes any of the product's categories
        const isExcludedCategory = product.categories?.some((cat) =>
          coupon.excludedCategories?.some((c) => c.id === cat.id)
        );

        // Check if coupon excludes the product itself
        const isExcludedProduct = coupon.excludedProducts?.some(
          (p) => p.id === product.id
        );

        return (
          isExcludedCategory ||
          isExcludedProduct ||
          coupon.excludedCategories?.length > 0 ||
          coupon.excludedProducts?.length > 0
        );
      });

      if (excludedFromCartItems) {
        return {
          statusCode: 400,
          success: false,
          message: `Coupon ${coupon.code} cannot be applied to some items in your cart.`,
          __typename: "ErrorResponse",
        };
      }

      // Check if coupon has reached its maximum usage limit
      if (coupon.maxUsage !== null && coupon.usageCount >= coupon.maxUsage) {
        return {
          statusCode: 400,
          success: false,
          message: `Coupon ${coupon.code} has reached its maximum usage limit.`,
          __typename: "ErrorResponse",
        };
      }

      // if (coupon.discountType === "percentage" && coupon.discountValue <= 0) {
      //   return {
      //     statusCode: 400,
      //     success: false,
      //     message: `Coupon ${coupon.code} has an invalid discount value.`,
      //     __typename: "ErrorResponse",
      //   };
      // }
      // if (
      //   coupon.discountType === "fixed" &&
      //   (coupon.discountValue <= 0 || coupon.discountValue > userCart.totalPrice)
      // ) {
      //   return {
      //     statusCode: 400,
      //     success: false,
      //     message: `Coupon ${coupon.code} has an invalid discount value.`,
      //     __typename: "ErrorResponse",
      //   };
      // }
      // if (
      //   coupon.discountType === "fixed_product" &&
      //   (coupon.discountValue <= 0 ||
      //     coupon.discountValue > userCart.items.reduce(
      //       (total, item) => total + (item.product?.salePrice || 0),
      //       0
      //     ))
      // ) {
      //   return {
      //     statusCode: 400,
      //     success: false,
      //     message: `Coupon ${coupon.code} has an invalid discount value.`,
      //     __typename: "ErrorResponse",
      //   };
      // }
    }

    // Apply coupons to the user's cart
    const cart = await applyCouponService(coupons, userCart, user.id);

    return {
      statusCode: 200,
      success: true,
      message: "Coupons applied successfully",
      cart: {
        id: cart.id,
        items: await Promise.all(
          (cart.items ?? []).map(async (item) => ({
            id: item.id,
            quantity: item.quantity,
            product: await mapProductRecursive(item.product),
            productVariation: item.productVariation
              ? await mapProductVariationRecursive(item.productVariation)
              : null,
          }))
        ),
        coupons: (cart.coupons ?? []).map((coupon) => ({
          id: coupon.id,
          code: coupon.code,
          description: coupon.description ?? null,
          discountType: coupon.discountType,
          discountValue: coupon.discountValue,
          allowedEmails: coupon.allowedEmails ?? [],
          applicableCategories: (coupon.applicableCategories ?? []).map(
            (cat) => ({
              id: cat.id,
              name: cat.name,
            })
          ),
          excludedCategories: (coupon.excludedCategories ?? []).map((cat) => ({
            id: cat.id,
            name: cat.name,
          })),
          applicableProducts: (coupon.applicableProducts ?? []).map((prod) => ({
            id: prod.id,
            name: prod.name,
          })),
          excludedProducts: (coupon.excludedProducts ?? []).map((prod) => ({
            id: prod.id,
            name: prod.name,
          })),
          freeShipping: coupon.freeShipping ?? false,
          usageCount: coupon.usageCount ?? 0,
          maximumSpend: coupon.maximumSpend ?? null,
          minimumSpend: coupon.minimumSpend ?? null,
          maxUsage: coupon.maxUsage ?? null,
          expiryDate:
            coupon.expiryDate instanceof Date
              ? coupon.expiryDate.toISOString()
              : coupon.expiryDate ?? null,
          createdBy: coupon.createdBy as any,
          createdAt:
            coupon.createdAt instanceof Date
              ? coupon.createdAt.toISOString()
              : coupon.createdAt ?? null,
          deletedAt:
            coupon.deletedAt instanceof Date
              ? coupon.deletedAt.toISOString()
              : coupon.deletedAt ?? null,
        })),
        createdBy: cart.createdBy as any,
        createdAt:
          cart.createdAt instanceof Date
            ? cart.createdAt.toISOString()
            : cart.createdAt ?? null,
        deletedAt:
          cart.deletedAt instanceof Date
            ? cart.deletedAt.toISOString()
            : cart.deletedAt ?? null,
      },
      __typename: "CartResponse",
    };
  } catch (error: any) {
    console.error("Error applying coupon:", error);
    return {
      statusCode: 500,
      success: false,
      message:
        CONFIG.NODE_ENV === "production"
          ? "Something went wrong, please try again."
          : error.message || "Internal server error",
      __typename: "ErrorResponse",
    };
  }
};
