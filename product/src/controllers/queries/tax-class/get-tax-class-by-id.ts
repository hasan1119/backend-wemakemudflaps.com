import CONFIG from "../../../config/config";
import { Context } from "../../../context";
import {
  getTaxClassInfoByIdFromRedis,
  setTaxClassInfoByIdInRedis,
} from "../../../helper/redis";
import {
  GetTaxClassByIdResponseOrError,
  QueryGetTaxClassByIdArgs,
} from "../../../types";
import { idSchema } from "../../../utils/data-validation";
import {
  checkUserAuth,
  checkUserPermission,
  getTaxClassById as getTaxClassByIdService,
} from "../../services";

/**
 * Handles retrieving a tax class by its ID with validation and permission checks.
 *
 * Workflow:
 * 1. Verifies user authentication and checks permission to view tax classes.
 * 2. Validates input tax class ID using Zod schema.
 * 3. Attempts to retrieve tax class data from Redis for performance optimization.
 * 4. Fetches tax class data from the database if not found in Redis and caches it.
 * 5. Returns a success response with tax class data or an error if validation, permission, or retrieval fails.
 *
 * @param _ - Unused parent parameter for GraphQL resolver.
 * @param args - Input arguments containing the tax class ID.
 * @param context - GraphQL context containing authenticated user information.
 * @returns A promise resolving to a GetTaxClassByIDResponseOrError object containing status, message, tax class data, and errors if applicable.
 */
export const getTaxClassById = async (
  _: any,
  args: QueryGetTaxClassByIdArgs,
  { user }: Context
): Promise<GetTaxClassByIdResponseOrError> => {
  try {
    // Verify user authentication
    const authResponse = checkUserAuth(user);
    if (authResponse) return authResponse;

    // Check if user has permission to view tax Classes
    const canRead = await checkUserPermission({
      action: "canRead",
      entity: "tax class",
      user,
    });

    if (!canRead) {
      return {
        statusCode: 403,
        success: false,
        message: "You do not have permission to view tax class info",
        __typename: "BaseResponse",
      };
    }

    // Validate input tax class ID with Zod schema
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

    // Attempt to retrieve cached tax class data from Redis
    let taxClassData = await getTaxClassInfoByIdFromRedis(id);

    if (taxClassData?.deletedAt) {
      return {
        statusCode: 404,
        success: false,
        message: `Tax class not found with this id: ${id}, or it may have been deleted or moved to the trash`,
        __typename: "BaseResponse",
      };
    }

    if (!taxClassData) {
      // On cache miss, fetch tax class data from database
      const dbTaxClass = await getTaxClassByIdService(id);

      if (!dbTaxClass) {
        return {
          statusCode: 404,
          success: false,
          message: `TaxClass not found with this id: ${id}, or it may have been deleted or moved to the trash`,
          __typename: "BaseResponse",
        };
      }

      // Cache tax class data in Redis
      await setTaxClassInfoByIdInRedis(id, dbTaxClass);
      taxClassData = dbTaxClass;
    }

    return {
      statusCode: 200,
      success: true,
      message: "Tax class fetched successfully",
      taxClass: {
        id: taxClassData.id,
        value: taxClassData.value,
        description: taxClassData.description,
        createdBy: taxClassData.createdBy as any,
        createdAt:
          taxClassData.createdAt instanceof Date
            ? taxClassData.createdAt.toISOString()
            : taxClassData.createdAt,
        deletedAt:
          taxClassData.deletedAt instanceof Date
            ? taxClassData.deletedAt.toISOString()
            : taxClassData.deletedAt,
      },
      __typename: "TaxClassResponse",
    };
  } catch (error: any) {
    console.error("Error retrieving tax class:", {
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
