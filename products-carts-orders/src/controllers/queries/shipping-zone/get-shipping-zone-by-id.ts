import CONFIG from "../../../config/config";
import { Context } from "../../../context";
import {
  GetShippingZoneByIdResponseOrError,
  QueryGetShippingZoneByIdArgs,
} from "../../../types";
import { idSchema } from "../../../utils/data-validation";
import {
  checkUserAuth,
  checkUserPermission,
  getShippingZoneById as getShippingZoneByIdService,
} from "../../services";

/**
 * Handles retrieving a shipping zone by its ID with validation and permission checks.
 *
 * Workflow:
 * 1. Verifies user authentication and checks permission to view shipping zones.
 * 2. Validates input shipping zone ID using Zod schema.
 * 3. Attempts to retrieve shipping zone data from Redis for performance optimization.
 * 4. Fetches shipping zone data from the database if not found in Redis and caches it.
 * 5. Returns a success response with shipping zone data or an error if validation, permission, or retrieval fails.
 *
 * @param _ - Unused parent parameter for GraphQL resolver.
 * @param args - Input arguments containing the shipping zone ID.
 * @param context - GraphQL context containing authenticated user information.
 * @returns A promise resolving to a GetShippingZoneByIDResponseOrError object containing status, message, shipping zone data, and errors if applicable.
 */
export const getShippingZoneById = async (
  _: any,
  args: QueryGetShippingZoneByIdArgs,
  { user }: Context
): Promise<GetShippingZoneByIdResponseOrError> => {
  try {
    // Verify user authentication
    const authResponse = checkUserAuth(user);
    if (authResponse) return authResponse;

    // Check if user has permission to view shipping zones
    const canRead = await checkUserPermission({
      action: "canRead",
      entity: "shipping_settings",
      user,
    });

    if (!canRead) {
      return {
        statusCode: 403,
        success: false,
        message: "You do not have permission to view shipping zone info",
        __typename: "BaseResponse",
      };
    }

    // Validate input shipping zone ID with Zod schema
    const validationResult = await idSchema.safeParseAsync(args);

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

    const { id } = args;

    // On cache miss, fetch shipping zone data from database
    const dbShippingZone = await getShippingZoneByIdService(id);

    if (!dbShippingZone) {
      return {
        statusCode: 404,
        success: false,
        message: `Shipping zone not found with this id: ${id}, or it may have been deleted`,
        __typename: "BaseResponse",
      };
    }

    return {
      statusCode: 200,
      success: true,
      message: "Shipping zone fetched successfully",
      shippingZone: {
        id: dbShippingZone.id,
        name: dbShippingZone.name,
        regions: dbShippingZone.regions || [],
        shippingMethods: dbShippingZone.shippingMethods?.map((method) => ({
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
        zipCodes: dbShippingZone.zipCodes,
        createdBy: dbShippingZone.createdBy as any,
        createdAt:
          dbShippingZone.createdAt instanceof Date
            ? dbShippingZone.createdAt.toISOString()
            : dbShippingZone.createdAt,
        deletedAt:
          dbShippingZone.deletedAt instanceof Date
            ? dbShippingZone.deletedAt.toISOString()
            : dbShippingZone.deletedAt,
      },
      __typename: "ShippingZoneResponse",
    };
  } catch (error: any) {
    console.error("Error retrieving shipping zone:", {
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
