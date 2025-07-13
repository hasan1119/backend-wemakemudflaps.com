import { z } from "zod";
import CONFIG from "../../../config/config";
import { Context } from "../../../context";
import {
  getTaxRatesAndCountFromRedis,
  setTaxRatesAndCountInRedis,
} from "../../../helper/redis";
import {
  GetTaxRatesResponseOrError,
  QueryGetAllTaxRatesArgs,
} from "../../../types";
import {
  paginationSchema,
  taxRateSortingSchema,
} from "../../../utils/data-validation";
import {
  checkUserAuth,
  checkUserPermission,
  paginateTaxRates,
} from "../../services";

// Combine pagination and sorting schemas
const combinedSchema = z.object({
  ...paginationSchema.shape,
  ...taxRateSortingSchema.shape,
  taxClassId: z.string().min(1, "taxClassId is required"),
});

// Maps args to pagination-friendly shape
const mapArgsToPagination = (args: QueryGetAllTaxRatesArgs) => ({
  taxClassId: args.taxClassId,
  page: args.page,
  limit: args.limit,
  search: args.search,
  sortBy: args.sortBy || "createdAt",
  sortOrder: args.sortOrder || "desc",
});

/**
 * Handles fetching a paginated list of tax rates for a given tax class with optional search and sorting.
 *
 * Workflow:
 * 1. Verifies user authentication and checks read permission for tax rates.
 * 2. Validates input (taxClassId, page, limit, search, sortBy, sortOrder) using Zod schemas.
 * 3. Attempts to retrieve tax rates and total count from Redis for performance.
 * 4. On cache miss, fetches tax rates from the database with pagination, search, and sorting.
 * 5. Maps database tax rates to cached format, including tax class and creator details.
 * 6. Caches tax rates and total count in Redis.
 * 7. Returns a success response or error if validation, permission, or retrieval fails.
 *
 * @param _ - Unused parent parameter for GraphQL resolver.
 * @param args - Input arguments containing taxClassId, page, limit, search, sortBy, and sortOrder.
 * @param context - GraphQL context containing authenticated user information.
 * @returns A promise resolving to a GetTaxRatesResponseOrError object containing status, message, tax rates, total count, and errors if applicable.
 */
export const getAllTaxRates = async (
  _: any,
  args: QueryGetAllTaxRatesArgs,
  { user }: Context
): Promise<GetTaxRatesResponseOrError> => {
  try {
    // Verify user authentication
    const authError = checkUserAuth(user);
    if (authError) return authError;

    // Check if user has permission to view tax rates
    const canRead = await checkUserPermission({
      action: "canRead",
      entity: "tax rate",
      user,
    });

    if (!canRead) {
      return {
        statusCode: 403,
        success: false,
        message: "You do not have permission to view tax rates info",
        __typename: "BaseResponse",
      };
    }

    // Validate input args
    const mappedArgs = mapArgsToPagination(args);
    const validation = await combinedSchema.safeParseAsync(mappedArgs);

    if (!validation.success) {
      const errors = validation.error.errors.map((err) => ({
        field: err.path.join("."),
        message: err.message,
      }));

      return {
        statusCode: 400,
        success: false,
        message: "Validation failed",
        errors,
        __typename: "ErrorResponse",
      };
    }

    const { taxClassId, page, limit, search, sortBy, sortOrder } =
      validation.data;

    const safeSortOrder = sortOrder === "asc" ? "asc" : "desc";

    // Try Redis cache
    let taxRatesData;
    let total;

    const cachedData = await getTaxRatesAndCountFromRedis(
      taxClassId,
      page,
      limit,
      search,
      sortBy,
      safeSortOrder
    );

    taxRatesData = cachedData.rates;
    total = cachedData.count;

    // If cache missed, go to DB
    if (!taxRatesData) {
      const { taxRates: dbTaxRates, total: queryTotal } =
        await paginateTaxRates({
          taxClassId,
          page,
          limit,
          search,
          sortBy,
          sortOrder: safeSortOrder,
        });

      total = queryTotal;

      taxRatesData = dbTaxRates.map((rate) => ({
        id: rate.id,
        country: rate.country,
        state: rate.state,
        city: rate.city,
        postcode: rate.postcode,
        rate: rate.rate,
        label: rate.label,
        appliesToShipping: rate.appliesToShipping,
        isCompound: rate.isCompound,
        priority: rate.priority,
        taxClass: rate.taxClass as any,
        createdBy: rate.createdBy as any,
        createdAt: rate.createdAt?.toISOString() || null,
        deletedAt: rate.deletedAt?.toISOString() || null,
      }));

      await setTaxRatesAndCountInRedis(
        taxClassId,
        page,
        limit,
        search,
        sortBy,
        safeSortOrder,
        taxRatesData,
        total
      );
    }

    return {
      statusCode: 200,
      success: true,
      message: "Tax rates fetched successfully",
      total,
      taxRates: taxRatesData,
      __typename: "TaxRatePaginationResponse",
    };
  } catch (error: any) {
    console.error("Error fetching tax rates:", { message: error.message });

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
