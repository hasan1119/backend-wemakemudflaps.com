import CONFIG from "../../../config/config";
import { Context } from "../../../context";
import {
  clearShippingClassesAndCountCache,
  getShippingClassInfoByIdFromRedis,
  getShippingClassValueExistFromRedis,
  removeShippingClassInfoByIdFromRedis,
  removeShippingClassValueExistFromRedis,
  setShippingClassInfoByIdInRedis,
  setShippingClassValueExistInRedis,
} from "../../../helper/redis";
import {
  MutationUpdateShippingClassArgs,
  UpdateShippingClassResponseOrError,
} from "../../../types";
import { updateShippingClassSchema } from "../../../utils/data-validation";
import {
  checkUserAuth,
  checkUserPermission,
  findShippingClassByValueToUpdate,
  getShippingClassById,
  updateShippingClass as updateShippingClassService,
} from "../../services";

/**
 * Handles updating shippingClass data (value, description) with proper validation and permission checks.
 *
 * Workflow:
 * 1. Authenticates user and verifies permission to update shipping classes.
 * 2. Validates input (id, value, description) using Zod schema.
 * 3. Fetches current shippingClass data from Redis or DB.
 * 4. Checks if updated value conflicts with existing shipping classes.
 * 5. Updates the shipping class in the database.
 * 6. Updates Redis with new shipping class info and value existence key.
 * 7. Returns the updated shipping class or error if validation or update fails.
 *
 * @param _ - Unused parent parameter for GraphQL resolver.
 * @param args - Input arguments containing shipping class ID and updated fields.
 * @param context - GraphQL context containing authenticated user information.
 * @returns A promise resolving to an UpdateShippingClassResponseOrError.
 */
export const updateShippingClass = async (
  _: any,
  args: MutationUpdateShippingClassArgs,
  { user }: Context
): Promise<UpdateShippingClassResponseOrError> => {
  try {
    // Check user authentication
    const authError = checkUserAuth(user);
    if (authError) return authError;

    // Permission check
    const hasPermission = await checkUserPermission({
      user,
      action: "canUpdate",
      entity: "shipping settings",
    });

    if (!hasPermission) {
      return {
        statusCode: 403,
        success: false,
        message: "You do not have permission to update shipping class(es)",
        __typename: "BaseResponse",
      };
    }

    // Validate input
    const result = await updateShippingClassSchema.safeParseAsync(args);
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

    // Get current shippingClass data from Redis or DB
    let currentShippingClass = await getShippingClassInfoByIdFromRedis(id);

    if (currentShippingClass?.deletedAt) {
      return {
        statusCode: 404,
        success: false,
        message: `Shipping class not found with this id: ${id}, or it may have been deleted or moved to the trash`,
        __typename: "BaseResponse",
      };
    }

    if (!currentShippingClass) {
      currentShippingClass = await getShippingClassById(id); // fallback to DB
      if (!currentShippingClass) {
        return {
          statusCode: 404,
          success: false,
          message: `Shipping class not found with this id: ${id}, or it may have been deleted or moved to the trash`,
          __typename: "BaseResponse",
        };
      }
    }

    // Check for duplicate value (if changed)
    if (value && value !== currentShippingClass.value) {
      let valueExists;

      valueExists = await getShippingClassValueExistFromRedis(value);

      if (!valueExists) {
        valueExists = await findShippingClassByValueToUpdate(id, value);
      }

      if (valueExists) {
        await setShippingClassValueExistInRedis(value);

        return {
          statusCode: 400,
          success: false,
          message: `Shipping class value: "${value}" already exists`,
          __typename: "BaseResponse",
        };
      }
    }

    // Update the shippingClass in the database
    const updatedShippingClass = await updateShippingClassService(id, {
      value,
      description,
    });

    // Update Redis cache: remove old, add new
    await Promise.all([
      removeShippingClassInfoByIdFromRedis(id),
      removeShippingClassValueExistFromRedis(currentShippingClass.value),
      clearShippingClassesAndCountCache(),
      setShippingClassInfoByIdInRedis(id, updatedShippingClass),
      setShippingClassValueExistInRedis(updatedShippingClass.value),
    ]);

    return {
      statusCode: 200,
      success: true,
      message: "ShippingClass updated successfully",
      shippingClass: {
        id: updatedShippingClass.id,
        value: updatedShippingClass.value,
        description: updatedShippingClass.description,
        createdBy: updatedShippingClass.createdBy as any,
        createdAt: updatedShippingClass.createdAt.toISOString(),
        deletedAt:
          updatedShippingClass.deletedAt instanceof Date
            ? updatedShippingClass.deletedAt.toISOString()
            : updatedShippingClass.deletedAt,
      },
      __typename: "ShippingClassResponse",
    };
  } catch (error: any) {
    console.error("Error updating shipping class:", error);
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
