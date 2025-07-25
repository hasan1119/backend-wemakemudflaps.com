import { z } from "zod";
import CONFIG from "../../../config/config";
import { Context } from "../../../context";
import {
  GetCouponsResponseOrError,
  QueryGetAllCouponsArgs,
} from "../../../types";
import {
  paginationSchema,
  productSortingSchema,
} from "../../../utils/data-validation";
import {
  checkUserAuth,
  checkUserPermission,
  paginateCoupons,
} from "../../services";

// Combine pagination and sorting schemas for validation
const combinedSchema = z.intersection(paginationSchema, productSortingSchema);

// Map GraphQL input arguments to schema fields
const mapArgsToPagination = (args: QueryGetAllCouponsArgs) => ({
  page: args.page,
  limit: args.limit,
  search: args.search,
  sortBy: args.sortBy || "createdAt",
  sortOrder: args.sortOrder || "desc",
});

/**
 * Handles fetching a paginated list of coupons with optional search and sorting.
 *
 * Workflow:
 * 1. Verifies user authentication and checks read permission for coupons.
 * 2. Validates input (page, limit, search, sortBy, sortOrder) using Zod schemas.
 * 3. On cache miss, fetches coupons from the database with pagination, search, and sorting.
 * 4. Maps database coupons, including creator details.
 * 5. Returns a success response or error if validation, permission, or retrieval fails.
 *
 * @param _ - Unused parent parameter for GraphQL resolver.
 * @param args - Input arguments containing page, limit, search, sortBy, and sortOrder.
 * @param context - GraphQL context containing authenticated user information.
 * @returns A promise resolving to a GetProductsResponseOrError object containing status, message, products, total count, and errors if applicable.
 */
export const getAllCoupons = async (
  _: any,
  args: QueryGetAllCouponsArgs,
  { user }: Context
): Promise<GetCouponsResponseOrError> => {
  try {
    // Verify user authentication
    const authResponse = checkUserAuth(user);
    if (authResponse) return authResponse;

    // Check if user has permission to view coupons
    const canRead = await checkUserPermission({
      action: "canRead",
      entity: "coupon",
      user,
    });

    if (!canRead) {
      return {
        statusCode: 403,
        success: false,
        message: "You do not have permission to view coupons info",
        __typename: "BaseResponse",
      };
    }

    // Map and validate input arguments
    const mappedArgs = mapArgsToPagination(args);
    const validationResult = await combinedSchema.safeParseAsync(mappedArgs);

    if (!validationResult.success) {
      const errors = validationResult.error.errors.map((e) => ({
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

    const { page, limit, search, sortBy, sortOrder } = mappedArgs;

    // Ensure sortOrder is "asc" or "desc"
    const safeSortOrder = sortOrder === "asc" ? "asc" : "desc";

    // Fetch coupons from database directly
    const { coupons: dbCoupons, total } = await paginateCoupons({
      page,
      limit,
      search,
      sortBy,
      sortOrder: safeSortOrder,
    });

    // Map database coupons to GraphQL format
    const coupons = dbCoupons.map((coupon) => ({
      id: coupon.id,
      code: coupon.code,
      description: coupon.description,
      discountType: coupon.discountType,
      discountValue: coupon.discountValue,
      allowedEmails: coupon.allowedEmails,
      expiryDate:
        coupon.expiryDate instanceof Date
          ? coupon.expiryDate.toISOString()
          : coupon.expiryDate,
      maximumSpend: coupon.maximumSpend,
      minimumSpend: coupon.minimumSpend,
      maxUsage: coupon.maxUsage,
      freeShipping: coupon.freeShipping,
      usageCount: coupon.usageCount,
      applicableCategories:
        coupon.applicableCategories?.map((c) => ({
          id: c.id,
          name: c.name,
        })) || [],
      excludedCategories:
        coupon.excludedCategories?.map((c) => ({
          id: c.id,
          name: c.name,
        })) || [],
      applicableProducts:
        coupon.applicableProducts?.map((c) => ({
          id: c.id,
          name: c.name,
        })) || [],
      excludedProducts:
        coupon.excludedProducts?.map((c) => ({
          id: c.id,
          name: c.name,
        })) || [],
      createdBy: coupon.createdBy as any,
      createdAt:
        coupon.createdAt instanceof Date
          ? coupon.createdAt.toISOString()
          : coupon.createdAt,
      deletedAt:
        coupon.deletedAt instanceof Date
          ? coupon.deletedAt.toISOString()
          : coupon.deletedAt,
    }));

    return {
      statusCode: 200,
      success: true,
      message: "Coupon(s) fetched successfully",
      coupons,
      total,
      __typename: "CouponPaginationResponse",
    };
  } catch (error: any) {
    console.error("Error fetching coupons:", {
      message: error.message,
    });

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
