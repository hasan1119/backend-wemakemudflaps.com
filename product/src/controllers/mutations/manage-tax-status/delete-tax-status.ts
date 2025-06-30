import CONFIG from "../../../config/config";
import { Context } from "../../../context";
import {
  clearAllTaxStatusSearchCache,
  getTaxStatusInfoByIdFromRedis,
  removeTaxStatusInfoByIdFromRedis,
  removeTaxStatusValueExistFromRedis,
  setTaxStatusInfoByIdInRedis,
} from "../../../helper/redis";
import {
  BaseResponseOrError,
  MutationDeleteTaxStatusArgs,
} from "../../../types";
import { idsSchema, skipTrashSchema } from "../../../utils/data-validation";
import {
  checkUserAuth,
  checkUserPermission,
  countProductsForTaxStatus,
  getTaxStatusByIds,
  hardDeleteTaxStatus,
  softDeleteTaxStatus,
} from "../../services";

// Clear tax-status related cache entries in Redis
const clearTaxStatusCache = async (id: string, value: string) => {
  await Promise.all([
    removeTaxStatusInfoByIdFromRedis(id),
    removeTaxStatusValueExistFromRedis(value),
    clearAllTaxStatusSearchCache(),
  ]);
};

// Perform soft delete and update cache
const softDeleteAndCache = async (id: string) => {
  const deletedData = await softDeleteTaxStatus(id);
  setTaxStatusInfoByIdInRedis(id, deletedData);
  await clearAllTaxStatusSearchCache();
};

/**
 * Handles the deletion of tax status with validation and permission checks.
 *
 * Workflow:
 * 1. Verifies user authentication and permission to delete tax status.
 * 2. Validates input (ids, skipTrash) using Zod schemas.
 * 3. Retrieves tax status data from Redis or database for each tax status ID.
 * 4. Ensures tax status are not used in any products.
 * 5. Performs soft or hard deletion based on skipTrash parameter.
 * 6. Clears related cache entries in Redis.
 * 7. Returns a success response with deleted tax status names or error if validation, permission, or deletion fails.
 *
 * @param _ - Unused parent parameter for GraphQL resolver.
 * @param args - Input arguments containing tax status IDs and skipTrash flag.
 * @param context - GraphQL context containing authenticated user information.
 * @returns A promise resolving to a BaseResponseOrError object containing status, message, and errors if applicable.
 */
export const deleteTaxStatus = async (
  _: any,
  args: MutationDeleteTaxStatusArgs,
  { user }: Context
): Promise<BaseResponseOrError> => {
  try {
    // Verify user authentication
    const authResponse = checkUserAuth(user);
    if (authResponse) return authResponse;

    // Check if user has permission to delete tax status
    const canDelete = await checkUserPermission({
      action: "canDelete",
      entity: "tax status",
      user,
    });

    if (!canDelete) {
      return {
        statusCode: 403,
        success: false,
        message: "You do not have permission to delete tax status(es)",
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

    // Attempt to retrieve tax status data from Redis
    const cachedTaxStatuses = await Promise.all(
      ids.map(getTaxStatusInfoByIdFromRedis)
    );

    const foundTaxStatuses: any[] = [];
    const missingIds: string[] = [];

    cachedTaxStatuses.forEach((taxStatus, index) => {
      if (taxStatus) {
        foundTaxStatuses.push(taxStatus);
      } else {
        missingIds.push(ids[index]);
      }
    });

    // Fetch missing tax status from the database
    if (missingIds.length > 0) {
      const dbTaxStatuses = await getTaxStatusByIds(missingIds);

      if (dbTaxStatuses.length !== missingIds.length) {
        const dbFoundIds = new Set(dbTaxStatuses.map((t) => t.id));
        const notFoundTaxStatuses = missingIds
          .filter((id) => !dbFoundIds.has(id))
          .map((id) => id);

        return {
          statusCode: 404,
          success: false,
          message: `Tax status not found with IDs: ${notFoundTaxStatuses.join(
            ", "
          )}`,
          __typename: "BaseResponse",
        };
      }

      foundTaxStatuses.push(...dbTaxStatuses);
    }

    const deletedTaxStatuses: string[] = [];

    for (const taxStatusData of foundTaxStatuses) {
      const { id, value, deletedAt } = taxStatusData;

      let taxStatusProducts;

      // Attempt to fetch tax status info from Redis
      taxStatusProducts = await getTaxStatusInfoByIdFromRedis(id);

      // Initialize productCount
      let productCount = 0;

      // Fallback to using products array from Redis (if present)
      if (
        !taxStatusProducts ||
        !Array.isArray(taxStatusProducts.products) ||
        taxStatusProducts.products.length === 0
      ) {
        // Attempt DB fallback to count products by tax status
        productCount = await countProductsForTaxStatus(id);
      } else {
        productCount = taxStatusProducts?.products.length;
      }

      // Prevent deletion if tax status is in use
      if (productCount > 0) {
        return {
          statusCode: 400,
          success: false,
          message: `Tax status "${value}" cannot be deleted because it is used in ${productCount} product(s)`,
          __typename: "BaseResponse",
        };
      }

      // Perform soft or hard deletion based on skipTrash
      if (skipTrash) {
        await hardDeleteTaxStatus(id);
        await clearTaxStatusCache(id, value);
      } else {
        if (deletedAt) {
          return {
            statusCode: 400,
            success: false,
            message: `Tax status: ${value} already in the trash`,
            __typename: "BaseResponse",
          };
        }
        await softDeleteAndCache(id);
      }

      deletedTaxStatuses.push(value);
    }

    return {
      statusCode: 200,
      success: true,
      message: deletedTaxStatuses.length
        ? `${
            skipTrash
              ? "Tax status(es) permanently deleted"
              : "Tax status(es) moved to trash"
          } successfully: ${deletedTaxStatuses.join(", ")}`
        : "No tax status deleted",
      __typename: "BaseResponse",
    };
  } catch (error: any) {
    console.error("Error deleting tax status:", error);

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
