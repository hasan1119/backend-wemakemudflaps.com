import CONFIG from "../../../config/config";
import { Context } from "../../../context";
import {
  AddToCartOrWishListResponseOrError,
  MutationAddToWishListArgs,
} from "../../../types";
import { addToWishListSchema } from "../../../utils/data-validation";
import {
  addToWishList as addToWishListService,
  checkUserAuth,
  getProductById,
  mapProductRecursive,
  mapProductVariationRecursive,
} from "../../services";

/**
 * Adds a product to the user's cart or wishlist.
 *
 * Workflow:
 * 1. Validates input data against Zod schema.
 * 2. Checks if the user is authenticated.
 * 3. Validates product existence and variation.
 * 4. Calls service to add item to cart or wishlist.
 * 5. Returns updated cart or wishlist response.
 *
 * @param _ - Unused parent argument for GraphQL resolver
 * @param args - Arguments containing product details
 * @param context - Context containing user authentication info
 * @returns Response with updated cart or wishlist
 */
export const addToWishList = async (
  _: any,
  args: MutationAddToWishListArgs,
  { user }: Context
): Promise<AddToCartOrWishListResponseOrError> => {
  try {
    // Verify user authentication
    const authError = checkUserAuth(user);
    if (authError) return authError;

    // Validate input data with Zod schema
    const result = await addToWishListSchema.safeParseAsync(args);
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

    const { productId, productVariationId } = result.data;

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

    if (product.productConfigurationType !== "SIMPLE_PRODUCT") {
      // Check if product variation exists

      if (!product.variations || product.variations.length === 0) {
        return {
          statusCode: 400,
          success: false,
          message: "Product variations are not available",
          __typename: "BaseResponse",
        };
      }

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
      }
    }
    const wishlist = await addToWishListService(
      product,
      productVariationId ?? null,
      user.id
    );

    return {
      statusCode: 200,
      success: true,
      message: "Item added to wishlist successfully",
      wishlist: {
        id: wishlist.id,
        items: await Promise.all(
          (wishlist.items ?? []).map(async (item) => ({
            id: item.id,
            product: await mapProductRecursive(item.product),
            productVariation: item.productVariation
              ? await mapProductVariationRecursive(item.productVariation)
              : null,
          }))
        ),
        createdBy: wishlist.createdBy as any,
        createdAt:
          wishlist.createdAt instanceof Date
            ? wishlist.createdAt.toISOString()
            : wishlist.createdAt ?? null,
        deletedAt:
          wishlist.deletedAt instanceof Date
            ? wishlist.deletedAt.toISOString()
            : wishlist.deletedAt ?? null,
      },
      __typename: "WishlistResponse",
    };
  } catch (error: any) {
    console.error("Error adding to wishlist:", error);
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
