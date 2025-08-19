import CONFIG from "../../../config/config";
import { Context } from "../../../context";
import {
  clearProductsAndCountCache,
  setProductInfoByIdInRedis,
  setProductInfoBySlugInRedis,
} from "../../../helper/redis";
import {
  BaseResponseOrError,
  MutationRestoreProductsArgs,
} from "../../../types";
import { idsSchema } from "../../../utils/data-validation";
import {
  checkUserAuth,
  checkUserPermission,
  getProductsByIds,
  mapProductRecursive,
  restoreProduct,
} from "../../services";

/**
 * Handles the restoration of soft-deleted products.
 *
 * Workflow:
 * 1. Verifies user authentication and permission to restore products.
 * 2. Validates input product IDs using Zod schema.
 * 3. Fetches product data from the database.
 * 4. Ensures all products are soft-deleted before restoration.
 * 5. Restores products in the database.
 * 6. Returns success response or error if validation, permission, or restoration fails.
 *
 * @param _ - Unused GraphQL resolver parent param.
 * @param args - Mutation args containing product IDs to restore.
 * @param context - GraphQL context with authenticated user.
 * @returns A promise resolving to BaseResponseOrError.
 */
export const restoreProducts = async (
  _: any,
  args: MutationRestoreProductsArgs,
  { user }: Context
): Promise<BaseResponseOrError> => {
  try {
    // Check authentication
    const authError = checkUserAuth(user);
    if (authError) return authError;

    // Check restore permission
    const hasPermission = await checkUserPermission({
      action: "canUpdate",
      entity: "product",
      user,
    });

    if (!hasPermission) {
      return {
        statusCode: 403,
        success: false,
        message: "You do not have permission to restore product(s)",
        __typename: "BaseResponse",
      };
    }

    // Validate input
    const validation = await idsSchema.safeParseAsync(args);
    if (!validation.success) {
      const errors = validation.error.errors.map((e) => ({
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

    const { ids } = validation.data;

    // Fetch products directly from the database
    const foundProducts = await getProductsByIds(ids);

    if (foundProducts.length !== ids.length) {
      const foundIds = new Set(foundProducts.map((r) => r.id));
      const notFoundProducts = ids.filter((id) => !foundIds.has(id));
      const notFoundNames = notFoundProducts.map((id) => {
        const product = foundProducts.find((r) => r.id === id);
        return product ? product.name : '"Unknown Product"';
      });

      return {
        statusCode: 404,
        success: false,
        message: `Products with names: ${notFoundNames.join(", ")} not found`,
        __typename: "BaseResponse",
      };
    }

    // Check all products are soft-deleted
    const notDeleted = foundProducts.filter((product) => !product.deletedAt);
    if (notDeleted.length > 0) {
      return {
        statusCode: 400,
        success: false,
        message: `Products with IDs ${notDeleted
          .map((r) => r.id)
          .join(", ")} are not in the trash`,
        __typename: "BaseResponse",
      };
    }

    // Restore products
    const restoredProducts = await restoreProduct(ids);

    await clearProductsAndCountCache();

    // Update product-specific caches
    await Promise.all(
      restoredProducts.map(async (product) => {
        const updatedProduct = await mapProductRecursive(product);
        return Promise.all([
          setProductInfoByIdInRedis(product.id, updatedProduct),
          setProductInfoBySlugInRedis(product.slug, updatedProduct),
        ]);
      })
    );

    return {
      statusCode: 200,
      success: true,
      message: `Product(s) restored successfully`,
      __typename: "BaseResponse",
    };
  } catch (error: any) {
    console.error("Error restoring product:", error);
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
