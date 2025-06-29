import { z } from "zod";
import CONFIG from "../../../config/config";
import { Context } from "../../../context";
import {
  getTaxStatusCountFromRedis,
  getTaxStatusesFromRedis,
  setTaxStatusCountInRedis,
  setTaxStatusesInRedis,
} from "../../../helper/redis";
import {
  GetTaxStatusesResponseOrError,
  QueryGetAllTaxStatusArgs,
} from "../../../types";
import {
  paginationSchema,
  taxStatusSortingSchema,
} from "../../../utils/data-validation";
import {
  checkUserAuth,
  checkUserPermission,
  countTaxStatusWithSearch,
  paginateTaxStatus,
} from "../../services";

// Combine pagination and sorting schemas for validation
const combinedSchema = z.intersection(paginationSchema, taxStatusSortingSchema);

// Map GraphQL input arguments to schema fields
const mapArgsToPagination = (args: QueryGetAllTaxStatusArgs) => ({
  page: args.page,
  limit: args.limit,
  search: args.search,
  sortBy: args.sortBy || "createdAt",
  sortOrder: args.sortOrder || "desc",
});

/**
 * Handles fetching a paginated list of tax statuses with optional search and sorting.
 *
 * Workflow:
 * 1. Verifies user authentication and checks read permission for tax statuses.
 * 2. Validates input (page, limit, search, sortBy, sortOrder) using Zod schemas.
 * 3. Attempts to retrieve tax statuses and total count from Redis for performance.
 * 4. On cache miss, fetches tax statuses from the database with pagination, search, and sorting.
 * 5. Maps database tax statuses to cached format, including creator details.
 * 6. Caches tax statuses and total count in Redis.
 * 7. Returns a success response or error if validation, permission, or retrieval fails.
 *
 * @param _ - Unused parent parameter for GraphQL resolver.
 * @param args - Input arguments containing page, limit, search, sortBy, and sortOrder.
 * @param context - GraphQL context containing authenticated user information.
 * @returns A promise resolving to a GetTaxStatusesResponseOrError object containing status, message, tax statuses, total count, and errors if applicable.
 */
export const getAllTaxStatus = async (
  _: any,
  args: QueryGetAllTaxStatusArgs,
  { user }: Context
): Promise<GetTaxStatusesResponseOrError> => {
  try {
    // Verify user authentication
    const authResponse = checkUserAuth(user);
    if (authResponse) return authResponse;

    // Check if user has permission to view tax statuses
    const canRead = await checkUserPermission({
      action: "canRead",
      entity: "tax status",
      user,
    });

    if (!canRead) {
      return {
        statusCode: 403,
        success: false,
        message: "You do not have permission to view tax status(es) info",
        __typename: "BaseResponse",
      };
    }

    // Map and validate input arguments
    const mappedArgs = mapArgsToPagination(args);
    const validationResult = await combinedSchema.safeParseAsync(mappedArgs);

    if (!validationResult.success) {
      const errorMessages = validationResult.error.errors.map((error) => ({
        field: error.path.join("."),
        message: error.message,
      }));

      return {
        statusCode: 400,
        success: false,
        message: "Validation failed",
        errors: errorMessages,
        __typename: "ErrorResponse",
      };
    }

    const { page, limit, search, sortBy, sortOrder } = mappedArgs;

    // Ensure sortOrder is "asc" or "desc"
    const safeSortOrder = sortOrder === "asc" ? "asc" : "desc";

    // Attempt to retrieve cached tax statuses and total count from Redis
    let taxStatusesData = await getTaxStatusesFromRedis(
      page,
      limit,
      search,
      sortBy,
      safeSortOrder
    );

    let total = await getTaxStatusCountFromRedis(search, sortBy, safeSortOrder);

    if (!taxStatusesData) {
      // On cache miss, fetch tax statuses from database
      const { taxStatuses: dbTaxStatuses, total: queryTotal } =
        await paginateTaxStatus({
          page,
          limit,
          search,
          sortBy,
          sortOrder: safeSortOrder,
        });

      total = queryTotal;

      // Map database tax statuses to response format
      taxStatusesData = dbTaxStatuses.map((taxStatus) => ({
        id: taxStatus.id,
        value: taxStatus.value,
        description: taxStatus.description,
        totalProducts: taxStatus.products?.length || 0,
        createdBy: taxStatus.createdBy as any,
        createdAt: taxStatus.createdAt?.toISOString() || null,
        deletedAt: taxStatus.deletedAt?.toISOString() || null,
      }));

      // Cache tax statuses and total count in Redis
      await Promise.all([
        setTaxStatusesInRedis(
          page,
          limit,
          search,
          sortBy,
          safeSortOrder,
          taxStatusesData
        ),
        setTaxStatusCountInRedis(search, sortBy, safeSortOrder, total),
      ]);
    }

    // Calculate total if not found in Redis
    if (!total || total === 0) {
      total = await countTaxStatusWithSearch(search);
      await setTaxStatusCountInRedis(search, sortBy, safeSortOrder, total);
    }

    return {
      statusCode: 200,
      success: true,
      message: "Tax status(es) fetched successfully",
      taxStatuses: taxStatusesData,
      total,
      __typename: "TaxStatusPaginationResponse",
    };
  } catch (error: any) {
    console.error("Error fetching tax status:", {
      message: error.message,
    });

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
