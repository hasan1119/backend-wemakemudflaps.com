import CONFIG from "../../../config/config";
import { Context } from "../../../context";
import { Category } from "../../../entities";
import {
  GetProductByIdResponseOrError,
  QueryGetProductArgs,
} from "../../../types";
import { idSchema } from "../../../utils/data-validation";
import {
  checkUserAuth,
  checkUserPermission,
  getProductById as getProductByIdService,
} from "../../services";

/**
 * Maps a Category entity to GraphQL-compatible plain object including nested subcategories recursively.
 */
function mapCategoryRecursive(category: Category): any {
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
 * Handles retrieving a product by its ID with validation and permission checks.
 *
 * Workflow:
 * 1. Verifies user authentication and checks permission to view products.
 * 2. Validates input product ID using Zod schema.
 * 3. Fetches product data from the database.
 * 4. Returns a success response with product data or an error if validation, permission, or retrieval fails.
 *
 * @param _ - Unused parent parameter for GraphQL resolver.
 * @param args - Input arguments containing the product ID.
 * @param context - GraphQL context containing authenticated user information.
 * @returns A promise resolving to a GetProductByIdResponseOrError object containing status, message, product data, and errors if applicable.
 */
export const getProductById = async (
  _: any,
  args: QueryGetProductArgs,
  { user }: Context
): Promise<GetProductByIdResponseOrError> => {
  try {
    // Verify user authentication
    const authResponse = checkUserAuth(user);
    if (authResponse) return authResponse;

    // Check if user has permission to view products
    const canRead = await checkUserPermission({
      action: "canRead",
      entity: "product",
      user,
    });

    if (!canRead) {
      return {
        statusCode: 403,
        success: false,
        message: "You do not have permission to view product info",
        __typename: "BaseResponse",
      };
    }

    // Validate input product ID with Zod schema
    const validationResult = await idSchema.safeParseAsync(args);

    if (!validationResult.success) {
      const errorMessages = validationResult.error.errors.map((error) => ({
        field: error.path.join("."),
        message: error.message,
      }));

      return {
        statusCode: 400,
        success: false,
        message: "Validation failed",
        errors: errorMessages,
        __typename: "ErrorResponse",
      };
    }

    const { id } = args;

    // Fetch product data from database
    const productData = await getProductByIdService(id);

    if (!productData || productData.deletedAt) {
      return {
        statusCode: 404,
        success: false,
        message: `Product not found with this id: ${id}, or it may have been deleted or moved to the trash`,
        __typename: "BaseResponse",
      };
    }

    return {
      statusCode: 200,
      success: true,
      message: "Product fetched successfully",
      product: {
        ...productData,
        defaultImage: productData.defaultImage as any,
        images: productData.images as any,
        videos: productData.videos as any,
        brands: productData.brands?.map((brand) => ({
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
        tags: productData.tags?.map((tag) => ({
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
        categories: productData.categories?.map(mapCategoryRecursive),
        salePriceStartAt: productData.salePriceStartAt?.toISOString(),
        salePriceEndAt: productData.salePriceEndAt?.toISOString(),
        tierPricingInfo: productData.tierPricingInfo as any,
        taxStatus: productData.taxStatus as any,
        taxClass: productData.taxClass as any,
        shippingClass: productData.shippingClass as any,
        upsells: productData.upsells as any,
        crossSells: productData.crossSells as any,
        attributes: productData.attributes.map((attribute) => ({
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
        variations: productData.variations as any,
        reviews: productData.reviews as any,
        createdBy: productData.createdBy as any,
        createdAt:
          productData.createdAt instanceof Date
            ? productData.createdAt.toISOString()
            : productData.createdAt,
        deletedAt: productData.deletedAt
          ? productData.deletedAt instanceof Date
            ? productData.deletedAt.toISOString()
            : productData.deletedAt
          : null,
      },
      __typename: "ProductResponse",
    };
  } catch (error: any) {
    console.error("Error retrieving product:", {
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
