import { z } from "zod";
import CONFIG from "../../../config/config";
import { Context } from "../../../context";
import {
  getTaxRateCountFromRedis,
  getTaxRatesFromRedis,
  setTaxRateCountInRedis,
  setTaxRatesInRedis,
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
  countTaxRatesWithSearch,
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
 * Retrieves paginated list of tax rates for a given tax class, using cache first.
 */
export const getAllTaxRates = async (
  _: any,
  args: QueryGetAllTaxRatesArgs,
  { user }: Context
): Promise<GetTaxRatesResponseOrError> => {
  try {
    //  Auth check
    const authError = checkUserAuth(user);
    if (authError) return authError;

    //  Permission check
    const canRead = await checkUserPermission({
      action: "canRead",
      entity: "tax rate",
      user,
    });

    if (!canRead) {
      return {
        statusCode: 403,
        success: false,
        message: "You do not have permission to view tax rate(s) info",
        __typename: "BaseResponse",
      };
    }

    //  Validate input args
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

    //  Try Redis cache
    let taxRatesData = await getTaxRatesFromRedis(
      taxClassId,
      page,
      limit,
      search,
      sortBy,
      safeSortOrder
    );

    let total = await getTaxRateCountFromRedis(
      taxClassId,
      search,
      sortBy,
      safeSortOrder
    );

    //  If cache missed, go to DB
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

      await Promise.all([
        setTaxRatesInRedis(
          taxClassId,
          page,
          limit,
          search,
          sortBy,
          safeSortOrder,
          taxRatesData
        ),
        setTaxRateCountInRedis(
          taxClassId,
          search,
          sortBy,
          safeSortOrder,
          total
        ),
      ]);
    }

    // If count wasn't cached, get it
    if (!total || total === 0) {
      total = await countTaxRatesWithSearch(taxClassId, search);
      await setTaxRateCountInRedis(
        taxClassId,
        search,
        sortBy,
        safeSortOrder,
        total
      );
    }

    return {
      statusCode: 200,
      success: true,
      message: "Tax rate(s) fetched successfully",
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
