import CONFIG from "../../../config/config";
import { Context } from "../../../context";
import {
  clearBrandsAndCountCache,
  clearShippingClassesAndCountCache,
  clearTagsAndCountCache,
  clearTaxClassesAndCountCache,
} from "../../../helper/redis";
import {
  CreateProductResponseOrError,
  MutationCreateProductArgs,
} from "../../../types";
import { createProductSchema } from "../../../utils/data-validation/product/product";
import {
  checkUserAuth,
  checkUserPermission,
  createProduct as createProductService,
  findProductBySlug,
  getBrandsByIds,
  getCategoryByIds,
  getProductAttributesByIds,
  getProductsByIds,
  getShippingClassById,
  getTagsByIds,
  getTaxClassById,
  getTaxClassByIds,
} from "../../services";

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
  args: MutationCreateProductArgs,
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

    // Validate input data with Zod schema
    const result = await createProductSchema.safeParseAsync({
      ...args,
      createdBy: user.id,
    });

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
      name,
      slug,
      brandIds,
      tagIds,
      categoryIds,
      shippingClassId,
      taxClassId,
      variations,
      upsellIds,
      crossSellIds,
      attributeIds,
    } = result.data;

    // Check database for existing product slug
    const existingSlugProduct = await findProductBySlug(slug);
    if (existingSlugProduct) {
      return {
        statusCode: 400,
        success: false,
        message: `A product with this slug: ${slug} already exists`,
        __typename: "BaseResponse",
      };
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
          message: `One or more categories not found`,
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

        if (variationBrands.length !== variationBrandIds.length) {
          return {
            statusCode: 404,
            success: false,
            message: "One or more brands inside variations not found",
            __typename: "BaseResponse",
          };
        }
      }

      const variationsTaxClassIds = variations.flatMap(
        (variation) => variation.taxClassId ?? []
      );

      if (variationsTaxClassIds.length > 0) {
        const taxClasses = await getTaxClassByIds(variationsTaxClassIds);
        if (!taxClasses) {
          return {
            statusCode: 404,
            success: false,
            message: "One or more tax classes inside variations not found",
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

    if (attributeIds && attributeIds.length > 0) {
      const attributes = await getProductAttributesByIds(attributeIds);

      if (attributes.length !== attributeIds.length) {
        return {
          statusCode: 404,
          success: false,
          message: "One or more product attributes not found",
          __typename: "BaseResponse",
        };
      }
    }

    // Create the product in the database
    await createProductService(
      {
        ...result.data,
      } as any,
      user.id
    );

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
      __typename: "BaseResponse",
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
