import CONFIG from "../../../config/config";
import { Context } from "../../../context";
import {
  MutationRemoveItemsFromWishListArgs,
  RemoveFromCartOrWishListResponseOrError,
} from "../../../types";
import { idsSchema } from "../../../utils/data-validation";
import {
  checkUserAuth,
  getWishlistByUserId,
  removeItemsFromWishlist as removeItemsFromWishlistService,
} from "../../services";

/**
 * Mutation to remove items from the user's wishlist.
 *
 * @param _ - Unused parent argument.
 * @param args - Arguments containing product IDs to remove.
 * @param user - Context containing user information.
 * @returns Response indicating success or failure of the operation.
 */
export const removeItemsFromWishList = async (
  _: any,
  args: MutationRemoveItemsFromWishListArgs,
  { user }: Context
): Promise<RemoveFromCartOrWishListResponseOrError> => {
  try {
    // Verify user authentication
    const authError = checkUserAuth(user);
    if (authError) return authError;

    // Validate input data with Zod schema
    const result = await idsSchema.safeParseAsync({
      ids: args.wishListItemIds,
    });

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

    const userWishlist = await getWishlistByUserId(user.id);

    if (!userWishlist) {
      return {
        statusCode: 404,
        success: false,
        message: "Wishlist not found",
        __typename: "ErrorResponse",
      };
    }

    await removeItemsFromWishlistService(args.wishListItemIds, user.id);

    return {
      statusCode: 200,
      success: true,
      message: "Items removed from wishlist successfully",
      __typename: "BaseResponse",
    };
  } catch (error: any) {
    console.error("Error removing items from wishlist:", error);
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
