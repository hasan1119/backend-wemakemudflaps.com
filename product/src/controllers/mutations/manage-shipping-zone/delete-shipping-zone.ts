import CONFIG from "../../../config/config";
import { Context } from "../../../context";
import {
  BaseResponseOrError,
  MutationDeleteShippingZoneArgs,
} from "../../../types";
import { idSchema } from "../../../utils/data-validation";
import {
  checkUserAuth,
  checkUserPermission,
  deleteShippingZone as deleteShippingZoneService,
} from "../../services";

/**
 * Deletes an existing shipping zone by its ID.
 *
 * Workflow:
 * 1. Validates user authentication and permissions.
 * 2. Validates input data against the Zod schema.
 * 3. Deletes the shipping zone and returns a success message.
 *
 * @param _ - Unused parent argument.
 * @param args - Arguments containing the ID of the shipping zone to delete.
 * @param user - The authenticated user context.
 * @returns A response indicating success or failure of the operation.
 */
export const deleteShippingZone = async (
  _: any,
  args: MutationDeleteShippingZoneArgs,
  { user }: Context
): Promise<BaseResponseOrError> => {
  try {
    // Verify user authentication
    const authResponse = checkUserAuth(user);
    if (authResponse) return authResponse;

    // Check if user has permission to delete shipping zones
    const canDelete = await checkUserPermission({
      action: "canDelete",
      entity: "shipping settings",
      user,
    });

    if (!canDelete) {
      return {
        statusCode: 403,
        success: false,
        message: "You do not have permission to delete shipping zone(s)",
        __typename: "BaseResponse",
      };
    }

    // Validate input user ID with Zod schema
    const validationResult = await idSchema.safeParseAsync(args);

    // Return detailed validation errors if input is invalid
    if (!validationResult.success) {
      const errorMessages = validationResult.error.errors.map((error) => ({
        field: error.path.join("."), // Join path array to string for field identification
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

    // Attempt to delete the shipping zone
    await deleteShippingZoneService(id);

    return {
      statusCode: 200,
      success: true,
      message: "Shipping zone deleted successfully",
      __typename: "BaseResponse",
    };
  } catch (error) {
    console.error("Error deleting shipping zone:", error);

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
