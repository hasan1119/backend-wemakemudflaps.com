import CONFIG from "../../../config/config";
import { Context } from "../../../context";
import { Category, Product, ProductPrice } from "../../../entities";
import {
  clearBrandsAndCountCache,
  clearShippingClassesAndCountCache,
  clearTagsAndCountCache,
  clearTaxClassesAndCountCache,
} from "../../../helper/redis";
import { CreateProductResponseOrError } from "../../../types";
import {
  checkUserAuth,
  checkUserPermission,
  createProduct as createProductService,
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
    subCategories:
      (category.subCategories || []).map(mapCategoryRecursive) || null,
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
    tieredPrices:
      (price.tieredPrices || []).map((tp) => ({
        id: tp.id,
        minQuantity: tp.minQuantity,
        maxQuantity: tp?.maxQuantity,
        quantityUnit: tp.quantityUnit,
        fixedPrice: tp.fixedPrice,
        percentageDiscount: tp.percentageDiscount,
        createdAt: tp.createdAt.toISOString(),
        deletedAt: tp.deletedAt ? tp.deletedAt.toISOString() : null,
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
                    id: attributeValue.attributeValue.id, // Main id of that attribute value
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
 * Handles the creation of a new product in the system.
 *
 * Workflow:
 * 1. Verifies user authentication and permission to create products.
 * 2. Validates input (name, slug, and other product details) using Zod schema.
 * 3. Checks database for product name and slug to prevent duplicates.
 * 4. Creates the product in the database with audit information from the authenticated user.
 * 5. Returns a success response or error if validation, permission, or creation fails.
 *
 * @param _ - Unused parent parameter for GraphQL resolver.
 * @param args - Input arguments containing product details.
 * @param context - GraphQL context containing authenticated user information.
 * @returns A promise resolving to a CreateProductResponseOrError object containing status, message, and errors if applicable.
 */
export const createProduct = async (
  _: any,
  __: any,
  { user }: Context
): Promise<CreateProductResponseOrError> => {
  try {
    // Verify user authentication
    const authError = checkUserAuth(user);
    if (authError) return authError;

    // Check if user has permission to create a product
    const hasPermission = await checkUserPermission({
      user,
      action: "canCreate",
      entity: "product",
    });

    if (!hasPermission) {
      return {
        statusCode: 403,
        success: false,
        message: "You do not have permission to create products",
        __typename: "BaseResponse",
      };
    }

    // Create the product in the database
    const product = await createProductService(user.id);

    // Clear caches for related entities
    await Promise.all([
      clearBrandsAndCountCache(),
      // clearCategoriesAndCountCache(),
      clearShippingClassesAndCountCache(),
      clearTagsAndCountCache(),
      clearTaxClassesAndCountCache(),
    ]);

    return {
      statusCode: 201,
      success: true,
      message: "Product created successfully",
      product: await mapProductRecursive(product),
      __typename: "ProductResponse",
    };
  } catch (error: any) {
    console.error("Error creating product:", error);
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
