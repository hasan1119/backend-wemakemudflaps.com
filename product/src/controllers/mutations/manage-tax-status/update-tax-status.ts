import CONFIG from "../../../config/config";
import { Context } from "../../../context";
import {
  clearAllTaxStatusSearchCache,
  getTaxStatusInfoByIdFromRedis,
  getTaxStatusValueExistFromRedis,
  removeTaxStatusInfoByIdFromRedis,
  removeTaxStatusValueExistFromRedis,
  setTaxStatusInfoByIdInRedis,
  setTaxStatusValueExistInRedis,
} from "../../../helper/redis";
import {
  MutationUpdateTaxStatusArgs,
  UpdateTaxStatusResponseOrError,
} from "../../../types";
import { updateTaxStatusSchema } from "../../../utils/data-validation";
import {
  checkUserAuth,
  checkUserPermission,
  findTaxStatusByValueToUpdate,
  getTaxStatusById,
  updateTaxStatus as updateTaxStatusService,
} from "../../services";

/**
 * Handles updating tax status data (value, description) with proper validation and permission checks.
 *
 * Workflow:
 * 1. Authenticates user and verifies permission to update tax statuses.
 * 2. Validates input (id, value, description) using Zod schema.
 * 3. Fetches current tax status data from Redis or DB.
 * 4. Checks if updated value conflicts with existing tax statuses.
 * 5. Updates the tax status in the database.
 * 6. Updates Redis with new tax status info and value existence key.
 * 7. Returns the updated tax status or error if validation or update fails.
 *
 * @param _ - Unused parent parameter for GraphQL resolver.
 * @param args - Input arguments containing tax status ID and updated fields.
 * @param context - GraphQL context containing authenticated user information.
 * @returns A promise resolving to an UpdateTaxStatusResponseOrError.
 */
export const updateTaxStatus = async (
  _: any,
  args: MutationUpdateTaxStatusArgs,
  { user }: Context
): Promise<UpdateTaxStatusResponseOrError> => {
  try {
    // Check user authentication
    const authError = checkUserAuth(user);
    if (authError) return authError;

    // Permission check
    const hasPermission = await checkUserPermission({
      user,
      action: "canUpdate",
      entity: "tax status",
    });

    if (!hasPermission) {
      return {
        statusCode: 403,
        success: false,
        message: "You do not have permission to update tax status(es)",
        __typename: "BaseResponse",
      };
    }

    // Validate input
    const result = await updateTaxStatusSchema.safeParseAsync(args);
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

    const { id, value, description } = result.data;

    // Get current tax status data from Redis or DB
    let currentTaxStatus = await getTaxStatusInfoByIdFromRedis(id);

    if (currentTaxStatus?.deletedAt) {
      return {
        statusCode: 404,
        success: false,
        message: `Tax status not found with this id: ${id}, or it may have been deleted or moved to the trash`,
        __typename: "BaseResponse",
      };
    }

    if (!currentTaxStatus) {
      currentTaxStatus = await getTaxStatusById(id); // fallback to DB
      if (!currentTaxStatus) {
        return {
          statusCode: 404,
          success: false,
          message: `Tax status not found with this id: ${id}, or it may have been deleted or moved to the trash`,
          __typename: "BaseResponse",
        };
      }
    }

    // Check for duplicate value (if changed)
    if (value && value !== currentTaxStatus.value) {
      let valueExists;

      valueExists = await getTaxStatusValueExistFromRedis(value);

      if (!valueExists) {
        valueExists = await findTaxStatusByValueToUpdate(id, value);
      }

      if (valueExists) {
        await setTaxStatusValueExistInRedis(value);

        return {
          statusCode: 400,
          success: false,
          message: `Tax status value: "${value}" already exists`,
          __typename: "BaseResponse",
        };
      }
    }

    // Update the tax status in the database
    const updatedTaxStatus = await updateTaxStatusService(id, {
      value,
      description,
    });

    // Update Redis cache: remove old, add new
    await Promise.all([
      removeTaxStatusInfoByIdFromRedis(id),
      removeTaxStatusValueExistFromRedis(currentTaxStatus.value),
      clearAllTaxStatusSearchCache(),
      setTaxStatusInfoByIdInRedis(id, updatedTaxStatus),
      setTaxStatusValueExistInRedis(updatedTaxStatus.value),
    ]);

    return {
      statusCode: 200,
      success: true,
      message: "TaxStatus updated successfully",
      taxStatus: {
        id: updatedTaxStatus.id,
        value: updatedTaxStatus.value,
        description: updatedTaxStatus.description,
        createdBy: updatedTaxStatus.createdBy as any,
        createdAt: updatedTaxStatus.createdAt.toISOString(),
        deletedAt:
          updatedTaxStatus.deletedAt instanceof Date
            ? updatedTaxStatus.deletedAt.toISOString()
            : updatedTaxStatus.deletedAt,
      },
      __typename: "TaxStatusResponse",
    };
  } catch (error: any) {
    console.error("Error updating tax status:", error);
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
