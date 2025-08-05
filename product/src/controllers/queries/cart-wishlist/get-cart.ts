import CONFIG from "../../../config/config";
import { Context } from "../../../context";
import { Category, Product, ProductPrice } from "../../../entities";
import { GetCartOrWishListResponseOrError } from "../../../types";
import { checkUserAuth, getCartByUserId } from "../../services";

/**
 * Maps a Category entity to GraphQL-compatible plain object including nested subcategories recursively.
 */
function mapCategoryRecursive(category: Category | null): any {
  if (!category) {
    return null;
  }
  return {
    id: category.id,
    name: category.name,
    slug: category.slug,
    description: category.description ?? null,
    thumbnail: category.thumbnail ?? null,
    position: category.position,
    totalProducts: 0, // Consider calculating this if needed
    createdBy: category.createdBy as any,
    createdAt:
      category.createdAt instanceof Date
        ? category.createdAt.toISOString()
        : category.createdAt ?? null,
    deletedAt:
      category.deletedAt instanceof Date
        ? category.deletedAt.toISOString()
        : category.deletedAt ?? null,
    subCategories:
      (category.subCategories ?? []).map(mapCategoryRecursive) || null,
    parentCategory: category.parentCategory
      ? mapCategoryRecursive(category.parentCategory)
      : null,
  };
}

/**
 * Maps a ProductPrice entity to a plain object for GraphQL response.
 */
function mapProductPrice(price: ProductPrice | null): any {
  if (!price) {
    return null;
  }
  return {
    id: price.id,
    pricingType: price.pricingType,
    createdAt:
      price.createdAt instanceof Date
        ? price.createdAt.toISOString()
        : price.createdAt ?? null,
    deletedAt:
      price.deletedAt instanceof Date
        ? price.deletedAt.toISOString()
        : price.deletedAt ?? null,
    tieredPrices:
      (price.tieredPrices ?? []).map((tp) => ({
        id: tp.id,
        minQuantity: tp.minQuantity,
        maxQuantity: tp.maxQuantity ?? null,
        quantityUnit: tp.quantityUnit,
        fixedPrice: tp.fixedPrice,
        percentageDiscount: tp.percentageDiscount ?? null,
        createdAt:
          tp.createdAt instanceof Date
            ? tp.createdAt.toISOString()
            : tp.createdAt ?? null,
        deletedAt:
          tp.deletedAt instanceof Date
            ? tp.deletedAt.toISOString()
            : tp.deletedAt ?? null,
      })) || null,
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
    brands:
      product.brands?.map((brand) => ({
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
      })) || null,
    tags:
      product.tags?.map((tag) => ({
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
      })) || null,
    categories: product.categories?.map(mapCategoryRecursive) || null,
    salePriceStartAt:
      product.salePriceStartAt instanceof Date
        ? product.salePriceStartAt.toISOString()
        : product.salePriceStartAt,
    salePriceEndAt:
      product.salePriceEndAt instanceof Date
        ? product.salePriceEndAt.toISOString()
        : product.salePriceEndAt,
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
      values:
        attribute.values.map((value) => ({
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
        })) || null,
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
    variations:
      (await Promise.all(
        product.variations.map(async (variation) => ({
          ...variation,
          brands:
            (
              await variation.brands
            ).map((brand) => ({
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
            })) || null,
          attributeValues: variation.attributeValues
            ? (await Promise.all(
                (
                  await variation.attributeValues
                ).map(async (attributeValue) => {
                  const av = await attributeValue.attributeValue;
                  return {
                    id: attributeValue.id,
                    value: av?.value || null,
                    createdAt:
                      attributeValue.createdAt instanceof Date
                        ? attributeValue.createdAt.toISOString()
                        : attributeValue.createdAt,
                    deletedAt: attributeValue.deletedAt
                      ? attributeValue.deletedAt instanceof Date
                        ? attributeValue.deletedAt.toISOString()
                        : attributeValue.deletedAt
                      : null,
                  };
                })
              )) || null
            : null,
          tierPricingInfo: variation.tierPricingInfo
            ? mapProductPrice(await variation.tierPricingInfo)
            : null,
          salePriceEndAt:
            variation.salePriceEndAt instanceof Date
              ? variation.salePriceEndAt.toISOString()
              : variation.salePriceEndAt,
          salePriceStartAt:
            variation.salePriceStartAt instanceof Date
              ? variation.salePriceStartAt.toISOString()
              : variation.salePriceStartAt,
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
        }))
      )) || null,
    reviews:
      product.reviews.map((review) => ({
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
      })) || null,
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
    upsells:
      product.upsells.map((upsell) =>
        visited.has(upsell.id)
          ? {
              id: upsell.id,
              name: upsell.name,
              slug: upsell.slug,
              defaultImage: upsell.defaultImage as any,
              images: upsell.images as any,
              salePrice: upsell.salePrice,
            }
          : mapProductRecursive(upsell, new Set(visited))
      ) || null,
    crossSells:
      product.crossSells.map((crossSell) =>
        visited.has(crossSell.id)
          ? {
              id: crossSell.id,
              name: crossSell.name,
              slug: crossSell.slug,
              defaultImage: crossSell.defaultImage as any,
              images: crossSell.images as any,
              salePrice: crossSell.salePrice,
            }
          : mapProductRecursive(crossSell, new Set(visited))
      ) || null,
  };
}

/**
 * Maps a ProductVariation entity to a GraphQL-compatible plain object.
 */
async function mapProductVariationRecursive(
  productVariation: any | null
): Promise<any> {
  if (!productVariation) {
    return null;
  }
  return {
    ...productVariation,
    attributeValues:
      (productVariation.attributeValues ?? []).map((av: any) => ({
        ...av,
        createdAt:
          av.createdAt instanceof Date
            ? av.createdAt.toISOString()
            : av.createdAt ?? null,
        deletedAt:
          av.deletedAt instanceof Date
            ? av.deletedAt.toISOString()
            : av.deletedAt ?? null,
      })) || null,
    images: (productVariation.images as any) ?? [],
    videos: (productVariation.videos as any) ?? [],
    createdAt:
      productVariation.createdAt instanceof Date
        ? productVariation.createdAt.toISOString()
        : productVariation.createdAt ?? null,
    deletedAt:
      productVariation.deletedAt instanceof Date
        ? productVariation.deletedAt.toISOString()
        : productVariation.deletedAt ?? null,
  };
}

/**
 * Fetches the cart for the authenticated user.
 *
 * @param _ - Unused parent argument.
 * @param __ - Unused arguments.
 * @param context - The context containing user information.
 * @returns A promise that resolves to the cart response or an error response.
 */
export const getCart = async (
  _: any,
  __: any,
  { user }: Context
): Promise<GetCartOrWishListResponseOrError> => {
  try {
    // Auth check
    const authResponse = checkUserAuth(user);
    if (authResponse) return authResponse;

    // Fetch cart
    const cart = await getCartByUserId(user.id);

    if (!cart) {
      return {
        statusCode: 404,
        success: false,
        message: "Cart not found.",
        __typename: "ErrorResponse",
      };
    }

    return {
      statusCode: 200,
      success: true,
      message: "Cart fetched successfully.",
      cart: {
        id: cart.id,
        items: await Promise.all(
          (cart.items ?? []).map(async (item) => ({
            id: item.id,
            quantity: item.quantity,
            product: await mapProductRecursive(item.product),
            productVariation: item.productVariation
              ? await mapProductVariationRecursive(item.productVariation)
              : null,
          }))
        ),
        coupons: (cart.coupons ?? []).map((coupon) => ({
          id: coupon.id,
          code: coupon.code,
          description: coupon.description ?? null,
          discountType: coupon.discountType,
          discountValue: coupon.discountValue,
          allowedEmails: coupon.allowedEmails ?? [],
          applicableCategories: (coupon.applicableCategories ?? []).map(
            (cat) => ({
              id: cat.id,
              name: cat.name,
            })
          ),
          excludedCategories: (coupon.excludedCategories ?? []).map((cat) => ({
            id: cat.id,
            name: cat.name,
          })),
          applicableProducts: (coupon.applicableProducts ?? []).map((prod) => ({
            id: prod.id,
            name: prod.name,
          })),
          excludedProducts: (coupon.excludedProducts ?? []).map((prod) => ({
            id: prod.id,
            name: prod.name,
          })),
          freeShipping: coupon.freeShipping ?? false,
          usageCount: coupon.usageCount ?? 0,
          maximumSpend: coupon.maximumSpend ?? null,
          minimumSpend: coupon.minimumSpend ?? null,
          maxUsage: coupon.maxUsage ?? null,
          expiryDate:
            coupon.expiryDate instanceof Date
              ? coupon.expiryDate.toISOString()
              : coupon.expiryDate ?? null,
          createdBy: coupon.createdBy as any,
          createdAt:
            coupon.createdAt instanceof Date
              ? coupon.createdAt.toISOString()
              : coupon.createdAt ?? null,
          deletedAt:
            coupon.deletedAt instanceof Date
              ? coupon.deletedAt.toISOString()
              : coupon.deletedAt ?? null,
        })),
        createdBy: cart.createdBy as any,
        createdAt:
          cart.createdAt instanceof Date
            ? cart.createdAt.toISOString()
            : cart.createdAt ?? null,
        deletedAt:
          cart.deletedAt instanceof Date
            ? cart.deletedAt.toISOString()
            : cart.deletedAt ?? null,
      },
      __typename: "CartResponse",
    };
  } catch (error: any) {
    console.error("Error fetching cart:", error);
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
