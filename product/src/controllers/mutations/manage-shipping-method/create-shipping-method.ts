import CONFIG from "../../../config/config";
import { Context } from "../../../context";
import {
  getShippingClassInfoByIdFromRedis,
  setShippingClassInfoByIdInRedis,
} from "../../../helper/redis";
import {
  CreateShippingMethodResponseOrError,
  MutationCreateShippingMethodArgs,
} from "../../../types";
import { createShippingMethodSchema } from "../../../utils/data-validation";
import {
  checkUserAuth,
  checkUserPermission,
  createShippingMethod as createShippingMethodService,
  getShippingClassesByIds,
  getShippingZoneById,
} from "../../services";

/** Handles the creation of a new shipping method in the system.
 *
 * Workflow:
 * 1. Verifies user authentication and permission to create shipping methods.
 * 2. Validates input data using Zod schema.
 * 3. Checks if flat rate shipping method is provided and validates shipping classes.
 * 4. Checks if the shipping zone exists.
 * 5. Creates the shipping method in the database with audit information from the authenticated user.
 * 6. Returns a success response or error if validation, permission, or creation fails.
 *
 * @param _ - Unused parent parameter for GraphQL resolver.
 * @param args - Input arguments containing shipping method details.
 * @param context - GraphQL context containing authenticated user information.
 * @returns A promise resolving to a CreateShippingMethodResponseOrError object containing status, message, and errors if applicable.
 */
export const createShippingMethod = async (
  _: any,
  args: MutationCreateShippingMethodArgs,
  { user }: Context
): Promise<CreateShippingMethodResponseOrError> => {
  try {
    // Verify user authentication
    const authError = checkUserAuth(user);
    if (authError) return authError;

    // Check if user has permission to create a shipping method
    const hasPermission = await checkUserPermission({
      user,
      action: "canCreate",
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
    const result = await createShippingMethodSchema.safeParseAsync(args);

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

    const { shippingZoneId, flatRate } = result.data;

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

    // Create the shipping method using the service
    const shippingMethod = await createShippingMethodService(args, user.id);

    return {
      statusCode: 201,
      success: true,
      message: "Shipping method created successfully",
      shippingMethod: {
        id: shippingMethod.id,
        title: shippingMethod.title,
        status: shippingMethod.status,
        description: shippingMethod.description,
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
    console.error("Error creating shipping method:", error);
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
