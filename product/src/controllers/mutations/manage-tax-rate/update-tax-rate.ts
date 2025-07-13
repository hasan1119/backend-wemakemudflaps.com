import CONFIG from "../../../config/config";
import { Context } from "../../../context";
import {
  clearTaxRatesAndCountCacheByTaxClass,
  getTaxClassInfoByIdFromRedis,
  getTaxRateInfoByIdFromRedis,
  removeTaxRateInfoByIdFromRedis,
  setTaxRateInfoByIdInRedis,
  setTaxRateLabelExistInRedis,
} from "../../../helper/redis";
import {
  MutationUpdateTaxRateArgs,
  UpdateTaxRateResponseOrError,
} from "../../../types";
import { updateTaxRateSchema } from "../../../utils/data-validation";
import {
  checkUserAuth,
  checkUserPermission,
  getTaxClassById,
  getTaxRateById,
  updateTaxRate as updateTaxRateService,
} from "../../services";

/**
 * Handles the update of an existing tax rate in the system.
 *
 * Workflow:
 * 1. Verifies user authentication and permission to update tax rates.
 * 2. Validates input fields using Zod schema.
 * 3. Ensures tax rate exists by ID.
 * 4. Checks Redis or DB for label conflict if label is changing, scoped by taxClassId.
 * 5. Updates the tax rate in the database.
 * 6. Caches the updated tax rate and label existence in Redis scoped by taxClassId.
 * 7. Clears related Redis cache scoped by taxClassId to ensure data consistency.
 * 8. Returns success response or error if validation, permission, or update fails.
 *
 * @param _ - Unused parent parameter for GraphQL resolver.
 * @param args - Input arguments containing tax rate update data.
 * @param context - GraphQL context containing authenticated user information.
 * @returns A promise resolving to an `UpdateTaxRateResponseOrError` object.
 */
export const updateTaxRate = async (
  _: any,
  args: MutationUpdateTaxRateArgs,
  { user }: Context
): Promise<UpdateTaxRateResponseOrError> => {
  try {
    // Verify user authentication
    const authError = checkUserAuth(user);
    if (authError) return authError;

    // Check if user has permission to update tax rate
    const hasPermission = await checkUserPermission({
      user,
      action: "canUpdate",
      entity: "tax rate",
    });

    if (!hasPermission) {
      return {
        statusCode: 403,
        success: false,
        message: "You do not have permission to update tax rate(s)",
        __typename: "BaseResponse",
      };
    }

    // Validate input data using Zod schema
    const result = await updateTaxRateSchema.safeParseAsync(args);

    if (!result.success) {
      const errors = result.error.errors.map((e) => ({
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

    const { id, label, taxClassId } = result.data;

    // Attempt to retrieve cached tax class data from Redis
    let taxClassData = await getTaxClassInfoByIdFromRedis(taxClassId);

    if (taxClassData?.deletedAt) {
      return {
        statusCode: 404,
        success: false,
        message: `Tax class not found with this id: ${taxClassId}, or it may have been deleted or moved to the trash`,
        __typename: "BaseResponse",
      };
    }

    if (!taxClassData) {
      // On cache miss, fetch tax class data from database
      const dbTaxClass = await getTaxClassById(taxClassId);

      if (!dbTaxClass) {
        return {
          statusCode: 404,
          success: false,
          message: `Tax class not found with this id: ${taxClassId}, or it may have been deleted or moved to the trash`,
          __typename: "BaseResponse",
        };
      }
    }

    // Step 3: Attempt to get current tax rate from Redis or DB
    let currentTaxRate;

    currentTaxRate = await getTaxRateInfoByIdFromRedis(id);

    if (!currentTaxRate) {
      currentTaxRate = await getTaxRateById(id);
      if (!currentTaxRate) {
        return {
          statusCode: 404,
          success: false,
          message: "Tax rate not found",
          __typename: "BaseResponse",
        };
      }
    }

    // Update tax rate in DB
    const updatedTaxRate = await updateTaxRateService(id, result.data);

    // Prepare response object
    const taxRateResponse = {
      id: updatedTaxRate.id,
      label: updatedTaxRate.label,
      country: updatedTaxRate.country,
      state: updatedTaxRate.state,
      city: updatedTaxRate.city,
      postcode: updatedTaxRate.postcode,
      rate: updatedTaxRate.rate,
      appliesToShipping: updatedTaxRate.appliesToShipping,
      isCompound: updatedTaxRate.isCompound,
      priority: updatedTaxRate.priority,
      createdBy: updatedTaxRate.createdBy as any,
      createdAt:
        updatedTaxRate.createdAt instanceof Date
          ? updatedTaxRate.createdAt.toISOString()
          : updatedTaxRate.createdAt,
      deletedAt:
        updatedTaxRate.deletedAt instanceof Date
          ? updatedTaxRate.deletedAt.toISOString()
          : updatedTaxRate.deletedAt,
    };

    // Update Redis cache scoped by taxClassId
    await Promise.all([
      removeTaxRateInfoByIdFromRedis(id),
      setTaxRateInfoByIdInRedis(updatedTaxRate.id, taxRateResponse),
      label && setTaxRateLabelExistInRedis(taxClassId, updatedTaxRate.label),
      clearTaxRatesAndCountCacheByTaxClass(taxClassId),
    ]);

    // Return updated tax rate
    return {
      statusCode: 200,
      success: true,
      message: "Tax rate updated successfully",
      taxRate: taxRateResponse,
      __typename: "TaxRateResponse",
    };
  } catch (error: any) {
    console.error("Error updating tax rate:", error);
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
