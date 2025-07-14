import CONFIG from "../../../config/config";
import { Context } from "../../../context";
import {
  getTaxRateInfoByIdFromRedis,
  setTaxRateInfoByIdInRedis,
} from "../../../helper/redis";
import {
  GetTaxRateByIdResponseOrError,
  QueryGetTaxRateByIdArgs,
} from "../../../types";
import { idSchema } from "../../../utils/data-validation";
import {
  checkUserAuth,
  checkUserPermission,
  getTaxRateById as getTaxRateByIdService,
} from "../../services";

/**
 * Handles retrieving a tax rate by its ID with validation, permission checks, Redis cache support.
 *
 * @param _ - Unused parent argument.
 * @param args - Query argument with the tax rate ID.
 * @param context - GraphQL context including user authentication.
 * @returns A `GetTaxRateByIDResponseOrError` object containing tax rate details or error info.
 */
export const getTaxRateById = async (
  _: any,
  args: QueryGetTaxRateByIdArgs,
  { user }: Context
): Promise<GetTaxRateByIdResponseOrError> => {
  try {
    // 1. Auth check
    const authError = checkUserAuth(user);
    if (authError) return authError;

    // 2. Permission check
    const canRead = await checkUserPermission({
      action: "canRead",
      entity: "tax settings",
      user,
    });

    if (!canRead) {
      return {
        statusCode: 403,
        success: false,
        message: "You do not have permission to view tax rate info",
        __typename: "BaseResponse",
      };
    }

    // 3. Validate ID
    const validation = await idSchema.safeParseAsync(args);
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

    const { id } = args;

    // 4. Try Redis first
    let taxRateData = await getTaxRateInfoByIdFromRedis(id);

    if (taxRateData?.deletedAt) {
      return {
        statusCode: 404,
        success: false,
        message: `Tax Rate not found with this id: ${id}, or it may have been deleted or moved to the trash`,
        __typename: "BaseResponse",
      };
    }

    // 5. If not in cache, fetch from DB and cache it
    if (!taxRateData) {
      const dbTaxRate = await getTaxRateByIdService(id);

      if (!dbTaxRate || dbTaxRate.deletedAt) {
        return {
          statusCode: 404,
          success: false,
          message: `Tax Rate not found with this id: ${id}, or it may have been deleted or moved to the trash`,
          __typename: "BaseResponse",
        };
      }

      taxRateData = {
        id: dbTaxRate.id,
        label: dbTaxRate.label,
        country: dbTaxRate.country,
        state: dbTaxRate.state,
        city: dbTaxRate.city,
        postcode: dbTaxRate.postcode,
        rate: dbTaxRate.rate,
        appliesToShipping: dbTaxRate.appliesToShipping,
        isCompound: dbTaxRate.isCompound,
        priority: dbTaxRate.priority,
        createdBy: dbTaxRate.createdBy as any,
        createdAt:
          dbTaxRate.createdAt instanceof Date
            ? dbTaxRate.createdAt.toISOString()
            : dbTaxRate.createdAt,
        deletedAt:
          dbTaxRate.deletedAt instanceof Date
            ? dbTaxRate.deletedAt.toISOString()
            : dbTaxRate.deletedAt,
        taxClassId: (await dbTaxRate.taxClass).id,
      };

      await setTaxRateInfoByIdInRedis(id, taxRateData);
    }

    return {
      statusCode: 200,
      success: true,
      message: "Tax Rate fetched successfully",
      taxRate: taxRateData,
      __typename: "TaxRateResponse",
    };
  } catch (error: any) {
    console.error("Error retrieving tax rate:", { message: error.message });

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
