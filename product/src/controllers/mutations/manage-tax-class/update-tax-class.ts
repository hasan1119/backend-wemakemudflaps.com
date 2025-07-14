import CONFIG from "../../../config/config";
import { Context } from "../../../context";
import {
  clearTaxClassesAndCountCache,
  getTaxClassInfoByIdFromRedis,
  getTaxClassValueExistFromRedis,
  removeTaxClassInfoByIdFromRedis,
  removeTaxClassValueExistFromRedis,
  setTaxClassInfoByIdInRedis,
  setTaxClassValueExistInRedis,
} from "../../../helper/redis";
import {
  MutationUpdateTaxClassArgs,
  UpdateTaxClassResponseOrError,
} from "../../../types";
import { updateTaxClassSchema } from "../../../utils/data-validation";
import {
  checkUserAuth,
  checkUserPermission,
  findTaxClassByValueToUpdate,
  getTaxClassById,
  updateTaxClass as updateTaxClassService,
} from "../../services";

/**
 * Handles updating tax class data (value, description) with proper validation and permission checks.
 *
 * Workflow:
 * 1. Authenticates user and verifies permission to update tax classes.
 * 2. Validates input (id, value, description) using Zod schema.
 * 3. Fetches current tax class data from Redis or DB.
 * 4. Checks if updated value conflicts with existing tax classes.
 * 5. Updates the tax class in the database.
 * 6. Updates Redis with new tax class info and value existence key.
 * 7. Returns the updated tax class or error if validation or update fails.
 *
 * @param _ - Unused parent parameter for GraphQL resolver.
 * @param args - Input arguments containing tax class ID and updated fields.
 * @param context - GraphQL context containing authenticated user information.
 * @returns A promise resolving to an UpdateTaxClassResponseOrError.
 */
export const updateTaxClass = async (
  _: any,
  args: MutationUpdateTaxClassArgs,
  { user }: Context
): Promise<UpdateTaxClassResponseOrError> => {
  try {
    // Check user authentication
    const authError = checkUserAuth(user);
    if (authError) return authError;

    // Permission check
    const hasPermission = await checkUserPermission({
      user,
      action: "canUpdate",
      entity: "tax settings",
    });

    if (!hasPermission) {
      return {
        statusCode: 403,
        success: false,
        message: "You do not have permission to update tax class(es)",
        __typename: "BaseResponse",
      };
    }

    // Validate input
    const result = await updateTaxClassSchema.safeParseAsync(args);
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

    // Get current tax class data from Redis or DB
    let currentTaxClass = await getTaxClassInfoByIdFromRedis(id);

    if (currentTaxClass?.deletedAt) {
      return {
        statusCode: 404,
        success: false,
        message: `Tax class not found with this id: ${id}, or it may have been deleted or moved to the trash`,
        __typename: "BaseResponse",
      };
    }

    if (!currentTaxClass) {
      currentTaxClass = await getTaxClassById(id); // fallback to DB
      if (!currentTaxClass) {
        return {
          statusCode: 404,
          success: false,
          message: `Tax class not found with this id: ${id}, or it may have been deleted or moved to the trash`,
          __typename: "BaseResponse",
        };
      }
    }

    // Check for duplicate value (if changed)
    if (value && value !== currentTaxClass.value) {
      let valueExists;

      valueExists = await getTaxClassValueExistFromRedis(value);

      if (!valueExists) {
        valueExists = await findTaxClassByValueToUpdate(id, value);
      }

      if (valueExists) {
        await setTaxClassValueExistInRedis(value);

        return {
          statusCode: 400,
          success: false,
          message: `Tax class value: "${value}" already exists`,
          __typename: "BaseResponse",
        };
      }
    }

    // Update the tax class in the database
    const updatedTaxClass = await updateTaxClassService(id, {
      value,
      description,
    });

    // Update Redis cache: remove old, add new
    await Promise.all([
      removeTaxClassInfoByIdFromRedis(id),
      removeTaxClassValueExistFromRedis(currentTaxClass.value),
      clearTaxClassesAndCountCache(),
      setTaxClassInfoByIdInRedis(id, updatedTaxClass),
      setTaxClassValueExistInRedis(updatedTaxClass.value),
    ]);

    return {
      statusCode: 200,
      success: true,
      message: "TaxClass updated successfully",
      taxClass: {
        id: updatedTaxClass.id,
        value: updatedTaxClass.value,
        description: updatedTaxClass.description,
        createdBy: updatedTaxClass.createdBy as any,
        createdAt: updatedTaxClass.createdAt.toISOString(),
        deletedAt:
          updatedTaxClass.deletedAt instanceof Date
            ? updatedTaxClass.deletedAt.toISOString()
            : updatedTaxClass.deletedAt,
      },
      __typename: "TaxClassResponse",
    };
  } catch (error: any) {
    console.error("Error updating tax class:", error);
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
