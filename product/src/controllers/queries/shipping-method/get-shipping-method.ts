import { z } from "zod";
import CONFIG from "../../../config/config";
import { Context } from "../../../context";
import {
  GetShippingMethodsResponseOrError,
  QueryGetAllShippingMethodsArgs,
} from "../../../types";
import {
  paginationSchema,
  sortShippingZoneSchema,
} from "../../../utils/data-validation";
import {
  checkUserAuth,
  checkUserPermission,
  paginateShippingMethods,
} from "../../services";

// Combine pagination and sorting schemas for validation
const combinedSchema = z.intersection(paginationSchema, sortShippingZoneSchema);

// Map GraphQL input arguments to schema fields
const mapArgsToPagination = (args: QueryGetAllShippingMethodsArgs) => ({
  page: args.page,
  limit: args.limit,
  search: args.search,
  sortBy: args.sortBy || "createdAt",
  sortOrder: args.sortOrder || "desc",
});

/**
 * Retrieves all shipping methods with pagination, sorting, and search functionality.
 *
 * 1. Validates user authentication.
 * 2. Checks user permissions for viewing shipping methods.
 * 3. Maps GraphQL input arguments to the expected schema.
 * 4. Validates the input against the combined schema.
 * 5. Queries the database for paginated shipping methods with relations and search functionality.
 * 6. Returns a structured response with shipping methods and total count.
 *
 * @param _ - Unused parent parameter (for GraphQL resolver compatibility).
 * @param args - GraphQL arguments containing pagination, sorting, and search parameters.
 * @param user - User context for authentication and authorization checks.
 * @returns A promise resolving to a response object containing shipping methods or an error message.
 */
export const getAllShippingMethods = async (
  _: any,
  args: QueryGetAllShippingMethodsArgs,
  { user }: Context
): Promise<GetShippingMethodsResponseOrError> => {
  try {
    // Verify user authentication
    const authResponse = checkUserAuth(user);
    if (authResponse) return authResponse;

    // Check if user has permission to view shipping methods
    const canRead = await checkUserPermission({
      action: "canRead",
      entity: "shipping settings",
      user,
    });

    if (!canRead) {
      return {
        statusCode: 403,
        success: false,
        message: "You do not have permission to view shipping methods info",
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

    // Attempt to retrieve cached shipping methods and total count from Redis
    let shippingMethodsData;
    let total;

    // On cache miss, fetch shipping methods from database
    const { shippingMethods: dbShippingMethods, total: queryTotal } =
      await paginateShippingMethods({
        page,
        limit,
        search,
        sortBy,
        sortOrder: safeSortOrder,
      });

    total = queryTotal;

    console.log(shippingMethodsData);

    // Map database shipping methods to response format
    shippingMethodsData = dbShippingMethods.map((shippingMethod) => ({
      ...shippingMethod,
      flatRate: {
        ...shippingMethod.flatRate,
        createdBy: shippingMethod.flatRate.createdBy as any,
        createdAt:
          shippingMethod.flatRate.createdAt instanceof Date
            ? shippingMethod.flatRate.createdAt.toISOString()
            : shippingMethod.flatRate.createdAt,
        deletedAt:
          shippingMethod.flatRate.deletedAt instanceof Date
            ? shippingMethod.flatRate.deletedAt.toISOString()
            : shippingMethod.flatRate.deletedAt,
        costs: shippingMethod.flatRate.costs.map((cost) => ({
          id: cost.id,
          cost: cost.cost,
          shippingClass: {
            id: cost.shippingClass.id,
            value: cost.shippingClass.value,
            description: cost.shippingClass.description,
            createdBy: cost.shippingClass.createdBy as any,
            createdAt:
              cost.shippingClass.createdAt instanceof Date
                ? cost.shippingClass.createdAt.toISOString()
                : cost.shippingClass.createdAt,
            deletedAt:
              cost.shippingClass.deletedAt instanceof Date
                ? cost.shippingClass.deletedAt.toISOString()
                : cost.shippingClass.deletedAt,
          },
        })),
      },
      shippingZone: {
        id: shippingMethod.shippingZone.id,
        name: shippingMethod.shippingZone.name,
        regions: shippingMethod.shippingZone.regions,
        zipCodes: shippingMethod.shippingZone.zipCodes,
        createdBy: shippingMethod.shippingZone.createdBy as any,
        createdAt:
          shippingMethod.shippingZone.createdAt instanceof Date
            ? shippingMethod.shippingZone.createdAt.toISOString()
            : shippingMethod.shippingZone.createdAt,
        deletedAt:
          shippingMethod.shippingZone.deletedAt instanceof Date
            ? shippingMethod.shippingZone.deletedAt.toISOString()
            : shippingMethod.shippingZone.deletedAt,
      },
      freeShipping: {
        ...shippingMethod.freeShipping,
        createdBy: shippingMethod.freeShipping.createdBy as any,
        createdAt:
          shippingMethod.freeShipping.createdAt instanceof Date
            ? shippingMethod.freeShipping.createdAt.toISOString()
            : shippingMethod.freeShipping.createdAt,
        deletedAt:
          shippingMethod.freeShipping.deletedAt instanceof Date
            ? shippingMethod.freeShipping.deletedAt.toISOString()
            : shippingMethod.freeShipping.deletedAt,
      },
      localPickUp: {
        ...shippingMethod.localPickUp,
        createdBy: shippingMethod.localPickUp.createdBy as any,
        createdAt:
          shippingMethod.localPickUp.createdAt instanceof Date
            ? shippingMethod.localPickUp.createdAt.toISOString()
            : shippingMethod.localPickUp.createdAt,
        deletedAt:
          shippingMethod.localPickUp.deletedAt instanceof Date
            ? shippingMethod.localPickUp.deletedAt.toISOString()
            : shippingMethod.localPickUp.deletedAt,
      },
      ups: {
        ...shippingMethod.ups,
        createdBy: shippingMethod.ups.createdBy as any,
        createdAt:
          shippingMethod.ups.createdAt instanceof Date
            ? shippingMethod.ups.createdAt.toISOString()
            : shippingMethod.ups.createdAt,
        deletedAt:
          shippingMethod.ups.deletedAt instanceof Date
            ? shippingMethod.ups.deletedAt.toISOString()
            : shippingMethod.ups.deletedAt,
      },
      createdBy: shippingMethod.createdBy as any,
      createdAt: shippingMethod.createdAt?.toISOString() || null,
      deletedAt: shippingMethod.deletedAt?.toISOString() || null,
    }));

    return {
      statusCode: 200,
      success: true,
      message: "Shipping methods fetched successfully",
      shippingMethods: shippingMethodsData,
      total,
      __typename: "ShippingMethodPaginationResponse",
    };
  } catch (error: any) {
    console.error("Error fetching shipping methods:", {
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
