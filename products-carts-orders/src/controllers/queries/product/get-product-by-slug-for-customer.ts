import CONFIG from "../../../config/config";
import { Context } from "../../../context";
import {
  GetProductBySlugResponseOrError,
  QueryGetProductBySlugForCustomerArgs,
} from "../../../types";
import { slugSchema } from "../../../utils/data-validation";
import { findProductBySlug, mapProductRecursive } from "../../services";

/**
 * Handles retrieving a product by its slug with validation and permission checks.
 *
 * Workflow:
 * 1. Verifies user authentication and checks permission to view products.
 * 2. Validates input product slug using Zod schema.
 * 3. Fetches product data from the database.
 * 4. Returns a success response with product data or an error if validation, permission, or retrieval fails.
 *
 * @param _ - Unused parent parameter for GraphQL resolver.
 * @param args - Input arguments containing the product slug.
 * @param context - GraphQL context containing authenticated user information.
 * @returns A promise resolving to a GetProductBySlugResponseOrError object containing status, message, product data, and errors if applicable.
 */
export const getProductBySlugForCustomer = async (
  _: any,
  args: QueryGetProductBySlugForCustomerArgs,
  { user }: Context
): Promise<GetProductBySlugResponseOrError> => {
  try {
    // Validate input product slug with Zod schema
    const validationResult = await slugSchema.safeParseAsync(args);

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

    const { slug } = args;

    // Fetch product data from database
    const productData = await findProductBySlug(slug);

    if (!productData || productData.deletedAt) {
      return {
        statusCode: 404,
        success: false,
        message: `Product not found with this slug: ${slug}, or it may have been deleted or moved to the trash`,
        __typename: "BaseResponse",
      };
    }

    if (!productData.isVisible) {
      return {
        statusCode: 403,
        success: false,
        message: "This product is not visible to customers",
        __typename: "BaseResponse",
      };
    }

    return {
      statusCode: 200,
      success: true,
      message: "Product fetched successfully",
      product: await mapProductRecursive(productData),
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
