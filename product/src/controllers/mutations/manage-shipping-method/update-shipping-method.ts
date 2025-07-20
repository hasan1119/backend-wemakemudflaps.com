import CONFIG from "../../../config/config";
import { Context } from "../../../context";
import {
  getShippingClassInfoByIdFromRedis,
  setShippingClassInfoByIdInRedis,
} from "../../../helper/redis";
import {
  MutationUpdateShippingMethodArgs,
  UpdateShippingMethodResponseOrError,
} from "../../../types";
import { updateShippingMethodSchema } from "../../../utils/data-validation";
import {
  checkUserAuth,
  checkUserPermission,
  getShippingClassById,
  getShippingClassesByIds,
  getShippingMethodById,
  getShippingZoneById,
  updateShippingMethod as updateShippingMethodService,
} from "../../services";

/** Handles the updating of a shipping method in the system.
 *
 * Workflow:
 * 1. Verifies user authentication and permission to update shipping methods.
 * 2. Validates input data using Zod schema.
 * 3. Checks if flat rate shipping method is provided and validates shipping classes.
 * 4. Checks if the shipping zone exists.
 * 5. Updates the shipping method in the database with audit information from the authenticated user.
 * 6. Returns a success response or error if validation, permission, or update fails.
 *
 * @param _ - Unused parent parameter for GraphQL resolver.
 * @param args - Input arguments containing shipping method details.
 * @param context - GraphQL context containing authenticated user information.
 * @returns A promise resolving to a UpdateShippingMethodResponseOrError object containing status, message, and errors if applicable.
 */
export const updateShippingMethod = async (
  _: any,
  args: MutationUpdateShippingMethodArgs,
  { user }: Context
): Promise<UpdateShippingMethodResponseOrError> => {
  try {
    // Verify user authentication
    const authError = checkUserAuth(user);
    if (authError) return authError;

    // Check if user has permission to create a shipping method
    const hasPermission = await checkUserPermission({
      user,
      action: "canUpdate",
      entity: "shipping settings",
    });

    if (!hasPermission) {
      return {
        statusCode: 403,
        success: false,
        message: "You do not have permission to create shipping method(s)",
        __typename: "BaseResponse",
      };
    }

    // Validate input data with Zod schema
    const result = await updateShippingMethodSchema.safeParseAsync(args);

    // Return detailed validation errors if input is invalid
    if (!result.success) {
      const errors = result.error.errors.map((e) => ({
        field: e.path.join("."),
        message: e.message,
      }));

      return {
        statusCode: 400,
        success: false,
        message: "Validation failed",
        errors,
        __typename: "ErrorResponse",
      };
    }

    const { id, flatRate, freeShipping, localPickUp, ups, shippingZoneId } =
      result.data;

    // Shipping zone exists check can be added here if needed
    const shippingZone = await getShippingZoneById(shippingZoneId);

    if (!shippingZone) {
      return {
        statusCode: 404,
        success: false,
        message: "Shipping zone not found",
        __typename: "ErrorResponse",
      };
    }

    // Check if flat rate shipping method is provided
    if (flatRate) {
      const shippingClassesIds = flatRate.costs.map(
        (cost) => cost.shippingClassId
      );

      let shippingClasses;

      let missingShippingClassesId = [];

      shippingClasses = await Promise.all(
        shippingClassesIds.map(getShippingClassInfoByIdFromRedis)
      );

      // Check for missing shipping classes
      shippingClasses.forEach((shippingClass, index) => {
        if (!shippingClass) {
          missingShippingClassesId.push(shippingClassesIds[index]);
        }
      });

      // fetch missing shipping classes from the database
      if (missingShippingClassesId.length > 0) {
        const shippingClasses = await getShippingClassesByIds(
          missingShippingClassesId
        );
        shippingClasses.forEach((shippingClass) => {
          if (shippingClass) {
            shippingClasses.push(shippingClass);
          }
        });

        if (shippingClasses.length !== shippingClassesIds.length) {
          return {
            statusCode: 404,
            success: false,
            message: "One or more shipping classes not found",
            __typename: "ErrorResponse",
          };
        }

        // Cache the shipping classes in Redis
        await Promise.all(
          shippingClasses.map((shippingClass) =>
            setShippingClassInfoByIdInRedis(shippingClass.id, {
              ...shippingClass,
              createdBy: shippingClass.createdBy as any,
              createdAt:
                shippingClass.createdAt instanceof Date
                  ? shippingClass.createdAt.toISOString()
                  : shippingClass.createdAt,
              deletedAt:
                shippingClass.deletedAt instanceof Date
                  ? shippingClass.deletedAt.toISOString()
                  : shippingClass.deletedAt,
            })
          )
        );
      }
    }

    const shippingMethodExists = await getShippingMethodById(id);

    if (!shippingMethodExists) {
      return {
        statusCode: 404,
        success: false,
        message: "Shipping method not found",
        __typename: "ErrorResponse",
      };
    }

    if (shippingMethodExists.flatRate && (freeShipping || localPickUp || ups)) {
      return {
        statusCode: 400,
        success: false,
        message:
          "Flat rate shipping method cannot be updated with other shipping method types",
        __typename: "ErrorResponse",
      };
    }

    if (shippingMethodExists.freeShipping && (flatRate || localPickUp || ups)) {
      return {
        statusCode: 400,
        success: false,
        message:
          "Free shipping method cannot be updated with other shipping method types",
        __typename: "ErrorResponse",
      };
    }

    if (shippingMethodExists.localPickUp && (flatRate || freeShipping || ups)) {
      return {
        statusCode: 400,
        success: false,
        message:
          "Local pick up shipping method cannot be updated with other shipping method types",
        __typename: "ErrorResponse",
      };
    }
    if (shippingMethodExists.ups && (flatRate || freeShipping || localPickUp)) {
      return {
        statusCode: 400,
        success: false,
        message:
          "UPS shipping method cannot be updated with other shipping method types",
        __typename: "ErrorResponse",
      };
    }

    if (shippingMethodExists?.flatRate?.id) {
      if (!flatRate.id) {
        return {
          statusCode: 400,
          success: false,
          message: "Flat rate shipping method ID is required",
          __typename: "ErrorResponse",
        };
      }
      if (shippingMethodExists.flatRate.id !== flatRate.id) {
        return {
          statusCode: 400,
          success: false,
          message: "Flat rate shipping method ID is not valid",
          __typename: "ErrorResponse",
        };
      }

      for (const cost of flatRate.costs) {
        if (!cost?.id) {
          return {
            statusCode: 400,
            success: false,
            message: "Flat rate cost ID is required",
            __typename: "ErrorResponse",
          };
        }

        if (shippingMethodExists.flatRate.costs.find((c) => c.id !== cost.id)) {
          return {
            statusCode: 400,
            success: false,
            message: "Flat rate cost ID is not valid",
            __typename: "ErrorResponse",
          };
        }

        if (!cost?.shippingClassId) {
          return {
            statusCode: 400,
            success: false,
            message: "Shipping class ID is required for flat rate costs",
            __typename: "ErrorResponse",
          };
        }

        let shippingClass;
        shippingClass = await getShippingClassInfoByIdFromRedis(
          cost.shippingClassId
        );
        if (!shippingClass) {
          shippingClass = await getShippingClassById(cost.shippingClassId);

          if (!shippingClass) {
            return {
              statusCode: 404,
              success: false,
              message: "Shipping class not found",
              __typename: "ErrorResponse",
            };
          }
          await setShippingClassInfoByIdInRedis(cost.shippingClassId, {
            ...shippingClass,
            createdBy: shippingClass.createdBy as any,
            createdAt: shippingClass.createdAt,
            deletedAt: shippingClass.deletedAt,
          });
        }
      }
    }

    if (shippingMethodExists?.freeShipping?.id) {
      if (!freeShipping?.id) {
        return {
          statusCode: 400,
          success: false,
          message: "Free shipping method ID is required",
          __typename: "ErrorResponse",
        };
      }
      if (shippingMethodExists.freeShipping.id !== freeShipping.id) {
        return {
          statusCode: 400,
          success: false,
          message: "Free shipping method ID is not valid",
          __typename: "ErrorResponse",
        };
      }
    }

    if (shippingMethodExists?.localPickUp?.id) {
      if (!localPickUp?.id) {
        return {
          statusCode: 400,
          success: false,
          message: "Local pick up shipping method ID is required",
          __typename: "ErrorResponse",
        };
      }
      if (shippingMethodExists.localPickUp.id !== localPickUp.id) {
        return {
          statusCode: 400,
          success: false,
          message: "Local pick up shipping method ID is not valid",
          __typename: "ErrorResponse",
        };
      }
    }

    if (shippingMethodExists?.ups?.id) {
      if (!ups?.id) {
        return {
          statusCode: 400,
          success: false,
          message: "UPS shipping method ID is required",
          __typename: "ErrorResponse",
        };
      }
      if (shippingMethodExists.ups.id !== ups.id) {
        return {
          statusCode: 400,
          success: false,
          message: "UPS shipping method ID is not valid",
          __typename: "ErrorResponse",
        };
      }
    }

    // update the shipping method using the service
    const shippingMethod = await updateShippingMethodService(
      shippingMethodExists,
      args,
      user.id
    );

    return {
      statusCode: 200,
      success: true,
      message: "Shipping method updated successfully",
      shippingMethod: {
        ...shippingMethod,
        flatRate: shippingMethod.flatRate
          ? {
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
            }
          : null,
        shippingZone: {
          id: shippingZone.id,
          name: shippingZone.name,
          regions: shippingZone.regions,
          zipCodes: shippingZone.zipCodes,
          createdBy: shippingZone.createdBy as any,
          createdAt:
            shippingZone.createdAt instanceof Date
              ? shippingZone.createdAt.toISOString()
              : shippingZone.createdAt,
          deletedAt:
            shippingZone.deletedAt instanceof Date
              ? shippingZone.deletedAt.toISOString()
              : shippingZone.deletedAt,
        },
        freeShipping: shippingMethod.freeShipping
          ? {
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
            }
          : null,
        localPickUp: shippingMethod.localPickUp
          ? {
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
            }
          : null,
        ups: shippingMethod.ups
          ? {
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
            }
          : null,
        createdBy: shippingMethod.createdBy as any,
        createdAt:
          shippingMethod.createdAt instanceof Date
            ? shippingMethod.createdAt.toISOString()
            : shippingMethod.createdAt,
        deletedAt:
          shippingMethod.deletedAt instanceof Date
            ? shippingMethod.deletedAt.toISOString()
            : shippingMethod.deletedAt,
      },
      __typename: "ShippingMethodResponse",
    };
  } catch (error) {
    console.error("Error updating shipping method:", error);
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
