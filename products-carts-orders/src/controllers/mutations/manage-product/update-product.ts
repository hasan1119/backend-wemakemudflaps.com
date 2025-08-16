import CONFIG from "../../../config/config";
import { Context } from "../../../context";
import {
  clearBrandsAndCountCache,
  clearShippingClassesAndCountCache,
  clearTagsAndCountCache,
  clearTaxClassesAndCountCache,
} from "../../../helper/redis";
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
  mapProductRecursive,
  updateProduct as updateProductService,
} from "../../services";

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

    await Promise.all([
      clearBrandsAndCountCache(),
      // clearCategoriesAndCountCache(),
      clearShippingClassesAndCountCache(),
      clearTagsAndCountCache(),
      clearTaxClassesAndCountCache(),
    ]);

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
