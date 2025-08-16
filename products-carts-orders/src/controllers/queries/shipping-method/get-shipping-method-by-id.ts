import CONFIG from "../../../config/config";
import { Context } from "../../../context";
import {
  GetShippingMethodByIdResponseOrError,
  QueryGetShippingMethodByIdArgs,
} from "../../../types";
import { idSchema } from "../../../utils/data-validation";
import { checkUserAuth, checkUserPermission } from "../../services";
import { getShippingMethodById as getShippingMethodByIdService } from "../../services/shipping-method/get-shipping-method.service";

/**
 * Handles retrieving a shipping method by its ID with validation and permission checks.
 *
 * Workflow:
 * 1. Verifies user authentication and checks permission to view shipping methods.
 * 2. Validates input shipping method ID using Zod schema.
 * 3. Attempts to retrieve shipping method data from Redis for performance optimization.
 * 4. Fetches shipping method data from the database if not found in Redis and caches it.
 * 5. Returns a success response with shipping method data or an error if validation, permission, or retrieval fails.
 *
 * @param _ - Unused parent parameter for GraphQL resolver.
 * @param args - Input arguments containing the shipping method ID.
 * @param context - GraphQL context containing authenticated user information.
 * @returns A promise resolving to a GetShippingMethodByIDResponseOrError object containing status, message, shipping method data, and errors if applicable.
 */
export const getShippingMethodById = async (
  _: any,
  args: QueryGetShippingMethodByIdArgs,
  { user }: Context
): Promise<GetShippingMethodByIdResponseOrError> => {
  try {
    // Verify user authentication
    const authResponse = checkUserAuth(user);
    if (authResponse) return authResponse;

    // Check if user has permission to view shipping methods
    const canRead = await checkUserPermission({
      action: "canRead",
      entity: "shipping_settings",
      user,
    });

    if (!canRead) {
      return {
        statusCode: 403,
        success: false,
        message: "You do not have permission to view shipping method info",
        __typename: "BaseResponse",
      };
    }

    // Validate input shipping method ID with Zod schema
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

    // On cache miss, fetch shipping method data from database
    const dbShippingMethod = await getShippingMethodByIdService(id);

    if (!dbShippingMethod) {
      return {
        statusCode: 404,
        success: false,
        message: `Shipping method not found with this id: ${id}, or it may have been deleted`,
        __typename: "BaseResponse",
      };
    }

    return {
      statusCode: 200,
      success: true,
      message: "Shipping method fetched successfully",
      shippingMethod: {
        ...dbShippingMethod,
        createdBy: dbShippingMethod.createdBy as any,
        flatRate: dbShippingMethod.flatRate
          ? {
              ...dbShippingMethod.flatRate,
              createdBy: dbShippingMethod.flatRate.createdBy as any,
              createdAt:
                dbShippingMethod.flatRate.createdAt instanceof Date
                  ? dbShippingMethod.flatRate.createdAt.toISOString()
                  : dbShippingMethod.flatRate.createdAt,
              deletedAt:
                dbShippingMethod.flatRate.deletedAt instanceof Date
                  ? dbShippingMethod.flatRate.deletedAt.toISOString()
                  : dbShippingMethod.flatRate.deletedAt,
              costs: dbShippingMethod.flatRate.costs.map((cost) => ({
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
            }
          : null,
        shippingZone: dbShippingMethod.shippingZone
          ? {
              id: dbShippingMethod.shippingZone.id,
              name: dbShippingMethod.shippingZone.name,
              regions: dbShippingMethod.shippingZone.regions,
              zipCodes: dbShippingMethod.shippingZone.zipCodes,
              createdBy: dbShippingMethod.shippingZone.createdBy as any,
              createdAt:
                dbShippingMethod.shippingZone.createdAt instanceof Date
                  ? dbShippingMethod.shippingZone.createdAt.toISOString()
                  : dbShippingMethod.shippingZone.createdAt,
              deletedAt:
                dbShippingMethod.shippingZone.deletedAt instanceof Date
                  ? dbShippingMethod.shippingZone.deletedAt.toISOString()
                  : dbShippingMethod.shippingZone.deletedAt,
            }
          : null,
        freeShipping: dbShippingMethod.freeShipping
          ? {
              ...dbShippingMethod.freeShipping,
              createdBy: dbShippingMethod.freeShipping.createdBy as any,
              createdAt:
                dbShippingMethod.freeShipping.createdAt instanceof Date
                  ? dbShippingMethod.freeShipping.createdAt.toISOString()
                  : dbShippingMethod.freeShipping.createdAt,
              deletedAt:
                dbShippingMethod.freeShipping.deletedAt instanceof Date
                  ? dbShippingMethod.freeShipping.deletedAt.toISOString()
                  : dbShippingMethod.freeShipping.deletedAt,
            }
          : null,
        localPickUp: dbShippingMethod.localPickUp
          ? {
              ...dbShippingMethod.localPickUp,
              createdBy: dbShippingMethod.localPickUp.createdBy as any,
              createdAt:
                dbShippingMethod.localPickUp.createdAt instanceof Date
                  ? dbShippingMethod.localPickUp.createdAt.toISOString()
                  : dbShippingMethod.localPickUp.createdAt,
              deletedAt:
                dbShippingMethod.localPickUp.deletedAt instanceof Date
                  ? dbShippingMethod.localPickUp.deletedAt.toISOString()
                  : dbShippingMethod.localPickUp.deletedAt,
            }
          : null,
        ups: dbShippingMethod.ups
          ? {
              ...dbShippingMethod.ups,
              createdBy: dbShippingMethod.ups.createdBy as any,
              createdAt:
                dbShippingMethod.ups.createdAt instanceof Date
                  ? dbShippingMethod.ups.createdAt.toISOString()
                  : dbShippingMethod.ups.createdAt,
              deletedAt:
                dbShippingMethod.ups.deletedAt instanceof Date
                  ? dbShippingMethod.ups.deletedAt.toISOString()
                  : dbShippingMethod.ups.deletedAt,
            }
          : null,
        createdAt:
          dbShippingMethod.createdAt instanceof Date
            ? dbShippingMethod.createdAt.toISOString()
            : dbShippingMethod.createdAt,
        deletedAt:
          dbShippingMethod.deletedAt instanceof Date
            ? dbShippingMethod.deletedAt.toISOString()
            : dbShippingMethod.deletedAt,
      },
      __typename: "ShippingMethodResponse",
    };
  } catch (error: any) {
    console.error("Error retrieving shipping method:", {
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
