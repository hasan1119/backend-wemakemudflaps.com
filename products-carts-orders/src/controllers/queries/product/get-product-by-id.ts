import CONFIG from "../../../config/config";
import { Context } from "../../../context";
import { getProductInfoByIdFromRedis } from "../../../helper/redis";
import {
  GetProductByIdResponseOrError,
  QueryGetProductByIdArgs,
} from "../../../types";
import { idSchema } from "../../../utils/data-validation";
import {
  checkUserAuth,
  checkUserPermission,
  getProductById as getProductByIdService,
  mapProductRecursive,
} from "../../services";

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
  args: QueryGetProductByIdArgs,
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

    let productData;

    // Try fetching product data from Redis
    productData = await getProductInfoByIdFromRedis(id);

    if (!productData) {
      // Fetch product data from database
      productData = await getProductByIdService(id);

      productData = await mapProductRecursive(productData);

      if (!productData || productData.deletedAt) {
        return {
          statusCode: 404,
          success: false,
          message: `Product not found with this id: ${id}, or it may have been deleted or moved to the trash`,
          __typename: "BaseResponse",
        };
      }
    }

    return {
      statusCode: 200,
      success: true,
      message: "Product fetched successfully",
      product: productData,
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
