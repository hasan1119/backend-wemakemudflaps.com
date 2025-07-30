import CONFIG from "../../../config/config";
import { Context } from "../../../context";
import {
  MutationRemoveItemsFromCartArgs,
  RemoveFromCartOrWishListResponseOrError,
} from "../../../types";
import { idsSchema } from "../../../utils/data-validation";
import {
  checkUserAuth,
  getCartByUserId,
  removeItemsFromCart as removeItemsFromCartService,
} from "../../services";

/**
 * Mutation to remove items from the user's cart.
 *
 * @param _ - Unused parent argument.
 * @param args - Arguments containing product IDs to remove.
 * @param user - Context containing user information.
 * @returns Response indicating success or failure of the operation.
 */
export const removeItemsFromCart = async (
  _: any,
  args: MutationRemoveItemsFromCartArgs,
  { user }: Context
): Promise<RemoveFromCartOrWishListResponseOrError> => {
  try {
    // Verify user authentication
    const authError = checkUserAuth(user);
    if (authError) return authError;

    // Validate input data with Zod schema
    const result = await idsSchema.safeParseAsync({
      ids: args.productIds,
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

    const userCart = await getCartByUserId(user.id);

    if (!userCart) {
      return {
        statusCode: 404,
        success: false,
        message: "Cart not found",
        __typename: "ErrorResponse",
      };
    }

    await removeItemsFromCartService(result.data.ids, user.id);

    return {
      statusCode: 200,
      success: true,
      message: "Items removed from cart successfully",
      __typename: "BaseResponse",
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
