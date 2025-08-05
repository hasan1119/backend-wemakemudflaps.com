import CONFIG from "../../../config/config";
import { Context } from "../../../context";
import {
  MutationUpdateCartItemArgs,
  UpdateCartOrWishListResponseOrError,
} from "../../../types";
import { updateCartItemSchema } from "../../../utils/data-validation";
import {
  checkUserAuth,
  getCartByUserId,
  getProductById,
  mapProductRecursive,
  mapProductVariationRecursive,
  updateCartItem as updateCartItemService,
} from "../../services";

/**
 * Updates an item in the user's cart.
 *
 * @param _ - Unused parent argument
 * @param args - Arguments containing productId and quantity
 * @param user - Context containing user information
 * @returns A response object containing the updated cart or an error
 */
export const updateCartItem = async (
  _: any,
  args: MutationUpdateCartItemArgs,
  { user }: Context
): Promise<UpdateCartOrWishListResponseOrError> => {
  try {
    // Verify user authentication
    const authError = checkUserAuth(user);
    if (authError) return authError;

    // Validate input data with Zod schema
    const result = await updateCartItemSchema.safeParseAsync(args);
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

    const product = await getProductById(result.data.productId);

    if (!product || !product.isVisible) {
      return {
        statusCode: 404,
        success: false,
        message: !product.isVisible
          ? "Product is not available"
          : "Product not found",
        __typename: "ErrorResponse",
      };
    }

    if (product.soldIndividually === false) {
      if (args.quantity === 1) {
        return {
          statusCode: 400,
          success: false,
          message: "This product can't be purchased individually",
          __typename: "BaseResponse",
        };
      }
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

    const updatedCart = await updateCartItemService(
      result.data.productId,
      result.data.quantity,
      user.id
    );

    return {
      statusCode: 200,
      success: true,
      message: "Cart item updated successfully",
      cart: {
        id: updatedCart.id,
        items: await Promise.all(
          (updatedCart.items ?? []).map(async (item) => ({
            id: item.id,
            quantity: item.quantity,
            product: await mapProductRecursive(item.product),
            productVariation: item.productVariation
              ? await mapProductVariationRecursive(item.productVariation)
              : null,
          }))
        ),
        coupons: (updatedCart.coupons ?? []).map((coupon) => ({
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
        createdBy: updatedCart.createdBy as any,
        createdAt:
          updatedCart.createdAt instanceof Date
            ? updatedCart.createdAt.toISOString()
            : updatedCart.createdAt ?? null,
        deletedAt:
          updatedCart.deletedAt instanceof Date
            ? updatedCart.deletedAt.toISOString()
            : updatedCart.deletedAt ?? null,
      },
      __typename: "CartResponse",
    };
  } catch (error: any) {
    console.error("Error updating cart item:", error);
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
