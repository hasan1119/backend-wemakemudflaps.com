import CONFIG from "../../../config/config";
import { Context } from "../../../context";
import { Category, Product } from "../../../entities";
import {
  Category as CategoryGql,
  GetCouponByIdResponseOrError,
  Product as ProductGql,
  QueryGetCouponByIdArgs,
} from "../../../types";
import { idSchema } from "../../../utils/data-validation";
import {
  checkUserAuth,
  checkUserPermission,
  getCouponById as getCouponByIdService,
} from "../../services";

function isDate(value: any): value is Date {
  return Object.prototype.toString.call(value) === "[object Date]";
}

function mapCategoryEntityToGql(category: Category | null): CategoryGql | null {
  if (!category) return null;

  return {
    ...category,
    createdAt: isDate(category.createdAt)
      ? category.createdAt.toISOString()
      : category.createdAt,
    deletedAt: isDate(category.deletedAt)
      ? category.deletedAt.toISOString()
      : category.deletedAt,
    parentCategory: category.parentCategory
      ? mapCategoryEntityToGql(category.parentCategory)
      : null,
    subCategories: category.subCategories?.map(mapCategoryEntityToGql) || [],
    createdBy: category.createdBy as any,
    thumbnail: category.thumbnail as any,
  };
}

function mapProductEntityToGql(product: Product | null): ProductGql | null {
  if (!product) return null;

  return {
    ...product,
    defaultImage: product.defaultImage as any,
    images: product.images as any,
    videos: product.videos as any,
    brands: product.brands?.map((brand) => ({
      ...brand,
      thumbnail: brand.thumbnail as any,
      createdBy: brand.createdBy as any,
      createdAt:
        brand.createdAt instanceof Date
          ? brand.createdAt.toISOString()
          : brand.createdAt,
      deletedAt: brand.deletedAt
        ? brand.deletedAt instanceof Date
          ? brand.deletedAt.toISOString()
          : brand.deletedAt
        : null,
    })),
    tags: product.tags?.map((tag) => ({
      ...tag,
      createdBy: tag.createdBy as any,
      createdAt:
        tag.createdAt instanceof Date
          ? tag.createdAt.toISOString()
          : tag.createdAt,
      deletedAt: tag.deletedAt
        ? tag.deletedAt instanceof Date
          ? tag.deletedAt.toISOString()
          : tag.deletedAt
        : null,
    })),
    categories: product.categories?.map(mapCategoryEntityToGql) || [],
    salePriceStartAt: product.salePriceStartAt?.toISOString(),
    salePriceEndAt: product.salePriceEndAt?.toISOString(),
    tierPricingInfo: product.tierPricingInfo as any,
    taxStatus: product.taxStatus as any,
    taxClass: product.taxClass as any,
    shippingClass: product.shippingClass as any,
    upsells: product.upsells as any,
    crossSells: product.crossSells as any,
    attributes: product.attributes.map((attribute) => ({
      ...attribute,
      createdBy: attribute.createdBy as any,
      values: attribute.values.map((value) => ({
        ...value,
        attribute: value.attribute as any,
        createdAt:
          value.createdAt instanceof Date
            ? value.createdAt.toISOString()
            : value.createdAt,
        deletedAt: value.deletedAt
          ? value.deletedAt instanceof Date
            ? value.deletedAt.toISOString()
            : value.deletedAt
          : null,
      })),
      createdAt:
        attribute.createdAt instanceof Date
          ? attribute.createdAt.toISOString()
          : attribute.createdAt,
      deletedAt: attribute.deletedAt
        ? attribute.deletedAt instanceof Date
          ? attribute.deletedAt.toISOString()
          : attribute.deletedAt
        : null,
    })),
    variations: product.variations as any,
    reviews: product.reviews as any,
    createdBy: product.createdBy as any,
    createdAt:
      product.createdAt instanceof Date
        ? product.createdAt.toISOString()
        : product.createdAt,
    deletedAt: product.deletedAt
      ? product.deletedAt instanceof Date
        ? product.deletedAt.toISOString()
        : product.deletedAt
      : null,
  };
}

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
          existingCoupon.applicableCategories?.map(mapCategoryEntityToGql) ||
          [],
        excludedCategories:
          existingCoupon.excludedCategories?.map(mapCategoryEntityToGql) || [],
        applicableProducts:
          existingCoupon.applicableProducts?.map(mapProductEntityToGql) || [],
        excludedProducts:
          existingCoupon.excludedProducts?.map(mapProductEntityToGql) || [],
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
