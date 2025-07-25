import CONFIG from "../../../config/config";
import { Context } from "../../../context";
import {
  GetCouponByIdResponseOrError,
  QueryGetCouponByIdArgs,
} from "../../../types";
import { idSchema } from "../../../utils/data-validation";
import {
  checkUserAuth,
  checkUserPermission,
  getCouponById as getCouponByIdService,
} from "../../services";

/**
 * Handles the get coupon by ID in the system.
 *
 * Workflow:
 * 1. Verifies user authentication and permission to get coupons.
 * 2. Validates input (id) using Zod schema.
 * 3. Checks Redis for existing coupon ID.
 * 4. Queries the database for coupon existence.
 * 5. Gets the coupon in the database with audit information from the authenticated user.
 * 6. Returns a success response or error if validation, permission, or get fails.
 *
 * @param _ - Unused parent parameter for GraphQL resolver.
 * @param args - Input arguments containing coupon ID.
 * @param context - GraphQL context containing authenticated user information.
 * @returns A promise resolving to a GetCouponByIdResponseOrError object containing status, message, and errors if applicable.
 */
export const getCouponById = async (
  _: any,
  args: QueryGetCouponByIdArgs,
  { user }: Context
): Promise<GetCouponByIdResponseOrError> => {
  try {
    // Verify user authentication
    const authError = checkUserAuth(user);
    if (authError) return authError;

    // Check if user has permission to get a coupon
    const hasPermission = await checkUserPermission({
      user,
      action: "canRead",
      entity: "coupon",
    });

    if (!hasPermission) {
      return {
        statusCode: 403,
        success: false,
        message: "You do not have permission to create coupons",
        __typename: "BaseResponse",
      };
    }

    // Validate input data with Zod schema
    const result = await idSchema.safeParseAsync(args);

    // Return detailed validation errors if input is invalid
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

    const existingCoupon = await getCouponByIdService(args.id);

    if (!existingCoupon) {
      return {
        statusCode: 404,
        success: false,
        message: "Coupon not found",
        __typename: "BaseResponse",
      };
    }

    return {
      statusCode: 201,
      success: true,
      message: "Coupon retrieved successfully",
      coupon: {
        id: existingCoupon.id,
        code: existingCoupon.code,
        description: existingCoupon.description,
        discountType: existingCoupon.discountType,
        discountValue: existingCoupon.discountValue,
        allowedEmails: existingCoupon.allowedEmails,
        expiryDate:
          existingCoupon.expiryDate instanceof Date
            ? existingCoupon.expiryDate.toISOString()
            : existingCoupon.expiryDate,
        maximumSpend: existingCoupon.maximumSpend,
        minimumSpend: existingCoupon.minimumSpend,
        maxUsage: existingCoupon.maxUsage,
        freeShipping: existingCoupon.freeShipping,
        usageCount: existingCoupon.usageCount,
        applicableCategories:
          existingCoupon.applicableCategories?.map((c) => ({
            id: c.id,
            name: c.name,
          })) || [],
        excludedCategories:
          existingCoupon.excludedCategories?.map((c) => ({
            id: c.id,
            name: c.name,
          })) || [],
        applicableProducts:
          existingCoupon.applicableProducts?.map((c) => ({
            id: c.id,
            name: c.name,
          })) || [],
        excludedProducts:
          existingCoupon.excludedProducts?.map((c) => ({
            id: c.id,
            name: c.name,
          })) || [],
        createdBy: existingCoupon.createdBy as any,
        createdAt:
          existingCoupon.createdAt instanceof Date
            ? existingCoupon.createdAt.toISOString()
            : existingCoupon.createdAt,
        deletedAt:
          existingCoupon.deletedAt instanceof Date
            ? existingCoupon.deletedAt.toISOString()
            : existingCoupon.deletedAt,
      },
      __typename: "CouponResponse",
    };
  } catch (error: any) {
    console.error("Error retrieving coupon:", error);
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
