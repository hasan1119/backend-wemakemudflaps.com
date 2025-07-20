import CONFIG from "../../../config/config";
import { Context } from "../../../context";
import {
  MutationUpdateShippingZoneArgs,
  UpdateShippingZoneResponseOrError,
} from "../../../types";
import { updateShippingZoneSchema } from "../../../utils/data-validation";
import {
  checkUserAuth,
  checkUserPermission,
  getShippingZoneById,
  updateShippingZone as updateShippingZoneService,
} from "../../services";

/**
 * Updates an existing shipping zone with the provided details.
 *
 * Workflow:
 * 1. Validates user authentication and permissions.
 * 2. Validates input data against the Zod schema.
 * 3. Checks if the shipping zone exists.
 * 4. Updates the shipping zone and returns the updated details.
 *
 * @param _ - Unused parent argument.
 * @param args - Arguments containing the shipping zone details to update.
 * @param user - The authenticated user context.
 * @returns A response indicating success or failure of the operation.
 */
export const updateShippingZone = async (
  _: any,
  args: MutationUpdateShippingZoneArgs,
  { user }: Context
): Promise<UpdateShippingZoneResponseOrError> => {
  try {
    // Verify user authentication
    const authResponse = checkUserAuth(user);
    if (authResponse) return authResponse;

    // Check if user has permission to update shipping zones
    const canUpdate = await checkUserPermission({
      action: "canUpdate",
      entity: "shipping settings",
      user,
    });

    if (!canUpdate) {
      return {
        statusCode: 403,
        success: false,
        message: "You do not have permission to update shipping zone(s)",
        __typename: "BaseResponse",
      };
    }

    // Validate input user ID with Zod schema
    const validationResult = await updateShippingZoneSchema.safeParseAsync(
      args
    );

    // Return detailed validation errors if input is invalid
    if (!validationResult.success) {
      const errorMessages = validationResult.error.errors.map((error) => ({
        field: error.path.join("."), // Join path array to string for field identification
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

    const shippingZoneExists = await getShippingZoneById(id);

    if (!shippingZoneExists) {
      return {
        statusCode: 404,
        success: false,
        message: "Shipping zone not found",
        __typename: "BaseResponse",
      };
    }

    // Attempt to update the shipping zone
    const updatedShippingZone = await updateShippingZoneService(id, args);

    return {
      statusCode: 200,
      success: true,
      shippingZone: {
        id: updatedShippingZone.id,
        name: updatedShippingZone.name,
        regions: updatedShippingZone.regions,
        zipCodes: updatedShippingZone.zipCodes,
        createdBy: updatedShippingZone.createdBy as any,
        shippingMethods: updatedShippingZone.shippingMethods?.map((method) => ({
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
        createdAt:
          updatedShippingZone.createdAt instanceof Date
            ? updatedShippingZone.createdAt.toISOString()
            : updatedShippingZone.createdAt,
        deletedAt:
          updatedShippingZone.deletedAt instanceof Date
            ? updatedShippingZone.deletedAt.toISOString()
            : updatedShippingZone.deletedAt,
      },
      message: "Shipping zone updated successfully",
      __typename: "ShippingZoneResponse",
    };
  } catch (error) {
    console.error("Error updating shipping zone:", error);

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
