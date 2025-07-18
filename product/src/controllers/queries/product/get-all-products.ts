import { z } from "zod";
import CONFIG from "../../../config/config";
import { Context } from "../../../context";
import { Category } from "../../../entities";
import {
  GetProductsResponseOrError,
  QueryGetAllProductsArgs,
} from "../../../types";
import {
  paginationSchema,
  productSortingSchema,
} from "../../../utils/data-validation";
import {
  checkUserAuth,
  checkUserPermission,
  paginateProducts,
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

// Combine pagination and sorting schemas for validation
const combinedSchema = z.intersection(paginationSchema, productSortingSchema);

// Map GraphQL input arguments to schema fields
const mapArgsToPagination = (args: QueryGetAllProductsArgs) => ({
  page: args.page,
  limit: args.limit,
  search: args.search,
  sortBy: args.sortBy || "createdAt",
  sortOrder: args.sortOrder || "desc",
});

/**
 * Handles fetching a paginated list of products with optional search and sorting.
 *
 * Workflow:
 * 1. Verifies user authentication and checks read permission for products.
 * 2. Validates input (page, limit, search, sortBy, sortOrder) using Zod schemas.
 * 3. Attempts to retrieve products and total count from Redis for performance.
 * 4. On cache miss, fetches products from the database with pagination, search, and sorting.
 * 5. Maps database products to cached format, including creator details.
 * 6. Caches products and total count in Redis.
 * 7. Returns a success response or error if validation, permission, or retrieval fails.
 *
 * @param _ - Unused parent parameter for GraphQL resolver.
 * @param args - Input arguments containing page, limit, search, sortBy, and sortOrder.
 * @param context - GraphQL context containing authenticated user information.
 * @returns A promise resolving to a GetProductsResponseOrError object containing status, message, products, total count, and errors if applicable.
 */
export const getAllProducts = async (
  _: any,
  args: QueryGetAllProductsArgs,
  { user }: Context
): Promise<GetProductsResponseOrError> => {
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
        message: "You do not have permission to view products info",
        __typename: "BaseResponse",
      };
    }

    // Map and validate input arguments
    const mappedArgs = mapArgsToPagination(args);
    const validationResult = await combinedSchema.safeParseAsync(mappedArgs);

    if (!validationResult.success) {
      const errors = validationResult.error.errors.map((e) => ({
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

    const { page, limit, search, sortBy, sortOrder } = mappedArgs;

    // Ensure sortOrder is "asc" or "desc"
    const safeSortOrder = sortOrder === "asc" ? "asc" : "desc";

    // Fetch products from database directly
    const { products: dbProducts, total } = await paginateProducts({
      page,
      limit,
      search,
      sortBy,
      sortOrder: safeSortOrder,
    });

    // Map database products to response format
    const productsData = dbProducts.map((product) => ({
      id: product.id,
      productConfigurationType: product.productConfigurationType,
      productDeliveryType: product.productDeliveryType,
      isCustomized: product.isCustomized,
      name: product.name,
      slug: product.slug,
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
      defaultMainDescription: product.defaultMainDescription,
      defaultShortDescription: product.defaultShortDescription,
      categories: product.categories?.map(mapCategoryRecursive),
      warrantyDigit: product.warrantyDigit,
      defaultWarrantyPeriod: product.defaultWarrantyPeriod,
      warrantyPolicy: product.warrantyPolicy,
      regularPrice: product.regularPrice,
      salePrice: product.salePrice,
      salePriceStartAt: product.salePriceStartAt?.toISOString(),
      salePriceEndAt: product.salePriceEndAt?.toISOString(),
      tierPricingInfo: product.tierPricingInfo as any,
      saleQuantity: product.saleQuantity,
      saleQuantityUnit: product.saleQuantityUnit,
      taxStatus: product.taxStatus as any,
      taxClass: product.taxClass as any,
      minQuantity: product.minQuantity,
      defaultQuantity: product.defaultQuantity,
      maxQuantity: product.maxQuantity,
      quantityStep: product.quantityStep,
      sku: product.sku,
      model: product.model,
      manageStock: product.manageStock,
      stockQuantity: product.stockQuantity,
      allowBackOrders: product.allowBackOrders,
      lowStockThresHold: product.lowStockThresHold,
      stockStatus: product.stockStatus,
      soldIndividually: product.soldIndividually,
      initialNumberInStock: product.initialNumberInStock,
      weightUnit: product.weightUnit,
      weight: product.weight,
      dimensionUnit: product.dimensionUnit,
      length: product.length,
      width: product.width,
      height: product.height,
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
      purchaseNote: product.purchaseNote,
      enableReviews: product.enableReviews,
      reviews: product.reviews as any,
      customBadge: product.customBadge,
      isVisible: product.isVisible,
      createdBy: product.createdBy as any,
      createdAt: product.createdAt.toISOString(),
      deletedAt: product.deletedAt?.toISOString(),
    }));

    return {
      statusCode: 200,
      success: true,
      message: "Product(s) fetched successfully",
      products: productsData,
      total,
      __typename: "ProductPaginationResponse",
    };
  } catch (error: any) {
    console.error("Error fetching products:", {
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
