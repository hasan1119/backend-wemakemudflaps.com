import { z } from "zod";
import CONFIG from "../../../config/config";
import { Context } from "../../../context";
import {
  getTaxClassesAndCountFromRedis,
  setTaxClassesAndCountInRedis,
} from "../../../helper/redis";
import {
  GetTaxClassesResponseOrError,
  QueryGetAllTaxClassArgs,
} from "../../../types";
import {
  paginationSchema,
  taxClassSortingSchema,
} from "../../../utils/data-validation";
import {
  checkUserAuth,
  checkUserPermission,
  paginateTaxClasses,
} from "../../services";

// Combine pagination and sorting schemas for validation
const combinedSchema = z.intersection(paginationSchema, taxClassSortingSchema);

// Map GraphQL input arguments to schema fields
const mapArgsToPagination = (args: QueryGetAllTaxClassArgs) => ({
  page: args.page,
  limit: args.limit,
  search: args.search,
  sortBy: args.sortBy || "createdAt",
  sortOrder: args.sortOrder || "desc",
});

/**
 * Handles fetching a paginated list of tax classes with optional search and sorting.
 *
 * Workflow:
 * 1. Verifies user authentication and checks read permission for tax classes.
 * 2. Validates input (page, limit, search, sortBy, sortOrder) using Zod schemas.
 * 3. Attempts to retrieve tax classes and total count from Redis for performance.
 * 4. On cache miss, fetches tax classes from the database with pagination, search, and sorting.
 * 5. Maps database tax classes to cached format, including creator details.
 * 6. Caches tax classes and total count in Redis.
 * 7. Returns a success response or error if validation, permission, or retrieval fails.
 *
 * @param _ - Unused parent parameter for GraphQL resolver.
 * @param args - Input arguments containing page, limit, search, sortBy, and sortOrder.
 * @param context - GraphQL context containing authenticated user information.
 * @returns A promise resolving to a GetTaxClassesResponseOrError object containing status, message, tax classes, total count, and errors if applicable.
 */
export const getAllTaxClass = async (
  _: any,
  args: QueryGetAllTaxClassArgs,
  { user }: Context
): Promise<GetTaxClassesResponseOrError> => {
  try {
    // Verify user authentication
    const authResponse = checkUserAuth(user);
    if (authResponse) return authResponse;

    // Check if user has permission to view tax classes
    const canRead = await checkUserPermission({
      action: "canRead",
      entity: "tax settings",
      user,
    });

    if (!canRead) {
      return {
        statusCode: 403,
        success: false,
        message: "You do not have permission to view tax classes info",
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

    // Attempt to retrieve cached tax classes and total count from Redis
    let taxClassesData;
    let total;

    const cachedData = await getTaxClassesAndCountFromRedis(
      page,
      limit,
      search,
      sortBy,
      safeSortOrder
    );

    taxClassesData = cachedData.classes;
    total = cachedData.count;

    if (!taxClassesData) {
      // On cache miss, fetch tax classes from database
      const { taxClasses: dbTaxClasses, total: queryTotal } =
        await paginateTaxClasses({
          page,
          limit,
          search,
          sortBy,
          sortOrder: safeSortOrder,
        });

      total = queryTotal;

      // Map database tax classes to response format
      taxClassesData = dbTaxClasses.map((taxClass) => ({
        id: taxClass.id,
        value: taxClass.value,
        description: taxClass.description,
        totalProducts: taxClass.products?.length || 0,
        createdBy: taxClass.createdBy as any,
        createdAt: taxClass.createdAt?.toISOString() || null,
        deletedAt: taxClass.deletedAt?.toISOString() || null,
      }));

      // Cache tax classes and total count in Redis
      await setTaxClassesAndCountInRedis(
        page,
        limit,
        search,
        sortBy,
        safeSortOrder,
        taxClassesData,
        total
      );
    }

    return {
      statusCode: 200,
      success: true,
      message: "Tax classes fetched successfully",
      taxClasses: taxClassesData,
      total,
      __typename: "TaxClassPaginationResponse",
    };
  } catch (error: any) {
    console.error("Error fetching tax classes:", {
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
