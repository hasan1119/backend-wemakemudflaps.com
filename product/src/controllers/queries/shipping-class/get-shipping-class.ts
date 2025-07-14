import { z } from "zod";
import CONFIG from "../../../config/config";
import { Context } from "../../../context";
import {
  getShippingClassesAndCountFromRedis,
  setShippingClassesAndCountInRedis,
} from "../../../helper/redis";
import {
  GetShippingClassesResponseOrError,
  QueryGetAllShippingClassArgs,
} from "../../../types";
import {
  paginationSchema,
  shippingClassSortingSchema,
} from "../../../utils/data-validation";
import {
  checkUserAuth,
  checkUserPermission,
  paginateShippingClasses,
} from "../../services";

// Combine pagination and sorting schemas for validation
const combinedSchema = z.intersection(
  paginationSchema,
  shippingClassSortingSchema
);

// Map GraphQL input arguments to schema fields
const mapArgsToPagination = (args: QueryGetAllShippingClassArgs) => ({
  page: args.page,
  limit: args.limit,
  search: args.search,
  sortBy: args.sortBy || "createdAt",
  sortOrder: args.sortOrder || "desc",
});

/**
 * Handles fetching a paginated list of shipping classes with optional search and sorting.
 *
 * Workflow:
 * 1. Verifies user authentication and checks read permission for shipping classes.
 * 2. Validates input (page, limit, search, sortBy, sortOrder) using Zod schemas.
 * 3. Attempts to retrieve shipping classes and total count from Redis for performance.
 * 4. On cache miss, fetches shipping classes from the database with pagination, search, and sorting.
 * 5. Maps database shipping classes to cached format, including creator details.
 * 6. Caches shipping classes and total count in Redis.
 * 7. Returns a success response or error if validation, permission, or retrieval fails.
 *
 * @param _ - Unused parent parameter for GraphQL resolver.
 * @param args - Input arguments containing page, limit, search, sortBy, and sortOrder.
 * @param context - GraphQL context containing authenticated user information.
 * @returns A promise resolving to a GetShippingClassesResponseOrError object containing status, message, shipping classes, total count, and errors if applicable.
 */
export const getAllShippingClass = async (
  _: any,
  args: QueryGetAllShippingClassArgs,
  { user }: Context
): Promise<GetShippingClassesResponseOrError> => {
  try {
    // Verify user authentication
    const authResponse = checkUserAuth(user);
    if (authResponse) return authResponse;

    // Check if user has permission to view shipping classes
    const canRead = await checkUserPermission({
      action: "canRead",
      entity: "shipping settings",
      user,
    });

    if (!canRead) {
      return {
        statusCode: 403,
        success: false,
        message: "You do not have permission to view shipping classes info",
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

    // Attempt to retrieve cached shipping classes and total count from Redis
    let shippingClassesData;
    let total;

    const cachedData = await getShippingClassesAndCountFromRedis(
      page,
      limit,
      search,
      sortBy,
      safeSortOrder
    );

    shippingClassesData = cachedData.classes;
    total = cachedData.count;

    if (!shippingClassesData) {
      // On cache miss, fetch shipping classes from database
      const { shippingClasses: dbShippingClasses, total: queryTotal } =
        await paginateShippingClasses({
          page,
          limit,
          search,
          sortBy,
          sortOrder: safeSortOrder,
        });

      total = queryTotal;

      // Map database shipping classes to response format
      shippingClassesData = dbShippingClasses.map((shippingClass) => ({
        id: shippingClass.id,
        value: shippingClass.value,
        description: shippingClass.description,
        totalProducts: shippingClass.products?.length || 0,
        createdBy: shippingClass.createdBy as any,
        createdAt: shippingClass.createdAt?.toISOString() || null,
        deletedAt: shippingClass.deletedAt?.toISOString() || null,
      }));

      // Cache shipping classes and total count in Redis
      await setShippingClassesAndCountInRedis(
        page,
        limit,
        search,
        sortBy,
        safeSortOrder,
        shippingClassesData,
        total
      );
    }

    return {
      statusCode: 200,
      success: true,
      message: "Shipping classes fetched successfully",
      shippingClasses: shippingClassesData,
      total,
      __typename: "ShippingClassPaginationResponse",
    };
  } catch (error: any) {
    console.error("Error fetching shipping classes:", {
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
