import CONFIG from "../../../config/config";
import { Context } from "../../../context";
import {
  CreateShippingMethodResponseOrError,
  MutationCreateShippingMethodArgs,
} from "../../../types";
import { createShippingMethodSchema } from "../../../utils/data-validation";
import {
  checkUserAuth,
  checkUserPermission,
  createShippingMethod as createShippingMethodService,
} from "../../services";

/**
 * Handles the creation of a new shipping method.
 *
 * @param _ - Unused parent argument (for GraphQL resolver compatibility).
 * @param args - Arguments for creating a shipping method.
 * @param context - Context containing user information.
 * @returns A promise resolving to the response or error object.
 */
export const createShippingMethod = async (
  _: any,
  args: MutationCreateShippingMethodArgs,
  { user }: Context
): Promise<CreateShippingMethodResponseOrError> => {
  try {
    // Verify user authentication
    const authError = checkUserAuth(user);
    if (authError) return authError;

    // Check if user has permission to create a shipping method
    const hasPermission = await checkUserPermission({
      user,
      action: "canCreate",
      entity: "shipping settings",
    });

    if (!hasPermission) {
      return {
        statusCode: 403,
        success: false,
        message: "You do not have permission to create shipping method(s)",
        __typename: "BaseResponse",
      };
    }

    // Validate input data with Zod schema
    const result = await createShippingMethodSchema.safeParseAsync(args);

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

    const { title, status, description } = result.data;

    // Create the shipping method using the service
    const shippingMethod = await createShippingMethodService(
      {
        title,
        status,
        description,
      },
      user.id
    );

    return {
      statusCode: 201,
      success: true,
      message: "Shipping method created successfully",
      shippingMethod: {
        id: shippingMethod.id,
        title: shippingMethod.title,
        status: shippingMethod.status,
        description: shippingMethod.description,
        createdBy: shippingMethod.createdBy as any,
        createdAt:
          shippingMethod.createdAt instanceof Date
            ? shippingMethod.createdAt.toISOString()
            : shippingMethod.createdAt,
        deletedAt:
          shippingMethod.deletedAt instanceof Date
            ? shippingMethod.deletedAt.toISOString()
            : shippingMethod.deletedAt,
      },
      __typename: "ShippingMethodResponse",
    };
  } catch (error) {
    console.error("Error creating shipping method:", error);
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
