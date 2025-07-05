import CONFIG from "../../../config/config";
import { Context } from "../../../context";
import { BaseResponseOrError, MutationDeleteProductArgs } from "../../../types";
import { idsSchema, skipTrashSchema } from "../../../utils/data-validation";
import {
  checkUserAuth,
  checkUserPermission,
  getProductsByIds,
  hardDeleteProduct,
  softDeleteProduct,
} from "../../services";

/**
 * Handles the deletion of products with validation and permission checks.
 *
 * Workflow:
 * 1. Verifies user authentication and permission to delete products.
 * 2. Validates input (ids, skipTrash) using Zod schemas.
 * 3. Retrieves product data from the database for each product ID.
 * 4. Performs soft or hard deletion based on skipTrash parameter.
 * 5. Returns a success response with deleted product names or error if validation, permission, or deletion fails.
 *
 * @param _ - Unused parent parameter for GraphQL resolver.
 * @param args - Input arguments containing product IDs and skipTrash flag.
 * @param context - GraphQL context containing authenticated user information.
 * @returns A promise resolving to a BaseResponseOrError object containing status, message, and errors if applicable.
 */
export const deleteProduct = async (
  _: any,
  args: MutationDeleteProductArgs,
  { user }: Context
): Promise<BaseResponseOrError> => {
  try {
    // Verify user authentication
    const authResponse = checkUserAuth(user);
    if (authResponse) return authResponse;

    // Check if user has permission to delete products
    const canDelete = await checkUserPermission({
      action: "canDelete",
      entity: "product",
      user,
    });

    if (!canDelete) {
      return {
        statusCode: 403,
        success: false,
        message: "You do not have permission to delete product(s)",
        __typename: "BaseResponse",
      };
    }

    const { ids, skipTrash } = args;

    // Validate input data with Zod schemas
    const [idsResult, skipTrashResult] = await Promise.all([
      idsSchema.safeParseAsync({ ids }),
      skipTrashSchema.safeParseAsync({ skipTrash }),
    ]);

    if (!idsResult.success || !skipTrashResult.success) {
      const errors = [
        ...(idsResult.error?.errors || []),
        ...(skipTrashResult.error?.errors || []),
      ].map((e) => ({
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

    // Fetch products directly from the database
    const foundProducts = await getProductsByIds(ids);

    if (foundProducts.length !== ids.length) {
      const foundIds = new Set(foundProducts.map((p) => p.id));
      const notFoundProducts = ids.filter((id) => !foundIds.has(id));
      return {
        statusCode: 404,
        success: false,
        message: `Products not found with IDs: ${notFoundProducts.join(", ")}`,
        __typename: "BaseResponse",
      };
    }

    const deletedProducts: string[] = [];

    for (const productData of foundProducts) {
      const { id, name, deletedAt } = productData;

      if (skipTrash) {
        await hardDeleteProduct(id);
      } else {
        if (deletedAt) {
          return {
            statusCode: 400,
            success: false,
            message: `Product: ${name} already in the trash`,
            __typename: "BaseResponse",
          };
        }
        await softDeleteProduct(id);
      }

      deletedProducts.push(name);
    }

    return {
      statusCode: 200,
      success: true,
      message: deletedProducts.length
        ? `${
            skipTrash
              ? "Product(s) permanently deleted"
              : "Product(s) moved to trash"
          } successfully: ${deletedProducts.join(", ")}`
        : "No products deleted",
      __typename: "BaseResponse",
    };
  } catch (error: any) {
    console.error("Error deleting product:", error);

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
