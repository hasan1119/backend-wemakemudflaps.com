import CONFIG from "../../../config/config";
import { Context } from "../../../context";
import {
  clearTaxRatesAndCountCacheByTaxClass,
  getTaxRateInfoByIdFromRedis,
  removeTaxRateInfoByIdFromRedis,
  setTaxRateInfoByIdInRedis,
} from "../../../helper/redis";
import {
  DeleteTaxRateResponseOrError,
  MutationDeleteTaxRateArgs,
} from "../../../types";
import { idsSchema, skipTrashSchema } from "../../../utils/data-validation";
import {
  checkUserAuth,
  checkUserPermission,
  getTaxRateById,
  hardDeleteTaxRate,
  softDeleteTaxRate,
} from "../../services";

// Clear tax rate cache scoped by taxClassId
const clearTaxRateCache = async (taxClassId: string, id: string) => {
  await Promise.all([
    removeTaxRateInfoByIdFromRedis(id),
    clearTaxRatesAndCountCacheByTaxClass(taxClassId),
  ]);
};

// Soft delete and cache updated tax rate
const softDeleteAndCache = async (taxClassId: string, id: string) => {
  const deletedData = await softDeleteTaxRate(id);

  await setTaxRateInfoByIdInRedis(id, {
    id: deletedData.id,
    label: deletedData.label,
    country: deletedData.country,
    state: deletedData.state,
    city: deletedData.city,
    postcode: deletedData.postcode,
    rate: deletedData.rate,
    appliesToShipping: deletedData.appliesToShipping,
    taxClassId: (await deletedData.taxClass).id,
    isCompound: deletedData.isCompound,
    priority: deletedData.priority,
    createdBy: deletedData.createdBy as any,
    createdAt:
      deletedData.createdAt instanceof Date
        ? deletedData.createdAt.toISOString()
        : deletedData.createdAt,
    deletedAt:
      deletedData.deletedAt instanceof Date
        ? deletedData.deletedAt.toISOString()
        : deletedData.deletedAt,
  });
  await clearTaxRatesAndCountCacheByTaxClass(taxClassId);
};

/**
 * Handles deletion of tax rates with validation, permission, and Redis cache management.
 *
 * @param _ - Unused parent argument.
 * @param args - Mutation arguments: ids and skipTrash.
 * @param context - GraphQL context with authenticated user.
 * @returns Promise resolving to DeleteTaxRateResponseOrError.
 */
export const deleteTaxRate = async (
  _: any,
  args: MutationDeleteTaxRateArgs,
  { user }: Context
): Promise<DeleteTaxRateResponseOrError> => {
  try {
    // Verify authentication
    const authError = checkUserAuth(user);
    if (authError) return authError;

    // Permission check
    const canDelete = await checkUserPermission({
      action: "canDelete",
      entity: "tax settings",
      user,
    });

    if (!canDelete) {
      return {
        statusCode: 403,
        success: false,
        message: "You do not have permission to delete tax rate(s)",
        __typename: "BaseResponse",
      };
    }

    const { ids, skipTrash } = args;

    // Validate input
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

    // Fetch tax rates from Redis first, then DB if not found
    const taxRatesToDelete = [];
    const notFoundIds: string[] = [];

    for (const id of ids) {
      // Try Redis first
      let taxRate = await getTaxRateInfoByIdFromRedis(id);

      // If not found in Redis, try DB
      if (!taxRate) {
        const dbTaxRate = await getTaxRateById(id);
        if (dbTaxRate) {
          taxRate = {
            ...dbTaxRate,
            taxClassId: (await dbTaxRate.taxClass).id,
            createdAt:
              dbTaxRate.createdAt instanceof Date
                ? dbTaxRate.createdAt.toISOString()
                : dbTaxRate.createdAt,
            deletedAt:
              dbTaxRate.deletedAt instanceof Date
                ? dbTaxRate.deletedAt.toISOString()
                : dbTaxRate.deletedAt === null
                ? null
                : String(dbTaxRate.deletedAt),
            createdBy: dbTaxRate.createdBy as any,
          };
        }
      }

      if (taxRate) {
        taxRatesToDelete.push(taxRate);
      } else {
        notFoundIds.push(id);
      }
    }

    if (notFoundIds.length > 0) {
      return {
        statusCode: 404,
        success: false,
        message: `Tax Rate(s) not found with ID(s): ${notFoundIds.join(", ")}`,
        __typename: "BaseResponse",
      };
    }

    // Process deletions in parallel
    await Promise.all(
      taxRatesToDelete.map(async (taxRate) => {
        const taxClassId = (await taxRate.taxClass).id;

        if (skipTrash) {
          // Hard delete
          await hardDeleteTaxRate(taxRate.id);
          await clearTaxRateCache(taxClassId, taxRate.id);
        } else {
          if (taxRate.deletedAt) {
            return {
              statusCode: 400,
              success: false,
              message: `Tax rate: ${taxRate.label} already in the trash`,
              __typename: "BaseResponse",
            };
          }
          await softDeleteAndCache(taxClassId, taxRate.id);
        }
      })
    );

    return {
      statusCode: 200,
      success: true,
      message: `${
        skipTrash
          ? "Tax rate(s) permanently deleted"
          : "Tax rate(s) moved to trash"
      } successfully: ${ids.join(", ")}`,
      __typename: "BaseResponse",
    };
  } catch (error: any) {
    console.error("Error deleting tax rate:", error);

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
