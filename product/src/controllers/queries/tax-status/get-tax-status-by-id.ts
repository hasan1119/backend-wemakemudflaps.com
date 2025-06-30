import CONFIG from "../../../config/config";
import { Context } from "../../../context";
import {
  getTaxStatusInfoByIdFromRedis,
  setTaxStatusInfoByIdInRedis,
} from "../../../helper/redis";
import {
  GetTaxStatusByIdResponseOrError,
  QueryGetTaxStatusByIdArgs,
} from "../../../types";
import { idSchema } from "../../../utils/data-validation";
import {
  checkUserAuth,
  checkUserPermission,
  getTaxStatusById as getTaxStatusByIdService,
} from "../../services";

/**
 * Handles retrieving a tax status by its ID with validation and permission checks.
 *
 * Workflow:
 * 1. Verifies user authentication and checks permission to view tax statuses.
 * 2. Validates input tax status ID using Zod schema.
 * 3. Attempts to retrieve tax status data from Redis for performance optimization.
 * 4. Fetches tax status data from the database if not found in Redis and caches it.
 * 5. Returns a success response with tax status data or an error if validation, permission, or retrieval fails.
 *
 * @param _ - Unused parent parameter for GraphQL resolver.
 * @param args - Input arguments containing the tax status ID.
 * @param context - GraphQL context containing authenticated user information.
 * @returns A promise resolving to a GetTaxStatusByIDResponseOrError object containing status, message, tax status data, and errors if applicable.
 */
export const getTaxStatusById = async (
  _: any,
  args: QueryGetTaxStatusByIdArgs,
  { user }: Context
): Promise<GetTaxStatusByIdResponseOrError> => {
  try {
    // Verify user authentication
    const authResponse = checkUserAuth(user);
    if (authResponse) return authResponse;

    // Check if user has permission to view tax Statuses
    const canRead = await checkUserPermission({
      action: "canRead",
      entity: "tax status",
      user,
    });

    if (!canRead) {
      return {
        statusCode: 403,
        success: false,
        message: "You do not have permission to view tax status info",
        __typename: "BaseResponse",
      };
    }

    // Validate input tax status ID with Zod schema
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

    // Attempt to retrieve cached tax status data from Redis
    let taxStatusData = await getTaxStatusInfoByIdFromRedis(id);

    if (taxStatusData?.deletedAt) {
      return {
        statusCode: 404,
        success: false,
        message: `Tax status not found with this id: ${id}, or it may have been deleted or moved to the trash`,
        __typename: "BaseResponse",
      };
    }

    if (!taxStatusData) {
      // On cache miss, fetch tax status data from database
      const dbTaxStatus = await getTaxStatusByIdService(id);

      if (!dbTaxStatus) {
        return {
          statusCode: 404,
          success: false,
          message: `TaxStatus not found with this id: ${id}, or it may have been deleted or moved to the trash`,
          __typename: "BaseResponse",
        };
      }

      // Cache tax status data in Redis
      await setTaxStatusInfoByIdInRedis(id, dbTaxStatus);
      taxStatusData = dbTaxStatus;
    }

    return {
      statusCode: 200,
      success: true,
      message: "Tax status fetched successfully",
      taxStatus: {
        id: taxStatusData.id,
        value: taxStatusData.value,
        description: taxStatusData.description,
        createdBy: taxStatusData.createdBy as any,
        createdAt:
          taxStatusData.createdAt instanceof Date
            ? taxStatusData.createdAt.toISOString()
            : taxStatusData.createdAt,
        deletedAt:
          taxStatusData.deletedAt instanceof Date
            ? taxStatusData.deletedAt.toISOString()
            : taxStatusData.deletedAt,
      },
      __typename: "TaxStatusResponse",
    };
  } catch (error: any) {
    console.error("Error retrieving tax status:", {
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
