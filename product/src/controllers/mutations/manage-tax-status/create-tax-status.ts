import CONFIG from "../../../config/config";
import { Context } from "../../../context";
import {
  clearAllTaxStatusSearchCache,
  getTaxStatusValueExistFromRedis,
  setTaxStatusInfoByIdInRedis,
  setTaxStatusValueExistInRedis,
} from "../../../helper/redis";
import {
  CreateTaxStatusResponseOrError,
  MutationCreateTaxStatusArgs,
} from "../../../types";
import { createTaxStatusSchema } from "../../../utils/data-validation";
import {
  checkUserAuth,
  checkUserPermission,
  createTaxStatus as createTaxStatusService,
  findTaxStatusByValue,
} from "../../services";

/**
 * Handles the creation of a new tax status in the system.
 *
 * Workflow:
 * 1. Verifies user authentication and permission to create tax status.
 * 2. Validates input (value, description) using Zod schema.
 * 3. Checks Redis for existing tax status value to prevent duplicates.
 * 4. Queries the database for tax status existence if not found in Redis.
 * 5. Creates the tax status in the database with audit information from the authenticated user.
 * 6. Caches the new tax status and its name existence in Redis for future requests.
 * 7. Returns a success response or error if validation, permission, or creation fails.
 *
 * @param _ - Unused parent parameter for GraphQL resolver.
 * @param args - Input arguments containing tax status name and slug.
 * @param context - GraphQL context containing authenticated user information.
 * @returns A promise resolving to a BaseResponseOrError object containing status, message, and errors if applicable.
 */
export const createTaxStatus = async (
  _: any,
  args: MutationCreateTaxStatusArgs,
  { user }: Context
): Promise<CreateTaxStatusResponseOrError> => {
  try {
    // Verify user authentication
    const authError = checkUserAuth(user);
    if (authError) return authError;

    // Check if user has permission to create a tax status
    const hasPermission = await checkUserPermission({
      user,
      action: "canCreate",
      entity: "tax status",
    });

    if (!hasPermission) {
      return {
        statusCode: 403,
        success: false,
        message: "You do not have permission to create tax status(es)",
        __typename: "BaseResponse",
      };
    }

    // Validate input data with Zod schema
    const result = await createTaxStatusSchema.safeParseAsync(args);

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

    // Attempt to check for existing tax status in Redis
    let taxStatusExists = await getTaxStatusValueExistFromRedis(value);

    if (!taxStatusExists) {
      // On cache miss, check database for tax status existence
      const existingTaxStatus = await findTaxStatusByValue(value);

      if (existingTaxStatus) {
        // Cache tax status existence in Redis
        await setTaxStatusValueExistInRedis(value);

        return {
          statusCode: 400,
          success: false,
          message: `A tax status with this ${value} already exists`,
          __typename: "BaseResponse",
        };
      }
    } else {
      return {
        statusCode: 400,
        success: false,
        message: `A tax status with this ${value} already exists`,
        __typename: "BaseResponse",
      };
    }

    // Create the tax status in the database
    const taxStatus = await createTaxStatusService(
      { value, description },
      user.id
    );

    // Cache tax status information and existence in Redis
    await Promise.all([
      setTaxStatusInfoByIdInRedis(taxStatus.id, taxStatus),
      setTaxStatusValueExistInRedis(taxStatus.value),
      clearAllTaxStatusSearchCache(),
    ]);

    return {
      statusCode: 201,
      success: true,
      message: "Tax status created successfully",
      taxStatus: {
        id: taxStatus.id,
        value: taxStatus.value,
        description: taxStatus.description,
        createdBy: taxStatus.createdBy as any,
        createdAt:
          taxStatus.createdAt instanceof Date
            ? taxStatus.createdAt.toISOString()
            : taxStatus.createdAt,
        deletedAt:
          taxStatus.deletedAt instanceof Date
            ? taxStatus.deletedAt.toISOString()
            : taxStatus.deletedAt,
      },
      __typename: "TaxStatusResponse",
    };
  } catch (error: any) {
    console.error("Error creating tax status:", error);
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
