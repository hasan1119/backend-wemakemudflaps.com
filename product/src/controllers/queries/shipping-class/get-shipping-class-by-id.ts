import CONFIG from "../../../config/config";
import { Context } from "../../../context";
import {
  getShippingClassInfoByIdFromRedis,
  setShippingClassInfoByIdInRedis,
} from "../../../helper/redis";
import {
  GetShippingClassByIdResponseOrError,
  QueryGetShippingClassByIdArgs,
} from "../../../types";
import { idSchema } from "../../../utils/data-validation";
import {
  checkUserAuth,
  checkUserPermission,
  getShippingClassById as getShippingClassByIdService,
} from "../../services";

/**
 * Handles retrieving a shipping class by its ID with validation and permission checks.
 *
 * Workflow:
 * 1. Verifies user authentication and checks permission to view shipping classes.
 * 2. Validates input shipping class ID using Zod schema.
 * 3. Attempts to retrieve shipping class data from Redis for performance optimization.
 * 4. Fetches shipping class data from the database if not found in Redis and caches it.
 * 5. Returns a success response with shipping class data or an error if validation, permission, or retrieval fails.
 *
 * @param _ - Unused parent parameter for GraphQL resolver.
 * @param args - Input arguments containing the shipping class ID.
 * @param context - GraphQL context containing authenticated user information.
 * @returns A promise resolving to a GetShippingClassByIDResponseOrError object containing status, message, shipping class data, and errors if applicable.
 */
export const getShippingClassById = async (
  _: any,
  args: QueryGetShippingClassByIdArgs,
  { user }: Context
): Promise<GetShippingClassByIdResponseOrError> => {
  try {
    // Verify user authentication
    const authResponse = checkUserAuth(user);
    if (authResponse) return authResponse;

    // Check if user has permission to view shipping Classes
    const canRead = await checkUserPermission({
      action: "canRead",
      entity: "shipping settings",
      user,
    });

    if (!canRead) {
      return {
        statusCode: 403,
        success: false,
        message: "You do not have permission to view shipping class info",
        __typename: "BaseResponse",
      };
    }

    // Validate input shipping class ID with Zod schema
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

    // Attempt to retrieve cached shipping class data from Redis
    let shippingClassData = await getShippingClassInfoByIdFromRedis(id);

    if (shippingClassData?.deletedAt) {
      return {
        statusCode: 404,
        success: false,
        message: `Shipping class not found with this id: ${id}, or it may have been deleted or moved to the trash`,
        __typename: "BaseResponse",
      };
    }

    if (!shippingClassData) {
      // On cache miss, fetch shipping class data from database
      const dbShippingClass = await getShippingClassByIdService(id);

      if (!dbShippingClass) {
        return {
          statusCode: 404,
          success: false,
          message: `ShippingClass not found with this id: ${id}, or it may have been deleted or moved to the trash`,
          __typename: "BaseResponse",
        };
      }

      // Cache shipping class data in Redis
      await setShippingClassInfoByIdInRedis(id, dbShippingClass);
      shippingClassData = dbShippingClass;
    }

    return {
      statusCode: 200,
      success: true,
      message: "Shipping class fetched successfully",
      shippingClass: {
        id: shippingClassData.id,
        value: shippingClassData.value,
        description: shippingClassData.description,
        createdBy: shippingClassData.createdBy as any,
        createdAt:
          shippingClassData.createdAt instanceof Date
            ? shippingClassData.createdAt.toISOString()
            : shippingClassData.createdAt,
        deletedAt:
          shippingClassData.deletedAt instanceof Date
            ? shippingClassData.deletedAt.toISOString()
            : shippingClassData.deletedAt,
      },
      __typename: "ShippingClassResponse",
    };
  } catch (error: any) {
    console.error("Error retrieving shipping class:", {
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
