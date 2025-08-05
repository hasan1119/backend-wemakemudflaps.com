import CONFIG from "../../../config/config";
import { Context } from "../../../context";
import {
  AddToCartOrWishListResponseOrError,
  MutationAddToCartArgs,
} from "../../../types";
import { addToCartSchema } from "../../../utils/data-validation";
import {
  addToCart as addToCartService,
  checkUserAuth,
  getProductById,
  mapProductRecursive,
  mapProductVariationRecursive,
} from "../../services";

/**
 * Adds a product to the user's cart.
 *
 * Workflow:
 * 1. Validates user authentication.
 * 2. Validates input data against Zod schema.
 * 3. Checks if the product exists and if the variation is valid.
 * 4. Calls the service to add the product to the cart.
 * 5. Returns the updated cart with product details.
 *
 * @param _ - Unused parent argument for GraphQL resolver
 * @param args - Arguments containing productId, productVariationId, and quantity
 * @param user - Authenticated user context
 * @returns The updated cart or an error response
 */
export const addToCart = async (
  _: any,
  args: MutationAddToCartArgs,
  { user }: Context
): Promise<AddToCartOrWishListResponseOrError> => {
  try {
    // Verify user authentication
    const authError = checkUserAuth(user);
    if (authError) return authError;

    // Validate input data with Zod schema
    const result = await addToCartSchema.safeParseAsync(args);
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

    const { productId, productVariationId, quantity } = result.data;

    const product = await getProductById(productId);

    if (!product || !product.isVisible) {
      return {
        statusCode: 404,
        success: false,
        message: !product.isVisible
          ? "Product is not available"
          : "Product not found",
        __typename: "BaseResponse",
      };
    }

    if (product.soldIndividually === false) {
      if (quantity === 1) {
        return {
          statusCode: 400,
          success: false,
          message: "This product can't be purchased individually",
          __typename: "BaseResponse",
        };
      }
    }

    if (product.stockStatus === "OUT_OF_STOCK") {
      return {
        statusCode: 400,
        success: false,
        message: "Product is out of stock",
        __typename: "BaseResponse",
      };
    }

    // Check if product variation exists
    if (product.variations) {
      if (!productVariationId) {
        return {
          statusCode: 400,
          success: false,
          message: "Product variation ID is required",
          __typename: "BaseResponse",
        };
      }

      const variation = product.variations?.find(
        (v) => v.id === productVariationId
      );
      if (!variation) {
        return {
          statusCode: 404,
          success: false,
          message: "Product variation not found",
          __typename: "BaseResponse",
        };
      }

      if (variation.stockStatus === "OUT_OF_STOCK") {
        return {
          statusCode: 400,
          success: false,
          message: "Product variation is out of stock",
          __typename: "BaseResponse",
        };
      }
    }

    const cart = await addToCartService(
      product,
      productVariationId ?? null,
      quantity,
      user.id
    );

    return {
      statusCode: 200,
      success: true,
      message: "Item added to cart successfully",
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
    console.error("Error adding to cart:", error);
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
