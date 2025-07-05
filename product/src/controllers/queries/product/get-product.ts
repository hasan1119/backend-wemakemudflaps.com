import CONFIG from "../../../config/config";
import { Context } from "../../../context";
import {
  getProductInfoByIdFromRedis,
  setProductInfoByIdInRedis,
} from "../../../helper/redis";
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
 * Handles retrieving a product by its ID with validation and permission checks.
 *
 * Workflow:
 * 1. Verifies user authentication and checks permission to view products.
 * 2. Validates input product ID using Zod schema.
 * 3. Attempts to retrieve product data from Redis for performance optimization.
 * 4. Fetches product data from the database if not found in Redis and caches it.
 * 5. Returns a success response with product data or an error if validation, permission, or retrieval fails.
 *
 * @param _ - Unused parent parameter for GraphQL resolver.
 * @param args - Input arguments containing the product ID.
 * @param context - GraphQL context containing authenticated user information.
 * @returns A promise resolving to a GetProductByIdResponseOrError object containing status, message, product data, and errors if applicable.
 */
export const getProduct = async (
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

    // Attempt to retrieve cached product data from Redis
    let productData = await getProductInfoByIdFromRedis(id);

    if (productData?.deletedAt) {
      return {
        statusCode: 404,
        success: false,
        message: `Product not found with this id: ${id}, or it may have been deleted or moved to the trash`,
        __typename: "BaseResponse",
      };
    }

    if (!productData) {
      // On cache miss, fetch product data from database
      const dbProduct = await getProductByIdService(id);

      if (!dbProduct) {
        return {
          statusCode: 404,
          success: false,
          message: `Product not found with this id: ${id}, or it may have been deleted or moved to the trash`,
          __typename: "BaseResponse",
        };
      }

      // Cache product data in Redis
      await setProductInfoByIdInRedis(id, dbProduct);
      productData = dbProduct;
    }

    return {
      statusCode: 200,
      success: true,
      message: "Product fetched successfully",
      product: {
        id: productData.id,
        productConfigurationType: productData.productConfigurationType,
        productDeliveryType: productData.productDeliveryType,
        isCustomized: productData.isCustomized,
        name: productData.name,
        slug: productData.slug,
        defaultImage: productData.defaultImage as any,
        images: productData.images as any,
        videos: productData.videos as any,
        brand: productData.brands as any,
        tags: productData.tags as any,
        defaultMainDescription: productData.defaultMainDescription,
        defaultShortDescription: productData.defaultShortDescription,
        defaultTags: productData.defaultTags,
        category: productData.category as any,
        subCategories: productData.subCategories as any,
        warrantyDigit: productData.warrantyDigit,
        defaultWarrantyPeriod: productData.defaultWarrantyPeriod,
        warrantyPolicy: productData.warrantyPolicy,
        regularPrice: productData.regularPrice,
        salePrice: productData.salePrice,
        salePriceStartAt: productData.salePriceStartAt?.toISOString(),
        salePriceEndAt: productData.salePriceEndAt?.toISOString(),
        tierPricingInfo: productData.tierPricingInfo as any,
        saleQuantity: productData.saleQuantity,
        saleQuantityUnit: productData.saleQuantityUnit,
        taxStatus: productData.taxStatus as any,
        taxClass: productData.taxClass as any,
        minQuantity: productData.minQuantity,
        defaultQuantity: productData.defaultQuantity,
        maxQuantity: productData.maxQuantity,
        quantityStep: productData.quantityStep,
        sku: productData.sku,
        model: productData.model,
        manageStock: productData.manageStock,
        stockQuantity: productData.stockQuantity,
        allowBackOrders: productData.allowBackOrders,
        lowStockThresHold: productData.lowStockThresHold,
        stockStatus: productData.stockStatus,
        soldIndividually: productData.soldIndividually,
        initialNumberInStock: productData.initialNumberInStock,
        weightUnit: productData.weightUnit,
        weight: productData.weight,
        dimensionUnit: productData.dimensionUnit,
        length: productData.length,
        width: productData.width,
        height: productData.height,
        shippingClass: productData.shippingClass as any,
        upsells: productData.upsells as any,
        crossSells: productData.crossSells as any,
        attributes: productData.attributes as any,
        variations: productData.variations as any,
        purchaseNote: productData.purchaseNote,
        enableReviews: productData.enableReviews,
        reviews: productData.reviews as any,
        customBadge: productData.customBadge,
        isPreview: productData.isPreview,
        isVisible: productData.isVisible,
        createdBy: productData.createdBy as any,
        createdAt: productData.createdAt.toISOString(),
        deletedAt: productData.deletedAt
          ? productData.deletedAt?.toISOString()
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
