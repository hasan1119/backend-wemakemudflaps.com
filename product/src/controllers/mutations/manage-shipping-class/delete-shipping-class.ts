import CONFIG from "../../../config/config";
import { Context } from "../../../context";
import {
  clearAllShippingClassSearchCache,
  getShippingClassInfoByIdFromRedis,
  removeShippingClassInfoByIdFromRedis,
  removeShippingClassValueExistFromRedis,
  setShippingClassInfoByIdInRedis,
} from "../../../helper/redis";
import {
  BaseResponseOrError,
  MutationDeleteShippingClassArgs,
} from "../../../types";
import { idsSchema, skipTrashSchema } from "../../../utils/data-validation";
import {
  checkUserAuth,
  checkUserPermission,
  countProductsForShippingClass,
  getShippingClassesByIds,
  hardDeleteShippingClass,
  softDeleteShippingClass,
} from "../../services";

// Clear shipping-class related cache entries in Redis
const clearShippingClassCache = async (id: string, value: string) => {
  await Promise.all([
    removeShippingClassInfoByIdFromRedis(id),
    removeShippingClassValueExistFromRedis(value),
    clearAllShippingClassSearchCache(),
  ]);
};

// Perform soft delete and update cache
const softDeleteAndCache = async (id: string) => {
  const deletedData = await softDeleteShippingClass(id);
  setShippingClassInfoByIdInRedis(id, deletedData);
  await clearAllShippingClassSearchCache();
};

/**
 * Handles the deletion of shipping classes with validation and permission checks.
 *
 * Workflow:
 * 1. Verifies user authentication and permission to delete shipping classes.
 * 2. Validates input (ids, skipTrash) using Zod schemas.
 * 3. Retrieves shipping class data from Redis or database for each shipping class ID.
 * 4. Ensures shipping classes are not used in any products.
 * 5. Performs soft or hard deletion based on skipTrash parameter.
 * 6. Clears related cache entries in Redis.
 * 7. Returns a success response with deleted shipping class names or error if validation, permission, or deletion fails.
 *
 * @param _ - Unused parent parameter for GraphQL resolver.
 * @param args - Input arguments containing shipping class IDs and skipTrash flag.
 * @param context - GraphQL context containing authenticated user information.
 * @returns A promise resolving to a BaseResponseOrError object containing status, message, and errors if applicable.
 */
export const deleteShippingClass = async (
  _: any,
  args: MutationDeleteShippingClassArgs,
  { user }: Context
): Promise<BaseResponseOrError> => {
  try {
    // Verify user authentication
    const authResponse = checkUserAuth(user);
    if (authResponse) return authResponse;

    // Check if user has permission to delete shipping classes
    const canDelete = await checkUserPermission({
      action: "canDelete",
      entity: "shipping class",
      user,
    });

    if (!canDelete) {
      return {
        statusCode: 403,
        success: false,
        message: "You do not have permission to delete shipping class(es)",
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

    // Attempt to retrieve shipping class data from Redis
    const cachedShippingClasses = await Promise.all(
      ids.map(getShippingClassInfoByIdFromRedis)
    );

    const foundShippingClasses: any[] = [];
    const missingIds: string[] = [];

    cachedShippingClasses.forEach((shippingClass, index) => {
      if (shippingClass) {
        foundShippingClasses.push(shippingClass);
      } else {
        missingIds.push(ids[index]);
      }
    });

    // Fetch missing shipping classes from the database
    if (missingIds.length > 0) {
      const dbShippingClasses = await getShippingClassesByIds(missingIds);

      if (dbShippingClasses.length !== missingIds.length) {
        const dbFoundIds = new Set(dbShippingClasses.map((t) => t.id));
        const notFoundShippingClasses = missingIds
          .filter((id) => !dbFoundIds.has(id))
          .map((id) => id);

        return {
          statusCode: 404,
          success: false,
          message: `Shipping class not found with IDs: ${notFoundShippingClasses.join(
            ", "
          )}`,
          __typename: "BaseResponse",
        };
      }

      foundShippingClasses.push(...dbShippingClasses);
    }

    const deletedShippingClasses: string[] = [];

    for (const shippingClassData of foundShippingClasses) {
      const { id, value, deletedAt } = shippingClassData;

      let shippingClassProducts;

      // Attempt to fetch shipping class info from Redis
      shippingClassProducts = await getShippingClassInfoByIdFromRedis(id);

      // Initialize productCount
      let productCount = 0;

      // Fallback to using products array from Redis (if present)
      if (
        !shippingClassProducts ||
        !Array.isArray(shippingClassProducts.products) ||
        shippingClassProducts.products.length === 0
      ) {
        // Attempt DB fallback to count products by shipping class
        productCount = await countProductsForShippingClass(id);
      } else {
        productCount = shippingClassProducts?.products.length;
      }

      // Prevent deletion if shipping class is in use
      if (productCount > 0) {
        return {
          statusCode: 400,
          success: false,
          message: `Shipping class "${value}" cannot be deleted because it is used in ${productCount} product(s)`,
          __typename: "BaseResponse",
        };
      }

      // Perform soft or hard deletion based on skipTrash
      if (skipTrash) {
        await hardDeleteShippingClass(id);
        await clearShippingClassCache(id, value);
      } else {
        if (deletedAt) {
          return {
            statusCode: 400,
            success: false,
            message: `Shipping class: ${value} already in the trash`,
            __typename: "BaseResponse",
          };
        }
        await softDeleteAndCache(id);
      }

      deletedShippingClasses.push(value);
    }

    return {
      statusCode: 200,
      success: true,
      message: deletedShippingClasses.length
        ? `${
            skipTrash
              ? "Shipping class(es) permanently deleted"
              : "Shipping class(es) moved to trash"
          } successfully: ${deletedShippingClasses.join(", ")}`
        : "No shipping classes deleted",
      __typename: "BaseResponse",
    };
  } catch (error: any) {
    console.error("Error deleting shipping class:", error);

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
