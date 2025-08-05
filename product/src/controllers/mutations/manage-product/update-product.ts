import CONFIG from "../../../config/config";
import { Context } from "../../../context";
import { Category, Product, ProductPrice } from "../../../entities";
import {
  MutationUpdateProductArgs,
  UpdateProductResponseOrError,
} from "../../../types";
import { updateProductSchema } from "../../../utils/data-validation/product/product";
import {
  checkUserAuth,
  checkUserPermission,
  findProductBySlugToUpdate,
  getBrandsByIds,
  getCategoryByIds,
  getProductAttributesByIds,
  getProductAttributeValuesByIds,
  getProductById,
  getProductsByIds,
  getShippingClassById,
  getShippingClassesByIds,
  getTagsByIds,
  getTaxClassById,
  getTaxClassByIds,
  updateProduct as updateProductService,
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
 * Handles updating product data with proper validation and permission checks.
 *
 * Workflow:
 * 1. Authenticates user and verifies permission to update products.
 * 2. Validates input (id, and other product details) using Zod schema.
 * 3. Fetches current product data from DB.
 * 4. Checks if updated name or slug conflicts with existing products.
 * 5. Validates existence of related entities (brands, tags, categories, shipping class, tax status, tax class, upsells, cross-sells).
 * 6. Updates the product in the database.
 * 7. Returns the updated product or error if validation or update fails.
 *
 * @param _ - Unused parent parameter for GraphQL resolver.
 * @param args - Input arguments containing product ID and updated fields.
 * @param context - GraphQL context containing authenticated user information.
 * @returns A promise resolving to an UpdateProductResponseOrError.
 */
export const updateProduct = async (
  _: any,
  args: MutationUpdateProductArgs,
  { user }: Context
): Promise<UpdateProductResponseOrError> => {
  try {
    // Check user authentication
    const authError = checkUserAuth(user);
    if (authError) return authError;

    // Permission check
    const hasPermission = await checkUserPermission({
      user,
      action: "canUpdate",
      entity: "product",
    });

    if (!hasPermission) {
      return {
        statusCode: 403,
        success: false,
        message: "You do not have permission to update products",
        __typename: "BaseResponse",
      };
    }

    // Validate input
    const result = await updateProductSchema.safeParseAsync(args);
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
      slug,
      brandIds,
      tagIds,
      categoryIds,
      shippingClassId,
      variations,
      taxClassId,
      upsellIds,
      crossSellIds,
      attributeIds,
    } = result.data;

    // Get current product data from DB
    let currentProduct = await getProductById(id);
    if (!currentProduct) {
      return {
        statusCode: 404,
        success: false,
        message: `Product not found with this id: ${id}, or it may have been deleted or moved to the trash`,
        __typename: "BaseResponse",
      };
    }
    // Check for duplicate slug (if changed)
    if (slug && slug !== currentProduct.slug) {
      let slugExists = await findProductBySlugToUpdate(id, slug);
      if (slugExists) {
        return {
          statusCode: 400,
          success: false,
          message: `Product slug: "${slug}" already exists`,
          __typename: "BaseResponse",
        };
      }
    }

    // Validate existence of related entities
    if (brandIds && brandIds.length > 0) {
      // Remove duplicate brandIds
      const uniqueBrandIds = Array.from(new Set(brandIds));

      const brands = await getBrandsByIds(uniqueBrandIds);
      if (brands.length !== uniqueBrandIds.length) {
        return {
          statusCode: 404,
          success: false,
          message: "One or more brands not found",
          __typename: "BaseResponse",
        };
      }
    }

    if (tagIds && tagIds.length > 0) {
      // Remove duplicate tagIds
      const uniqueTagIds = Array.from(new Set(tagIds));

      const tags = await getTagsByIds(uniqueTagIds);
      if (tags.length !== uniqueTagIds.length) {
        return {
          statusCode: 404,
          success: false,
          message: "One or more tags not found",
          __typename: "BaseResponse",
        };
      }
    }

    if (categoryIds) {
      // Remove duplicate categoryIds
      const uniqueCategoryIds = Array.from(new Set(categoryIds));

      const categories = await getCategoryByIds(uniqueCategoryIds);

      if (categories.length !== uniqueCategoryIds.length) {
        return {
          statusCode: 404,
          success: false,
          message: "One or more categories not found",
          __typename: "BaseResponse",
        };
      }
    }

    if (variations && variations.length > 0) {
      const variationBrandIds = variations
        .flatMap((variation) => variation.brandIds ?? [])
        .filter((v, i, a) => a.indexOf(v) === i); // unique brandIds

      if (variationBrandIds.length > 0) {
        const variationBrands = await getBrandsByIds(variationBrandIds);

        if (!variationBrands.length) {
          return {
            statusCode: 404,
            success: false,
            message: "One or more brands inside variations not found",
            __typename: "BaseResponse",
          };
        }
      }

      const variationsTaxClassIds = variations
        .flatMap((variation) => variation.taxClassId ?? [])
        .filter((v, i, a) => a.indexOf(v) === i); // unique taxClassIds

      if (variationsTaxClassIds.length > 0) {
        const taxClasses = await getTaxClassByIds(variationsTaxClassIds);
        if (!taxClasses.length) {
          return {
            statusCode: 404,
            success: false,
            message: "One or more tax classes inside variations not found",
            __typename: "BaseResponse",
          };
        }
      }

      const variationsShippingClassIds = variations
        .flatMap((variation) => variation.shippingClassId ?? [])
        .filter((v, i, a) => a.indexOf(v) === i); // unique shippingClassIds

      if (variationsShippingClassIds.length > 0) {
        const shippingClasses = await getShippingClassesByIds(
          variationsShippingClassIds
        );

        if (!shippingClasses.length) {
          return {
            statusCode: 404,
            success: false,
            message: "One or more shipping classes inside variations not found",
            __typename: "BaseResponse",
          };
        }
      }

      const variationsAttributeValueIds = variations.flatMap(
        (variation) => variation.attributeValueIds?.map((av) => av) || []
      );

      if (variationsAttributeValueIds.length > 0) {
        const attributesValues =
          (await getProductAttributeValuesByIds(variationsAttributeValueIds)) ??
          [];

        if (!attributesValues.length) {
          return {
            statusCode: 404,
            success: false,
            message:
              "One or more product attribute values inside variations not found",
            __typename: "BaseResponse",
          };
        }

        const hasSystemAttribute = await Promise.all(
          attributesValues.map(async (value) => {
            const attribute = await value.attribute;
            return attribute?.systemAttribute === true;
          })
        );

        if (hasSystemAttribute.some(Boolean)) {
          return {
            statusCode: 400,
            success: false,
            message:
              "Cannot update product with system attribute values inside variations. Please remove system attribute values before updating.",
            __typename: "BaseResponse",
          };
        }
      }
    }

    if (shippingClassId) {
      const shippingClass = await getShippingClassById(shippingClassId);
      if (!shippingClass) {
        return {
          statusCode: 404,
          success: false,
          message: `Shipping Class with ID: ${shippingClassId} not found`,
          __typename: "BaseResponse",
        };
      }
    }

    if (taxClassId) {
      const taxClass = await getTaxClassById(taxClassId);
      if (!taxClass) {
        return {
          statusCode: 404,
          success: false,
          message: `Tax Class with ID: ${taxClassId} not found`,
          __typename: "BaseResponse",
        };
      }
    }

    if (upsellIds && upsellIds.length > 0) {
      // Remove duplicate upsellIds
      const uniqueUpsellIds = Array.from(new Set(upsellIds));

      if (id && uniqueUpsellIds.includes(args.id)) {
        return {
          statusCode: 400,
          success: false,
          message: "Cannot upsell the product to itself",
          __typename: "BaseResponse",
        };
      }

      const upSellsProduct = await getProductsByIds(uniqueUpsellIds);
      if (upSellsProduct.length !== uniqueUpsellIds.length) {
        return {
          statusCode: 404,
          success: false,
          message: "One or more upsell products not found",
          __typename: "BaseResponse",
        };
      }
    }

    if (crossSellIds && crossSellIds.length > 0) {
      // Remove duplicate crossSellIds
      const uniqueCrossSellIds = Array.from(new Set(crossSellIds));

      if (id && uniqueCrossSellIds.includes(args.id)) {
        return {
          statusCode: 400,
          success: false,
          message: "Cannot upsell the product to itself",
          __typename: "BaseResponse",
        };
      }

      const crossSellProducts = await getProductsByIds(uniqueCrossSellIds);
      if (crossSellProducts.length !== uniqueCrossSellIds.length) {
        return {
          statusCode: 404,
          success: false,
          message: `One or more cross-sell products not found`,
          __typename: "BaseResponse",
        };
      }
    }

    if (attributeIds && attributeIds.length > 0) {
      // Remove duplicate attributeIds
      const uniqueAttributeIds = Array.from(new Set(attributeIds));

      const attributes = await getProductAttributesByIds(uniqueAttributeIds);

      if (attributes.length !== uniqueAttributeIds.length) {
        return {
          statusCode: 404,
          success: false,
          message: "One or more product attributes not found",
          __typename: "BaseResponse",
        };
      }

      const isSystemAttributeUsed = attributes.some(
        (attribute) => attribute.systemAttribute === true
      );

      if (isSystemAttributeUsed) {
        return {
          statusCode: 400,
          success: false,
          message:
            "Cannot update product with system attributes. Please remove system attributes before updating.",
          __typename: "BaseResponse",
        };
      }
    }

    // Update the product in the database

    const product = await updateProductService(currentProduct, {
      ...result.data,
    } as any);

    return {
      statusCode: 200,
      success: true,
      message: "Product updated successfully",
      product: await mapProductRecursive(product),
      __typename: "ProductResponse",
    };
  } catch (error: any) {
    console.error("Error updating product:", error);
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
