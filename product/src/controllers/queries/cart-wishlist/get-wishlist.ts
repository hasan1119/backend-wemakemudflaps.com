import CONFIG from "../../../config/config";
import { Context } from "../../../context";
import { GetCartOrWishListResponseOrError } from "../../../types";
import {
  checkUserAuth,
  getWishlistByUserId,
  mapProductRecursive,
  mapProductVariationRecursive,
} from "../../services";

/**
 * Fetches the wishlist for the authenticated user.
 *
 * @param _ - Unused parent argument.
 * @param __ - Unused arguments.
 * @param context - The context containing user information.
 * @returns A promise that resolves to the wishlist response or an error response.
 */
export const getWishlist = async (
  _: any,
  __: any,
  { user }: Context
): Promise<GetCartOrWishListResponseOrError> => {
  try {
    // Auth check
    const authResponse = checkUserAuth(user);
    if (authResponse) return authResponse;

    // Fetch wishlist
    const wishlist = await getWishlistByUserId(user.id);

    if (!wishlist) {
      return {
        statusCode: 404,
        success: false,
        message: "Wishlist not found.",
        __typename: "ErrorResponse",
      };
    }

    return {
      statusCode: 200,
      success: true,
      message: "Wishlist fetched successfully.",
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
    console.error("Error fetching wishlist:", error);
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
