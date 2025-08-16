import CONFIG from "../../../config/config";
import { Context } from "../../../context";
import { BaseResponseOrError, MutationDeleteCouponArgs } from "../../../types";
import { idsSchema } from "../../../utils/data-validation";
import {
  checkUserAuth,
  checkUserPermission,
  getCouponsByIds,
  hardDeleteCoupon,
} from "../../services";

/**
 * Deletes an existing coupon by its ID.
 *
 * Workflow:
 * 1. Validates user authentication and permissions.
 * 2. Validates input data using Zod.
 * 3. Deletes the coupon and returns a success message.
 *
 * @param _ - Unused parent argument.
 * @param args - Arguments containing the ID of the coupon to delete.
 * @param context - GraphQL context containing the authenticated user.
 * @returns A response indicating success or failure of the operation.
 */
export const deleteCoupon = async (
  _: any,
  args: MutationDeleteCouponArgs,
  { user }: Context
): Promise<BaseResponseOrError> => {
  try {
    // Check if user is authenticated
    const authResponse = checkUserAuth(user);
    if (authResponse) return authResponse;

    // Check if user has permission to delete coupons
    const hasPermission = await checkUserPermission({
      user,
      action: "canDelete",
      entity: "coupon",
    });

    if (!hasPermission) {
      return {
        statusCode: 403,
        success: false,
        message: "You do not have permission to delete coupon(s)",
        __typename: "BaseResponse",
      };
    }

    // Validate the input
    const validationResult = await idsSchema.safeParseAsync(args);
    if (!validationResult.success) {
      const errorMessages = validationResult.error.errors.map((error) => ({
        field: error.path.join("."),
        message: error.message,
      }));

      return {
        statusCode: 400,
        success: false,
        message: "Validation failed",
        errors: errorMessages,
        __typename: "ErrorResponse",
      };
    }

    const { ids } = args;

    const existingCoupons = await getCouponsByIds(ids);

    if (existingCoupons.length !== ids.length) {
      return {
        statusCode: 404,
        success: false,
        message: "Some coupons not found",
        __typename: "BaseResponse",
      };
    }

    // Delete the coupon
    for (const coupon of existingCoupons) {
      if (coupon.deletedAt) {
        return {
          statusCode: 400,
          success: false,
          message: `Coupon: ${coupon.code} already in the trash`,
          __typename: "BaseResponse",
        };
      }
      await hardDeleteCoupon(coupon.id);
    }

    return {
      statusCode: 200,
      success: true,
      message: `Coupon(s) deleted successfully`,
      __typename: "BaseResponse",
    };
  } catch (error) {
    console.error("Error deleting coupon:", error);

    return {
      statusCode: 500,
      success: false,
      message:
        CONFIG.NODE_ENV === "production"
          ? "Something went wrong, please try again."
          : error.message || "Internal server error",
      __typename: "BaseResponse",
    };
  }
};
