import CONFIG from "../../../config/config";
import { Context } from "../../../context";
import {
  clearShippingClassesAndCountCache,
  getShippingClassValueExistFromRedis,
  setShippingClassInfoByIdInRedis,
  setShippingClassValueExistInRedis,
} from "../../../helper/redis";
import {
  CreateShippingClassResponseOrError,
  MutationCreateShippingClassArgs,
} from "../../../types";
import { createShippingClassSchema } from "../../../utils/data-validation";
import {
  checkUserAuth,
  checkUserPermission,
  createShippingClass as createShippingClassService,
  findShippingClassByValue,
} from "../../services";

/**
 * Handles the creation of a new shipping class in the system.
 *
 * Workflow:
 * 1. Verifies user authentication and permission to create shipping classes.
 * 2. Validates input (value, description) using Zod schema.
 * 3. Checks Redis for existing shipping class value to prevent duplicates.
 * 4. Queries the database for shipping class existence if not found in Redis.
 * 5. Creates the shipping class in the database with audit information from the authenticated user.
 * 6. Caches the new shipping class and its name existence in Redis for future requests.
 * 7. Returns a success response or error if validation, permission, or creation fails.
 *
 * @param _ - Unused parent parameter for GraphQL resolver.
 * @param args - Input arguments containing shipping class name and slug.
 * @param context - GraphQL context containing authenticated user information.
 * @returns A promise resolving to a BaseResponseOrError object containing status, message, and errors if applicable.
 */
export const createShippingClass = async (
  _: any,
  args: MutationCreateShippingClassArgs,
  { user }: Context
): Promise<CreateShippingClassResponseOrError> => {
  try {
    // Verify user authentication
    const authError = checkUserAuth(user);
    if (authError) return authError;

    // Check if user has permission to create a shipping class
    const hasPermission = await checkUserPermission({
      user,
      action: "canCreate",
      entity: "shipping_settings",
    });

    if (!hasPermission) {
      return {
        statusCode: 403,
        success: false,
        message: "You do not have permission to create shipping class(es)",
        __typename: "BaseResponse",
      };
    }

    // Validate input data with Zod schema
    const result = await createShippingClassSchema.safeParseAsync(args);

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

    const { value, description } = result.data;

    // Attempt to check for existing shipping class in Redis
    let shippingClassExists = await getShippingClassValueExistFromRedis(value);

    if (!shippingClassExists) {
      // On cache miss, check database for shipping class existence
      const existingShippingClass = await findShippingClassByValue(value);

      if (existingShippingClass) {
        // Cache shipping class existence in Redis
        await setShippingClassValueExistInRedis(value);

        return {
          statusCode: 400,
          success: false,
          message: `A shipping class with this ${value} already exists`,
          __typename: "BaseResponse",
        };
      }
    } else {
      return {
        statusCode: 400,
        success: false,
        message: `A shipping class with this ${value} already exists`,
        __typename: "BaseResponse",
      };
    }

    // Create the shipping class in the database
    const shippingClass = await createShippingClassService(
      { value, description },
      user.id
    );

    const shippingClassResponse = {
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
    };

    // Cache shipping class information and existence in Redis
    await Promise.all([
      setShippingClassInfoByIdInRedis(shippingClass.id, shippingClassResponse),
      setShippingClassValueExistInRedis(shippingClass.value),
      clearShippingClassesAndCountCache(),
    ]);

    return {
      statusCode: 201,
      success: true,
      message: "Shipping class created successfully",
      shippingClass: shippingClassResponse,
      __typename: "ShippingClassResponse",
    };
  } catch (error: any) {
    console.error("Error creating shipping class:", error);
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
