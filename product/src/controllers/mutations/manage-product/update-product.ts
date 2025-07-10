import CONFIG from "../../../config/config";
import { Context } from "../../../context";
import {
  MutationUpdateProductArgs,
  UpdateProductResponseOrError,
} from "../../../types";
import { updateProductSchema } from "../../../utils/data-validation/product/product";
import {
  checkUserAuth,
  checkUserPermission,
  findProductByNameToUpdate,
  findProductBySlugToUpdate,
  getBrandsByIds,
  getCategoryByIds,
  getProductById,
  getProductsByIds,
  getShippingClassById,
  getTagsByIds,
  getTaxClassById,
  getTaxStatusById,
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
      name,
      slug,
      brandIds,
      tagIds,
      categoryIds,
      shippingClassId,
      variations,
      taxStatusId,
      taxClassId,
      upsellIds,
      crossSellIds,
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

    // Check for duplicate name (if changed)
    if (name && name !== currentProduct.name) {
      let nameExists = await findProductByNameToUpdate(id, name);
      if (nameExists) {
        return {
          statusCode: 400,
          success: false,
          message: `Product name: "${name}" already exists`,
          __typename: "BaseResponse",
        };
      }
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
      const brands = await getBrandsByIds(brandIds);
      if (brands.length !== brandIds.length) {
        return {
          statusCode: 404,
          success: false,
          message: "One or more brands not found",
          __typename: "BaseResponse",
        };
      }
    }

    if (tagIds && tagIds.length > 0) {
      const tags = await getTagsByIds(tagIds);
      if (tags.length !== tagIds.length) {
        return {
          statusCode: 404,
          success: false,
          message: "One or more tags not found",
          __typename: "BaseResponse",
        };
      }
    }

    if (categoryIds) {
      const categories = await getCategoryByIds(categoryIds);

      if (categories.length !== categoryIds.length) {
        return {
          statusCode: 404,
          success: false,
          message: "One or more categories not found",
          __typename: "BaseResponse",
        };
      }
    }

    // Validate and fetch variation brands
    let updatedVariations = variations;
    if (variations && variations.length > 0) {
      const variationBrandIds = variations
        .flatMap((variation) => variation.brandIds ?? [])
        .filter((v, i, a) => a.indexOf(v) === i); // unique brandIds

      if (variationBrandIds.length > 0) {
        const variationBrands = await getBrandsByIds(variationBrandIds);
        if (variationBrands.length !== variationBrandIds.length) {
          return {
            statusCode: 404,
            success: false,
            message: "One or more brands inside variations not found",
            __typename: "BaseResponse",
          };
        }

        // Map brandIds to brand objects for each variation
        updatedVariations = variations.map((variation) => {
          const brandObjs = (variation.brandIds ?? [])
            .map((bid) => variationBrands.find((b) => b.id === bid))
            .filter(Boolean);

          return {
            ...variation,
            brands: brandObjs,
          };
        });
      }
    } else {
      updatedVariations = [];
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

    if (taxStatusId) {
      const taxStatus = await getTaxStatusById(taxStatusId);
      if (!taxStatus) {
        return {
          statusCode: 404,
          success: false,
          message: `Tax Status with ID: ${taxStatusId} not found`,
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
      const upSellsProduct = await getProductsByIds(upsellIds);
      if (upSellsProduct.length !== upsellIds.length) {
        return {
          statusCode: 404,
          success: false,
          message: "One or more upsell products not found",
          __typename: "BaseResponse",
        };
      }
    }

    if (crossSellIds && crossSellIds.length > 0) {
      const crossSellProducts = await getProductsByIds(crossSellIds);
      if (crossSellProducts.length !== crossSellIds.length) {
        return {
          statusCode: 404,
          success: false,
          message: `One or more cross-sell products not found`,
          __typename: "BaseResponse",
        };
      }
    }

    // Update the product in the database
    await updateProductService(id, {
      ...result.data,
      variations: updatedVariations,
    } as any);

    return {
      statusCode: 200,
      success: true,
      message: "Product updated successfully",
      __typename: "BaseResponse",
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
