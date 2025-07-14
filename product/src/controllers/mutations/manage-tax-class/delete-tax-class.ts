import CONFIG from "../../../config/config";
import { Context } from "../../../context";
import {
  clearTaxClassesAndCountCache,
  getTaxClassInfoByIdFromRedis,
  removeTaxClassInfoByIdFromRedis,
  removeTaxClassValueExistFromRedis,
  setTaxClassInfoByIdInRedis,
} from "../../../helper/redis";
import {
  BaseResponseOrError,
  MutationDeleteTaxClassArgs,
} from "../../../types";
import { idsSchema, skipTrashSchema } from "../../../utils/data-validation";
import {
  checkUserAuth,
  checkUserPermission,
  getTaxClassByIds,
  hardDeleteTaxClass,
  softDeleteTaxClass,
} from "../../services";

// Clear tax-class related cache entries in Redis
const clearTaxClassCache = async (id: string, value: string) => {
  await Promise.all([
    removeTaxClassInfoByIdFromRedis(id),
    removeTaxClassValueExistFromRedis(value),
    clearTaxClassesAndCountCache(),
  ]);
};

// Perform soft delete and update cache
const softDeleteAndCache = async (id: string) => {
  const deletedData = await softDeleteTaxClass(id);
  setTaxClassInfoByIdInRedis(id, deletedData);
  await clearTaxClassesAndCountCache();
};

/**
 * Handles the deletion of tax classes with validation and permission checks.
 *
 * Workflow:
 * 1. Verifies user authentication and permission to delete tax classes.
 * 2. Validates input (ids, skipTrash) using Zod schemas.
 * 3. Retrieves tax class data from Redis or database for each tax class ID.
 * 4. Ensures tax classes are not used in any products.
 * 5. Performs soft or hard deletion based on skipTrash parameter.
 * 6. Clears related cache entries in Redis.
 * 7. Returns a success response with deleted tax class names or error if validation, permission, or deletion fails.
 *
 * @param _ - Unused parent parameter for GraphQL resolver.
 * @param args - Input arguments containing tax class IDs and skipTrash flag.
 * @param context - GraphQL context containing authenticated user information.
 * @returns A promise resolving to a BaseResponseOrError object containing status, message, and errors if applicable.
 */
export const deleteTaxClass = async (
  _: any,
  args: MutationDeleteTaxClassArgs,
  { user }: Context
): Promise<BaseResponseOrError> => {
  try {
    // Verify user authentication
    const authResponse = checkUserAuth(user);
    if (authResponse) return authResponse;

    // Check if user has permission to delete tax classes
    const canDelete = await checkUserPermission({
      action: "canDelete",
      entity: "tax class",
      user,
    });

    if (!canDelete) {
      return {
        statusCode: 403,
        success: false,
        message: "You do not have permission to delete tax class(es)",
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

    // Attempt to retrieve tax class data from Redis
    const cachedTaxClasses = await Promise.all(
      ids.map(getTaxClassInfoByIdFromRedis)
    );

    const foundTaxClasses: any[] = [];
    const missingIds: string[] = [];

    cachedTaxClasses.forEach((taxClass, index) => {
      if (taxClass) {
        foundTaxClasses.push(taxClass);
      } else {
        missingIds.push(ids[index]);
      }
    });

    // Fetch missing tax classes from the database
    if (missingIds.length > 0) {
      const dbTaxClasses = await getTaxClassByIds(missingIds);

      if (dbTaxClasses.length !== missingIds.length) {
        const dbFoundIds = new Set(dbTaxClasses.map((t) => t.id));
        const notFoundTaxClasses = missingIds
          .filter((id) => !dbFoundIds.has(id))
          .map((id) => id);

        return {
          statusCode: 404,
          success: false,
          message: `Tax class not found with IDs: ${notFoundTaxClasses.join(
            ", "
          )}`,
          __typename: "BaseResponse",
        };
      }

      foundTaxClasses.push(...dbTaxClasses);
    }

    const deletedTaxClasses: string[] = [];

    for (const taxClassData of foundTaxClasses) {
      const { id, value, deletedAt } = taxClassData;

      // Perform soft or hard deletion based on skipTrash
      if (skipTrash) {
        await hardDeleteTaxClass(id);
        await clearTaxClassCache(id, value);
      } else {
        if (deletedAt) {
          return {
            statusCode: 400,
            success: false,
            message: `Tax class: ${value} already in the trash`,
            __typename: "BaseResponse",
          };
        }
        await softDeleteAndCache(id);
      }

      deletedTaxClasses.push(value);
    }

    return {
      statusCode: 200,
      success: true,
      message: deletedTaxClasses.length
        ? `${
            skipTrash
              ? "Tax class(es) permanently deleted"
              : "Tax class(es) moved to trash"
          } successfully: ${deletedTaxClasses.join(", ")}`
        : "No tax classes deleted",
      __typename: "BaseResponse",
    };
  } catch (error: any) {
    console.error("Error deleting tax class:", error);

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
