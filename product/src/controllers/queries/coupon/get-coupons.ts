import { z } from "zod";
import CONFIG from "../../../config/config";
import { Context } from "../../../context";
import { Category, Product } from "../../../entities";
import {
  Category as CategoryGql,
  GetCouponsResponseOrError,
  Product as ProductGql,
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
        coupon.applicableCategories?.map(mapCategoryEntityToGql) || [],
      excludedCategories:
        coupon.excludedCategories?.map(mapCategoryEntityToGql) || [],
      applicableProducts:
        coupon.applicableProducts?.map(mapProductEntityToGql) || [],
      excludedProducts:
        coupon.excludedProducts?.map(mapProductEntityToGql) || [],
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
