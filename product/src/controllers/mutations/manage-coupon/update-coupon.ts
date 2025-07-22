import CONFIG from "../../../config/config";
import { Context } from "../../../context";
import { Category, Product } from "../../../entities";
import {
  Category as CategoryGql,
  MutationUpdateCouponArgs,
  Product as ProductGql,
  UpdateCouponResponseOrError,
} from "../../../types";
import { updateCouponSchema } from "../../../utils/data-validation";
import {
  checkUserAuth,
  checkUserPermission,
  findCouponByCodeToUpdate,
  getCategoryByIds,
  getCouponById,
  getProductsByIds,
  updateCoupon as updateCouponService,
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
 * Handles the updating of an existing coupon in the system.
 *
 * Workflow:
 * 1. Verifies user authentication and permission to update coupons.
 * 2. Validates input (code) using Zod schema.
 * 3. Checks Redis for existing coupon code to prevent duplicates.
 * 4. Queries the database for coupon existence.
 * 5. Updates the coupon in the database with audit information from the authenticated user.
 * 6. Returns a success response or error if validation, permission, or update fails.
 *
 * @param _ - Unused parent parameter for GraphQL resolver.
 * @param args - Input arguments containing coupon code.
 * @param context - GraphQL context containing authenticated user information.
 * @returns A promise resolving to a UpdateCouponResponseOrError object containing status, message, and errors if applicable.
 */
export const updateCoupon = async (
  _: any,
  args: MutationUpdateCouponArgs,
  { user }: Context
): Promise<UpdateCouponResponseOrError> => {
  try {
    // Verify user authentication
    const authError = checkUserAuth(user);
    if (authError) return authError;

    // Check if user has permission to update a coupon
    const hasPermission = await checkUserPermission({
      user,
      action: "canUpdate",
      entity: "coupon",
    });

    if (!hasPermission) {
      return {
        statusCode: 403,
        success: false,
        message: "You do not have permission to update coupons",
        __typename: "BaseResponse",
      };
    }

    // Validate input data with Zod schema
    const result = await updateCouponSchema.safeParseAsync(args);

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

    const {
      id,
      code,
      applicableCategories,
      applicableProducts,
      excludedCategories,
      excludedProducts,
    } = result.data;

    const existingCouponById = await getCouponById(id);

    if (!existingCouponById) {
      return {
        statusCode: 404,
        success: false,
        message: `Coupon not found: ${existingCouponById}, or it may have been deleted`,
        __typename: "BaseResponse",
      };
    }

    const existingCoupon = await findCouponByCodeToUpdate(id, code);

    if (existingCoupon) {
      return {
        statusCode: 400,
        success: false,
        message: `A coupon with this code already exists`,
        __typename: "BaseResponse",
      };
    }

    if (applicableProducts && applicableProducts.length > 0) {
      const products = await getProductsByIds(applicableProducts);
      if (products.length !== applicableProducts.length) {
        return {
          statusCode: 400,
          success: false,
          message: "One or more applicable products do not exist",
          __typename: "BaseResponse",
        };
      }
    }

    if (excludedProducts && excludedProducts.length > 0) {
      const products = await getProductsByIds(excludedProducts);
      if (products.length !== excludedProducts.length) {
        return {
          statusCode: 400,
          success: false,
          message: "One or more excluded products do not exist",
          __typename: "BaseResponse",
        };
      }
    }

    if (applicableCategories && applicableCategories.length > 0) {
      const categories = await getCategoryByIds(applicableCategories);
      if (categories.length !== applicableCategories.length) {
        return {
          statusCode: 400,
          success: false,
          message: "One or more applicable categories do not exist",
          __typename: "BaseResponse",
        };
      }
    }

    if (excludedCategories && excludedCategories.length > 0) {
      const categories = await getCategoryByIds(excludedCategories);
      if (categories.length !== excludedCategories.length) {
        return {
          statusCode: 400,
          success: false,
          message: "One or more excluded categories do not exist",
          __typename: "BaseResponse",
        };
      }
    }
    // Create the coupon in the database
    const coupon = await updateCouponService(
      id,
      result.data as MutationUpdateCouponArgs
    );

    return {
      statusCode: 201,
      success: true,
      message: "Coupon updated successfully",
      coupon: {
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
      },
      __typename: "CouponResponse",
    };
  } catch (error: any) {
    console.error("Error updating coupon:", error);
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
