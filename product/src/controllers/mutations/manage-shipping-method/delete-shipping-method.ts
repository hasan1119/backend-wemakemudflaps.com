import CONFIG from "../../../config/config";
import { Context } from "../../../context";
import {
  BaseResponseOrError,
  MutationDeleteShippingMethodArgs,
} from "../../../types";
import { idSchema } from "../../../utils/data-validation";
import {
  checkUserAuth,
  checkUserPermission,
  deleteShippingMethod as deleteShippingMethodService,
} from "../../services";

/**
 * Deletes an existing shipping method by its ID.
 *
 * Workflow:
 * 1. Validates user authentication and permissions.
 * 2. Validates input data against the Zod schema.
 * 3. Deletes the shipping method and returns a success message.
 *
 * @param _ - Unused parent argument.
 * @param args - Arguments containing the ID of the shipping method to delete.
 * @param context - GraphQL context containing the authenticated user.
 * @returns A response indicating success or failure of the operation.
 */
export const deleteShippingMethod = async (
  _: any,
  args: MutationDeleteShippingMethodArgs,
  { user }: Context
): Promise<BaseResponseOrError> => {
  try {
    // Verify user authentication
    const authResponse = checkUserAuth(user);
    if (authResponse) return authResponse;

    // Check if user has permission to delete shipping methods
    const hasPermission = await checkUserPermission({
      user,
      action: "canDelete",
      entity: "shipping settings",
    });

    if (!hasPermission) {
      return {
        statusCode: 403,
        success: false,
        message: "You do not have permission to delete shipping method(s)",
        __typename: "BaseResponse",
      };
    }

    // Return detailed validation errors if input is invalid
    const validationResult = await idSchema.safeParseAsync(args);
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

    // Attempt to delete the shipping method
    await deleteShippingMethodService(id);

    return {
      statusCode: 200,
      success: true,
      message: "Shipping method deleted successfully",
      __typename: "BaseResponse",
    };
  } catch (error) {
    console.error("Error deleting shipping method:", error);

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
