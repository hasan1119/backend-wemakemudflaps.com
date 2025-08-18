import CONFIG from "../../../config/config";
import { Context } from "../../../context";
import {
  clearTaxRatesAndCountCacheByTaxClass,
  getTaxClassInfoByIdFromRedis,
  setTaxRateInfoByIdInRedis,
} from "../../../helper/redis";
import {
  CreateTaxRateResponseOrError,
  MutationCreateTaxRateArgs,
} from "../../../types";
import { createTaxRateSchema } from "../../../utils/data-validation";
import {
  checkUserAuth,
  checkUserPermission,
  createTaxRate as createTaxRateService,
  findTaxRateByTaxClassAndPriority,
  getTaxClassById,
} from "../../services";

/**
 * Handles the creation of a new tax rate in the system.
 *
 * Workflow:
 * 1. Verifies user authentication and permission to create tax rates.
 * 2. Validates input (label, location, rate, etc.) using Zod schema.
 * 3. Checks Redis for existing tax rate label under the given taxClassId to prevent duplicates.
 * 4. Queries the database for tax rate existence if not found in Redis.
 * 5. Creates the tax rate in the database with audit information from the authenticated user.
 * 6. Caches the new tax rate and its label existence in Redis scoped by taxClassId.
 * 7. Clears related tax rate search caches scoped by taxClassId.
 * 8. Returns a success response or error if validation, permission, or creation fails.
 *
 * @param _ - Unused parent parameter for GraphQL resolver.
 * @param args - Input arguments containing tax rate fields.
 * @param context - GraphQL context containing authenticated user information.
 * @returns A promise resolving to a BaseResponseOrError object containing status, message, and errors if applicable.
 */
export const createTaxRate = async (
  _: any,
  args: MutationCreateTaxRateArgs,
  { user }: Context
): Promise<CreateTaxRateResponseOrError> => {
  try {
    // Verify user authentication
    const authError = checkUserAuth(user);
    if (authError) return authError;

    // Check if user has permission to create a tax rate
    const hasPermission = await checkUserPermission({
      user,
      action: "canCreate",
      entity: "tax_settings",
    });

    if (!hasPermission) {
      return {
        statusCode: 403,
        success: false,
        message: "You do not have permission to create tax rate(s)",
        __typename: "BaseResponse",
      };
    }

    // Validate input data with Zod schema
    const result = await createTaxRateSchema.safeParseAsync(args);

    // Return detailed validation errors if input is invalid
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

    const {
      label,
      country,
      state,
      city,
      postcode,
      rate,
      appliesToShipping,
      isCompound,
      priority,
      taxClassId,
    } = result.data;

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

    const existing = await findTaxRateByTaxClassAndPriority(
      taxClassId,
      priority
    );

    if (existing) {
      return {
        statusCode: 409,
        success: false,
        message: `Priority ${priority} already exists in this tax class. Please choose a different priority.`,
        __typename: "BaseResponse",
      };
    }

    // Create the tax rate in the database
    const taxRate = await createTaxRateService(
      {
        label,
        country,
        state,
        city,
        postcode,
        rate,
        appliesToShipping,
        isCompound,
        priority,
        taxClassId,
      },
      user.id
    );

    // Prepare response object for caching and returning
    const taxRateResponse = {
      id: taxRate.id,
      label: taxRate.label,
      country: taxRate.country,
      state: taxRate.state,
      city: taxRate.city,
      postcode: taxRate.postcode,
      rate: taxRate.rate,
      appliesToShipping: taxRate.appliesToShipping,
      isCompound: taxRate.isCompound,
      priority: taxRate.priority,
      taxClassId: (await taxRate.taxClass).id,
      createdBy: taxRate.createdBy as any,
      createdAt:
        taxRate.createdAt instanceof Date
          ? taxRate.createdAt.toISOString()
          : taxRate.createdAt,
      deletedAt:
        taxRate.deletedAt instanceof Date
          ? taxRate.deletedAt.toISOString()
          : taxRate.deletedAt,
    };

    // Cache tax rate information and label existence in Redis scoped by taxClassId,
    // and clear related tax rate search caches by taxClassId
    await Promise.all([
      setTaxRateInfoByIdInRedis(taxRate.id, taxRateResponse),

      clearTaxRatesAndCountCacheByTaxClass(taxClassId),
    ]);

    // Return success response
    return {
      statusCode: 201,
      success: true,
      message: "Tax rate created successfully",
      taxRate: taxRateResponse,
      __typename: "TaxRateResponse",
    };
  } catch (error: any) {
    console.error("Error creating tax rate:", error);
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
