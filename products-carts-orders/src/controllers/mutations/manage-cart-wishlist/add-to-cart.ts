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
 * 4. Validates quantity against product/variation constraints (minQuantity, maxQuantity, quantityStep, stock, soldIndividually).
 * 5. Calls the service to add the product to the cart.
 * 6. Returns the updated cart with product details.
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

    // Ensure quantity is a positive integer
    if (!Number.isInteger(quantity) || quantity <= 0) {
      return {
        statusCode: 400,
        success: false,
        message: "Quantity must be a positive integer",
        __typename: "BaseResponse",
      };
    }

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

    // Validate soldIndividually
    if (product.soldIndividually && quantity !== 1) {
      return {
        statusCode: 400,
        success: false,
        message:
          "This product can only be purchased individually (quantity must be 1)",
        __typename: "BaseResponse",
      };
    }

    // Validate stock status and stock quantity
    if (
      product.stockStatus === "OUT_OF_STOCK" &&
      product.allowBackOrders === "DONT_ALLOW"
    ) {
      return {
        statusCode: 400,
        success: false,
        message: "Product is out of stock",
        __typename: "BaseResponse",
      };
    }
    if (
      product.manageStock &&
      product.stockQuantity !== null &&
      quantity > product.stockQuantity &&
      product.allowBackOrders === "DONT_ALLOW"
    ) {
      return {
        statusCode: 400,
        success: false,
        message: `Requested quantity (${quantity}) exceeds available stock (${product.stockQuantity})`,
        __typename: "BaseResponse",
      };
    }

    // Validate quantity constraints for simple products
    if (product.productConfigurationType === "SIMPLE_PRODUCT") {
      if (product.minQuantity !== null && quantity < product.minQuantity) {
        return {
          statusCode: 400,
          success: false,
          message: `Quantity must be at least ${product.minQuantity}`,
          __typename: "BaseResponse",
        };
      }
      if (product.maxQuantity !== null && quantity > product.maxQuantity) {
        return {
          statusCode: 400,
          success: false,
          message: `Quantity cannot exceed ${product.maxQuantity}`,
          __typename: "BaseResponse",
        };
      }
      if (product.quantityStep && quantity % product.quantityStep !== 0) {
        return {
          statusCode: 400,
          success: false,
          message: `Quantity must be a multiple of ${product.quantityStep}`,
          __typename: "BaseResponse",
        };
      }

      // Validate tiered pricing (if applicable)
      const tierPricingInfo = await product.tierPricingInfo;
      if (tierPricingInfo && tierPricingInfo.tieredPrices) {
        const tieredPrices = await tierPricingInfo.tieredPrices;
        const applicableTier = tieredPrices.find(
          (tier) =>
            tier.minQuantity !== null &&
            tier.maxQuantity !== null &&
            quantity >= tier.minQuantity &&
            quantity <= tier.maxQuantity
        );
        if (!applicableTier && tieredPrices.length > 0) {
          return {
            statusCode: 400,
            success: false,
            message: `Quantity does not match any tiered pricing range`,
            __typename: "BaseResponse",
          };
        }
      }
    }

    // Validate for variable products
    let variation = null;
    if (product.productConfigurationType !== "SIMPLE_PRODUCT") {
      if (!product.variations || product.variations.length === 0) {
        return {
          statusCode: 400,
          success: false,
          message: "Product variations are not available",
          __typename: "BaseResponse",
        };
      }

      if (!productVariationId) {
        return {
          statusCode: 400,
          success: false,
          message: "Product variation ID is required",
          __typename: "BaseResponse",
        };
      }

      variation = product.variations.find((v) => v.id === productVariationId);
      if (!variation) {
        return {
          statusCode: 404,
          success: false,
          message: "Product variation not found",
          __typename: "BaseResponse",
        };
      }

      if (!variation.isActive) {
        return {
          statusCode: 400,
          success: false,
          message: "Product variation is not active",
          __typename: "BaseResponse",
        };
      }

      if (
        variation.stockStatus === "OUT_OF_STOCK" &&
        product.allowBackOrders === "DONT_ALLOW"
      ) {
        return {
          statusCode: 400,
          success: false,
          message: "Product variation is out of stock",
          __typename: "BaseResponse",
        };
      }

      // Validate quantity constraints for variation
      if (variation.minQuantity !== null && quantity < variation.minQuantity) {
        return {
          statusCode: 400,
          success: false,
          message: `Quantity must be at least ${variation.minQuantity}`,
          __typename: "BaseResponse",
        };
      }
      if (variation.maxQuantity !== null && quantity > variation.maxQuantity) {
        return {
          statusCode: 400,
          success: false,
          message: `Quantity cannot exceed ${variation.maxQuantity}`,
          __typename: "BaseResponse",
        };
      }
      if (variation.quantityStep && quantity % variation.quantityStep !== 0) {
        return {
          statusCode: 400,
          success: false,
          message: `Quantity must be a multiple of ${variation.quantityStep}`,
          __typename: "BaseResponse",
        };
      }

      // Validate tiered pricing for variation (if applicable)
      const tierPricingInfo = await variation.tierPricingInfo;
      if (tierPricingInfo && tierPricingInfo.tieredPrices) {
        const tieredPrices = await tierPricingInfo.tieredPrices;
        const applicableTier = tieredPrices.find(
          (tier) =>
            tier.minQuantity !== null &&
            tier.maxQuantity !== null &&
            quantity >= tier.minQuantity &&
            quantity <= tier.maxQuantity
        );
        if (!applicableTier && tieredPrices.length > 0) {
          return {
            statusCode: 400,
            success: false,
            message: `Quantity does not match any tiered pricing range for variation`,
            __typename: "BaseResponse",
          };
        }
      }
    }

    const cart = await addToCartService(
      product,
      product.productConfigurationType !== "SIMPLE_PRODUCT"
        ? productVariationId ?? null
        : null,
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
