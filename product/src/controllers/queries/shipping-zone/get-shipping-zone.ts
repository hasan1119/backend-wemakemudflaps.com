import { z } from "zod";
import CONFIG from "../../../config/config";
import { Context } from "../../../context";
import {
  GetShippingZonesResponseOrError,
  QueryGetAllShippingZonesArgs,
} from "../../../types";
import {
  paginationSchema,
  sortShippingZoneSchema,
} from "../../../utils/data-validation";
import {
  checkUserAuth,
  checkUserPermission,
  paginateShippingZones,
} from "../../services";

// Combine pagination and sorting schemas for validation
const combinedSchema = z.intersection(paginationSchema, sortShippingZoneSchema);

// Map GraphQL input arguments to schema fields
const mapArgsToPagination = (args: QueryGetAllShippingZonesArgs) => ({
  page: args.page,
  limit: args.limit,
  search: args.search,
  sortBy: args.sortBy || "createdAt",
  sortOrder: args.sortOrder || "desc",
});

/**
 * Retrieves all shipping zones with pagination, sorting, and search functionality.
 *
 * 1. Validates user authentication.
 * 2. Checks user permissions for viewing shipping zones.
 * 3. Maps GraphQL input arguments to the expected schema.
 * 4. Validates the input against the combined schema.
 * 5. Queries the database for paginated shipping zones with relations and search functionality.
 * 6. Returns a structured response with shipping zones and total count.
 *
 * @param _ - Unused parent parameter (for GraphQL resolver compatibility).
 * @param args - GraphQL arguments containing pagination, sorting, and search parameters.
 * @param user - User context for authentication and authorization checks.
 * @returns A promise resolving to a response object containing shipping zones or an error message.
 */
export const getAllShippingZones = async (
  _: any,
  args: QueryGetAllShippingZonesArgs,
  { user }: Context
): Promise<GetShippingZonesResponseOrError> => {
  try {
    // Verify user authentication
    const authResponse = checkUserAuth(user);
    if (authResponse) return authResponse;

    // Check if user has permission to view shipping zones
    const canRead = await checkUserPermission({
      action: "canRead",
      entity: "shipping settings",
      user,
    });

    if (!canRead) {
      return {
        statusCode: 403,
        success: false,
        message: "You do not have permission to view shipping zones info",
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

    // Attempt to retrieve cached shipping zone and total count from Redis
    let shippingZonesData;
    let total;

    // On cache miss, fetch shipping zones from database
    const { shippingZones: dbShippingZones, total: queryTotal } =
      await paginateShippingZones({
        page,
        limit,
        search,
        sortBy,
        sortOrder: safeSortOrder,
      });

    total = queryTotal;

    // Map database shipping zones to response format
    shippingZonesData = dbShippingZones.map((shippingZone) => ({
      id: shippingZone.id,
      name: shippingZone.name,
      regions: shippingZone.regions,
      zipCodes: shippingZone.zipCodes,
      shippingMethods: shippingZone.shippingMethods?.map((method) => ({
        id: method.id,
        title: method.title,
        status: method.status,
        description: method.description,
        createdBy: method.createdBy as any,
        createdAt:
          method.createdAt instanceof Date
            ? method.createdAt.toISOString()
            : method.createdAt,
        deletedAt:
          method.deletedAt instanceof Date
            ? method.deletedAt.toISOString()
            : method.deletedAt,
        flatRate: method.flatRate
          ? {
              id: method.flatRate.id,
              title: method.flatRate.title,
              taxStatus: method.flatRate.taxStatus,
              cost: method.flatRate.cost,
              createdBy: method.flatRate.createdBy as any,
              createdAt:
                method.flatRate.createdAt instanceof Date
                  ? method.flatRate.createdAt.toISOString()
                  : method.flatRate.createdAt,
              deletedAt:
                method.flatRate.deletedAt instanceof Date
                  ? method.flatRate.deletedAt.toISOString()
                  : method.flatRate.deletedAt,
              costs: method.flatRate.costs.map((cost) => ({
                id: cost.id,
                cost: cost.cost,
                shippingClass: {
                  ...cost.shippingClass,
                  createdAt:
                    cost.shippingClass.createdAt instanceof Date
                      ? cost.shippingClass.createdAt.toISOString()
                      : cost.shippingClass.createdAt,
                  deletedAt:
                    cost.shippingClass.deletedAt instanceof Date
                      ? cost.shippingClass.deletedAt.toISOString()
                      : cost.shippingClass.deletedAt,
                  createdBy: cost.shippingClass.createdBy as any,
                },
              })),
            }
          : null,
        freeShipping: method.freeShipping
          ? {
              id: method.freeShipping.id,
              title: method.freeShipping.title,
              conditions: method.freeShipping.conditions,
              minimumOrderAmount: method.freeShipping.minimumOrderAmount,
              applyMinimumOrderRuleBeforeCoupon:
                method.freeShipping.applyMinimumOrderRuleBeforeCoupon,
              createdBy: method.freeShipping.createdBy as any,
              createdAt:
                method.freeShipping.createdAt instanceof Date
                  ? method.freeShipping.createdAt.toISOString()
                  : method.freeShipping.createdAt,
              deletedAt:
                method.freeShipping.deletedAt instanceof Date
                  ? method.freeShipping.deletedAt.toISOString()
                  : method.freeShipping.deletedAt,
            }
          : null,
        localPickUp: method.localPickUp
          ? {
              id: method.localPickUp.id,
              title: method.localPickUp.title,
              cost: method.localPickUp.cost,
              taxStatus: method.localPickUp.taxStatus,
              createdBy: method.localPickUp.createdBy as any,
              createdAt:
                method.localPickUp.createdAt instanceof Date
                  ? method.localPickUp.createdAt.toISOString()
                  : method.localPickUp.createdAt,
              deletedAt:
                method.localPickUp.deletedAt instanceof Date
                  ? method.localPickUp.deletedAt.toISOString()
                  : method.localPickUp.deletedAt,
            }
          : null,
        ups: method.ups
          ? {
              id: method.ups.id,
              title: method.ups.title,
              createdBy: method.ups.createdBy as any,
              createdAt:
                method.ups.createdAt instanceof Date
                  ? method.ups.createdAt.toISOString()
                  : method.ups.createdAt,
              deletedAt:
                method.ups.deletedAt instanceof Date
                  ? method.ups.deletedAt.toISOString()
                  : method.ups.deletedAt,
            }
          : null,
      })),
      createdBy: shippingZone.createdBy as any,
      createdAt: shippingZone.createdAt?.toISOString() || null,
      deletedAt: shippingZone.deletedAt?.toISOString() || null,
    }));

    return {
      statusCode: 200,
      success: true,
      message: "Shipping zones fetched successfully",
      shippingZones: shippingZonesData,
      total,
      __typename: "ShippingZonePaginationResponse",
    };
  } catch (error: any) {
    console.error("Error fetching shipping zones:", {
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
