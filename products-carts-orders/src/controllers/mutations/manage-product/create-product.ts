import CONFIG from "../../../config/config";
import { Context } from "../../../context";
import { clearProductsAndCountCache } from "../../../helper/redis";
import { CreateProductResponseOrError } from "../../../types";
import {
  checkUserAuth,
  checkUserPermission,
  createProduct as createProductService,
  mapProductRecursive,
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

    await clearProductsAndCountCache();

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
