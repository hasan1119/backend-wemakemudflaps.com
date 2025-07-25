import CONFIG from "../../../config/config";
import { Context } from "../../../context";
import { Category, Product, ProductPrice } from "../../../entities";
import {
  CreateCouponResponseOrError,
  MutationCreateCouponArgs,
} from "../../../types";
import { createCouponSchema } from "../../../utils/data-validation";
import {
  checkUserAuth,
  checkUserPermission,
  createCoupon as createCouponService,
  findCouponByCode,
  getCategoryByIds,
  getProductsByIds,
} from "../../services";

/**
 * Maps a Category entity to GraphQL-compatible plain object including nested subcategories recursively.
 */
function mapCategoryRecursive(category: Category): any {
  if (!category) {
    return null;
  }
  return {
    id: category.id,
    name: category.name,
    slug: category.slug,
    description: category.description || null,
    thumbnail: category.thumbnail as any,
    position: category.position,
    totalProducts: 0,
    createdBy: category.createdBy as any,
    createdAt:
      category.createdAt instanceof Date
        ? category.createdAt.toISOString()
        : category.createdAt,
    deletedAt:
      category.deletedAt instanceof Date
        ? category.deletedAt.toISOString()
        : category.deletedAt || null,
    subCategories: (category.subCategories || []).map(mapCategoryRecursive),
    parentCategory: category.parentCategory
      ? mapCategoryRecursive(category.parentCategory)
      : null,
  };
}

/**
 * Maps a ProductPrice entity to a plain object for GraphQL response.
 */
function mapProductPrice(price: ProductPrice): any {
  if (!price) {
    return null;
  }
  return {
    id: price.id,
    pricingType: price.pricingType,
    createdAt: price.createdAt.toISOString(),
    deletedAt: price.deletedAt ? price.deletedAt.toISOString() : null,
    tieredPrices: (price.tieredPrices || []).map((tp) => ({
      id: tp.id,
      minQuantity: tp.minQuantity,
      maxQuantity: tp.maxQuantity,
      quantityUnit: tp.quantityUnit,
      fixedPrice: tp.fixedPrice,
      percentageDiscount: tp.percentageDiscount,
      createdAt: tp.createdAt.toISOString(),
      deletedAt: tp.deletedAt ? tp.deletedAt.toISOString() : null,
    })),
  };
}

/**
 * Maps a Product entity to a GraphQL-compatible plain object, handling nested upsells and cross-sells recursively.
 * Tracks visited products to prevent infinite recursion due to circular references.
 */
async function mapProductRecursive(
  product: Product,
  visited: Set<string> = new Set()
): Promise<any> {
  // Add current product ID to visited set
  visited.add(product.id);

  const baseProduct = {
    ...product,
    defaultImage: product.defaultImage as any,
    images: product.images as any,
    videos: product.videos as any,
    salePrice: product.salePrice,
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
    categories: product.categories?.map(mapCategoryRecursive),
    salePriceStartAt: product.salePriceStartAt?.toISOString(),
    salePriceEndAt: product.salePriceEndAt?.toISOString(),
    tierPricingInfo: product.tierPricingInfo
      ? mapProductPrice(await product.tierPricingInfo)
      : null,
    taxStatus: product.taxStatus,
    taxClass: product.taxClass
      ? {
          ...product.taxClass,
          createdBy: product.taxClass.createdBy as any,
          createdAt:
            product.taxClass.createdAt instanceof Date
              ? product.taxClass.createdAt.toISOString()
              : product.taxClass.createdAt,
          deletedAt: product.taxClass.deletedAt
            ? product.taxClass.deletedAt instanceof Date
              ? product.taxClass.deletedAt.toISOString()
              : product.taxClass.deletedAt
            : null,
        }
      : null,
    shippingClass: product.shippingClass
      ? {
          ...product.shippingClass,
          createdBy: product.shippingClass.createdBy as any,
          createdAt:
            product.shippingClass.createdAt instanceof Date
              ? product.shippingClass.createdAt.toISOString()
              : product.shippingClass.createdAt,
          deletedAt: product.shippingClass.deletedAt
            ? product.shippingClass.deletedAt instanceof Date
              ? product.shippingClass.deletedAt.toISOString()
              : product.shippingClass.deletedAt
            : null,
        }
      : null,
    attributes: product.attributes.map((attribute) => ({
      ...attribute,
      createdBy: attribute.createdBy as any,
      systemAttributeId: attribute.systemAttributeRef?.id || null,
      values: attribute.values.map((value) => ({
        ...value,
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
    variations: product.variations.map((variation) => ({
      ...variation,
      attributeValues: variation.attributeValues.map((av) => ({
        ...av,
        createdAt:
          av.createdAt instanceof Date
            ? av.createdAt.toISOString()
            : av.createdAt,
        deletedAt: av.deletedAt
          ? av.deletedAt instanceof Date
            ? av.deletedAt.toISOString()
            : av.deletedAt
          : null,
      })),
      images: variation.images as any,
      videos: variation.videos as any,
      createdAt:
        variation.createdAt instanceof Date
          ? variation.createdAt.toISOString()
          : variation.createdAt,
      deletedAt: variation.deletedAt
        ? variation.deletedAt instanceof Date
          ? variation.deletedAt.toISOString()
          : variation.deletedAt
        : null,
    })),
    reviews: product.reviews.map((review) => ({
      ...review,
      createdAt:
        review.createdAt instanceof Date
          ? review.createdAt.toISOString()
          : review.createdAt,
      deletedAt: review.deletedAt
        ? review.deletedAt instanceof Date
          ? review.deletedAt.toISOString()
          : review.deletedAt
        : null,
    })),
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

  // Map upsells and crossSells, skipping recursive mapping for already visited products
  return {
    ...baseProduct,
    upsells: product.upsells.map((upsell) =>
      visited.has(upsell.id)
        ? {
            id: upsell.id,
            name: upsell.name,
            slug: upsell.slug,
            defaultImage: upsell.defaultImage as any,
            salePrice: upsell.salePrice,
          }
        : mapProductRecursive(upsell, new Set(visited))
    ),
    crossSells: product.crossSells.map((crossSell) =>
      visited.has(crossSell.id)
        ? {
            id: crossSell.id,
            name: crossSell.name,
            slug: crossSell.slug,
            defaultImage: crossSell.defaultImage as any,
            salePrice: crossSell.salePrice,
          }
        : mapProductRecursive(crossSell, new Set(visited))
    ),
  };
}

/**
 * Handles the creation of a new coupon in the system.
 *
 * Workflow:
 * 1. Verifies user authentication and permission to create coupons.
 * 2. Validates input (code) using Zod schema.
 * 3. Checks Redis for existing coupon code to prevent duplicates.
 * 4. Queries the database for coupon existence.
 * 5. Creates the coupon in the database with audit information from the authenticated user.
 * 6. Returns a success response or error if validation, permission, or creation fails.
 *
 * @param _ - Unused parent parameter for GraphQL resolver.
 * @param args - Input arguments containing coupon code.
 * @param context - GraphQL context containing authenticated user information.
 * @returns A promise resolving to a CreateCouponResponseOrError object containing status, message, and errors if applicable.
 */
export const createCoupon = async (
  _: any,
  args: MutationCreateCouponArgs,
  { user }: Context
): Promise<CreateCouponResponseOrError> => {
  try {
    // Verify user authentication
    const authError = checkUserAuth(user);
    if (authError) return authError;

    // Check if user has permission to create a coupon
    const hasPermission = await checkUserPermission({
      user,
      action: "canCreate",
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
    const result = await createCouponSchema.safeParseAsync(args);

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
      code,
      applicableCategories,
      applicableProducts,
      excludedCategories,
      excludedProducts,
    } = result.data;

    const existingCoupon = await findCouponByCode(code);

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
    const coupon = await createCouponService(
      result.data as MutationCreateCouponArgs,
      user.id
    );

    return {
      statusCode: 201,
      success: true,
      message: "Coupon created successfully",
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
          coupon.applicableCategories?.map(mapCategoryRecursive) || [],
        excludedCategories:
          coupon.excludedCategories?.map(mapCategoryRecursive) || [],
        applicableProducts: coupon.applicableProducts
          ? await Promise.all(
              coupon.applicableProducts.map((p) => mapProductRecursive(p))
            )
          : [],
        excludedProducts: coupon.excludedProducts
          ? await Promise.all(
              coupon.excludedProducts.map((p) => mapProductRecursive(p))
            )
          : [],
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
    console.error("Error creating coupon:", error);
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
