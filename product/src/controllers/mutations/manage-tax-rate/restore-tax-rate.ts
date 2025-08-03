import CONFIG from "../../../config/config";
import { Context } from "../../../context";
import {
  clearTaxRatesAndCountCacheByTaxClass,
  getTaxRateInfoByIdFromRedis,
  setTaxRateInfoByIdInRedis,
} from "../../../helper/redis";
import {
  MutationRestoreTaxRatesArgs,
  RestoreTaxRateResponseOrError,
} from "../../../types";
import { idsSchema } from "../../../utils/data-validation";
import {
  checkUserAuth,
  checkUserPermission,
  restoreTaxRate,
} from "../../services";
import { getTaxRateByIds } from "../../services/tax-rate/get-tax-rate.service";

/**
 * Handles the restoration of soft-deleted tax rates.
 *
 * Workflow:
 * 1. Verifies user authentication and permission.
 * 2. Validates input tax rate IDs using Zod.
 * 3. Attempts to retrieve tax rate data from Redis.
 * 4. Loads any missing ones from the database.
 * 5. Ensures all are soft-deleted before proceeding.
 * 6. Restores the tax rates in the DB.
 * 7. Updates Redis and clears related caches.
 * 8. Returns success or appropriate error response.
 *
 * @param args - The arguments for restoring tax rates, including their IDs.
 * @returns A promise resolving to a `RestoreTaxRateResponseOrError` object.
 * @throws GraphQLError if tax rates are not found or if there's an issue with restoration.
 */
export const restoreTaxRates = async (
  _: any,
  args: MutationRestoreTaxRatesArgs,
  { user }: Context
): Promise<RestoreTaxRateResponseOrError> => {
  try {
    // Verify authentication
    const authError = checkUserAuth(user);
    if (authError) return authError;

    // Permission check
    const canUpdate = await checkUserPermission({
      action: "canUpdate",
      entity: "tax_settings",
      user,
    });

    if (!canUpdate) {
      return {
        statusCode: 403,
        success: false,
        message: "You do not have permission to restore tax rate(s)",
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

    // Try Redis first
    const cachedRates = await Promise.all(
      ids.map((id) => getTaxRateInfoByIdFromRedis(id))
    );

    const foundRates: any[] = [];
    const missingIds: string[] = [];

    cachedRates.forEach((rate, index) => {
      if (rate) foundRates.push(rate);
      else missingIds.push(ids[index]);
    });

    // Load missing from DB
    if (missingIds.length > 0) {
      const dbRates = await getTaxRateByIds(missingIds);

      if (dbRates.length !== missingIds.length) {
        const dbFoundIds = new Set(dbRates.map((r) => r.id));
        const notFound = missingIds.filter((id) => !dbFoundIds.has(id));
        return {
          statusCode: 404,
          success: false,
          message: `Tax rate(s) not found with ID(s): ${notFound.join(", ")}`,
          __typename: "BaseResponse",
        };
      }

      foundRates.push(...dbRates);
    }

    // Ensure all are soft-deleted
    const notDeleted = foundRates.filter((rate) => !rate.deletedAt);
    if (notDeleted.length > 0) {
      return {
        statusCode: 400,
        success: false,
        message: `Tax rate(s) with ID(s): ${notDeleted
          .map((r) => r.id)
          .join(", ")} are not in the trash`,
        __typename: "BaseResponse",
      };
    }

    //  Restore from DB
    const restored = await restoreTaxRate(ids);

    //  Update Redis
    await Promise.all([
      ...restored.map(async (rate) =>
        setTaxRateInfoByIdInRedis(rate.id, {
          id: rate.id,
          label: rate.label,
          country: rate.country,
          state: rate.state,
          city: rate.city,
          postcode: rate.postcode,
          rate: rate.rate,
          appliesToShipping: rate.appliesToShipping,
          isCompound: rate.isCompound,
          taxClassId: (await rate.taxClass).id,
          priority: rate.priority,
          createdBy: rate.createdBy as any,
          createdAt:
            rate.createdAt instanceof Date
              ? rate.createdAt.toISOString()
              : rate.createdAt,
          deletedAt:
            rate.deletedAt instanceof Date
              ? rate.deletedAt.toISOString()
              : rate.deletedAt,
        })
      ),
      ...restored.map(async (r) => {
        const taxClass = await r.taxClass;
        await Promise.all([clearTaxRatesAndCountCacheByTaxClass(taxClass?.id)]);
      }),
    ]);

    return {
      statusCode: 200,
      success: true,
      message: `Successfully restored ${restored.length} tax rate(s)`,
      __typename: "BaseResponse",
    };
  } catch (error: any) {
    console.error("Error restoring tax rates:", error);
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
