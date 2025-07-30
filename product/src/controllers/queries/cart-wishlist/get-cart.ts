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
    subCategories: (category.subCategories ?? []).map(mapCategoryRecursive),
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
    tieredPrices: (price.tieredPrices ?? []).map((tp) => ({
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
    })),
  };
}

/**
 * Maps a Product entity to a GraphQL-compatible plain object, handling nested upsells and cross-sells recursively.
 * Tracks visited products to prevent infinite recursion due to circular references.
 */
async function mapProductRecursive(
  product: Product | null,
  visited: Set<string> = new Set()
): Promise<any> {
  if (!product) {
    return null;
  }

  visited.add(product.id);

  // Resolve tierPricingInfo if it exists
  const tierPricingInfo = product.tierPricingInfo
    ? await product.tierPricingInfo
    : null;

  const baseProduct = {
    id: product.id,
    name: product.name,
    slug: product.slug,
    defaultImage: product.defaultImage ?? null,
    images: product.images ?? [],
    videos: product.videos ?? [],
    salePrice: product.salePrice ?? null,
    brands: (product.brands ?? []).map((brand) => ({
      ...brand,
      thumbnail: brand.thumbnail ?? null,
      createdBy: brand.createdBy as any,
      createdAt:
        brand.createdAt instanceof Date
          ? brand.createdAt.toISOString()
          : brand.createdAt ?? null,
      deletedAt:
        brand.deletedAt instanceof Date
          ? brand.deletedAt.toISOString()
          : brand.deletedAt ?? null,
    })),
    tags: (product.tags ?? []).map((tag) => ({
      ...tag,
      createdBy: tag.createdBy as any,
      createdAt:
        tag.createdAt instanceof Date
          ? tag.createdAt.toISOString()
          : tag.createdAt ?? null,
      deletedAt:
        tag.deletedAt instanceof Date
          ? tag.deletedAt.toISOString()
          : tag.deletedAt ?? null,
    })),
    categories: (product.categories ?? []).map(mapCategoryRecursive),
    salePriceStartAt:
      product.salePriceStartAt instanceof Date
        ? product.salePriceStartAt.toISOString()
        : product.salePriceStartAt ?? null,
    salePriceEndAt:
      product.salePriceEndAt instanceof Date
        ? product.salePriceEndAt.toISOString()
        : product.salePriceEndAt ?? null,
    tierPricingInfo: tierPricingInfo ? mapProductPrice(tierPricingInfo) : null,
    taxStatus: product.taxStatus ?? null,
    taxClass: product.taxClass
      ? {
          ...product.taxClass,
          createdBy: product.taxClass.createdBy as any,
          createdAt:
            product.taxClass.createdAt instanceof Date
              ? product.taxClass.createdAt.toISOString()
              : product.taxClass.createdAt ?? null,
          deletedAt:
            product.taxClass.deletedAt instanceof Date
              ? product.taxClass.deletedAt.toISOString()
              : product.taxClass.deletedAt ?? null,
        }
      : null,
    shippingClass: product.shippingClass
      ? {
          ...product.shippingClass,
          createdBy: product.shippingClass.createdBy as any,
          createdAt:
            product.shippingClass.createdAt instanceof Date
              ? product.shippingClass.createdAt.toISOString()
              : product.shippingClass.createdAt ?? null,
          deletedAt:
            product.shippingClass.deletedAt instanceof Date
              ? product.shippingClass.deletedAt.toISOString()
              : product.shippingClass.deletedAt ?? null,
        }
      : null,
    attributes: (product.attributes ?? []).map((attribute) => ({
      ...attribute,
      createdBy: attribute.createdBy as any,
      systemAttributeId: attribute.systemAttributeRef?.id ?? null,
      values: (attribute.values ?? []).map((value) => ({
        ...value,
        createdAt:
          value.createdAt instanceof Date
            ? value.createdAt.toISOString()
            : value.createdAt ?? null,
        deletedAt:
          value.deletedAt instanceof Date
            ? value.deletedAt.toISOString()
            : value.deletedAt ?? null,
      })),
      createdAt:
        attribute.createdAt instanceof Date
          ? attribute.createdAt.toISOString()
          : attribute.createdAt ?? null,
      deletedAt:
        attribute.deletedAt instanceof Date
          ? attribute.deletedAt.toISOString()
          : attribute.deletedAt ?? null,
    })),
    variations: (product.variations ?? []).map((variation) => ({
      ...variation,
      attributeValues: (variation.attributeValues ?? []).map((av) => ({
        ...av,
        createdAt:
          av.createdAt instanceof Date
            ? av.createdAt.toISOString()
            : av.createdAt ?? null,
        deletedAt:
          av.deletedAt instanceof Date
            ? av.deletedAt.toISOString()
            : av.deletedAt ?? null,
      })),
      images: variation.images ?? [],
      videos: variation.videos ?? [],
      createdAt:
        variation.createdAt instanceof Date
          ? variation.createdAt.toISOString()
          : variation.createdAt ?? null,
      deletedAt:
        variation.deletedAt instanceof Date
          ? variation.deletedAt.toISOString()
          : variation.deletedAt ?? null,
    })),
    reviews: (product.reviews ?? []).map((review) => ({
      ...review,
      createdAt:
        review.createdAt instanceof Date
          ? review.createdAt.toISOString()
          : review.createdAt ?? null,
      deletedAt:
        review.deletedAt instanceof Date
          ? review.deletedAt.toISOString()
          : review.deletedAt ?? null,
    })),
    createdBy: product.createdBy as any,
    createdAt:
      product.createdAt instanceof Date
        ? product.createdAt.toISOString()
        : product.createdAt ?? null,
    deletedAt:
      product.deletedAt instanceof Date
        ? product.deletedAt.toISOString()
        : product.deletedAt ?? null,
  };

  return {
    ...baseProduct,
    upsells: await Promise.all(
      (product.upsells ?? []).map(async (upsell) =>
        visited.has(upsell.id)
          ? {
              id: upsell.id,
              name: upsell.name,
              slug: upsell.slug,
              defaultImage: upsell.defaultImage ?? null,
              salePrice: upsell.salePrice ?? null,
            }
          : await mapProductRecursive(upsell, new Set(visited))
      )
    ),
    crossSells: await Promise.all(
      (product.crossSells ?? []).map(async (crossSell) =>
        visited.has(crossSell.id)
          ? {
              id: crossSell.id,
              name: crossSell.name,
              slug: crossSell.slug,
              defaultImage: crossSell.defaultImage ?? null,
              salePrice: crossSell.salePrice ?? null,
            }
          : await mapProductRecursive(crossSell, new Set(visited))
      )
    ),
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
    attributeValues: (productVariation.attributeValues ?? []).map(
      (av: any) => ({
        ...av,
        createdAt:
          av.createdAt instanceof Date
            ? av.createdAt.toISOString()
            : av.createdAt ?? null,
        deletedAt:
          av.deletedAt instanceof Date
            ? av.deletedAt.toISOString()
            : av.deletedAt ?? null,
      })
    ),
    images: productVariation.images ?? [],
    videos: productVariation.videos ?? [],
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

    console.log(cart);

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
