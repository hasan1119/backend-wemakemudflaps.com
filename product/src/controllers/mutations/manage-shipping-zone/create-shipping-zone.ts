import CONFIG from "../../../config/config";
import { Context } from "../../../context";
import {
  CreateShippingZoneResponseOrError,
  MutationCreateShippingZoneArgs,
} from "../../../types";
import { createShippingZoneSchema } from "../../../utils/data-validation";
import {
  checkUserAuth,
  checkUserPermission,
  createShippingZone as createShippingZoneService,
} from "../../services";

export const createShippingZone = async (
  _: any,
  args: MutationCreateShippingZoneArgs,
  { user }: Context
): Promise<CreateShippingZoneResponseOrError> => {
  try {
    // Verify user authentication
    const authError = checkUserAuth(user);
    if (authError) return authError;

    // Check if user has permission to create a shipping class
    const hasPermission = await checkUserPermission({
      user,
      action: "canCreate",
      entity: "shipping settings",
    });

    if (!hasPermission) {
      return {
        statusCode: 403,
        success: false,
        message: "You do not have permission to create shipping zone(s)",
        __typename: "BaseResponse",
      };
    }

    // Validate input data with Zod schema
    const result = await createShippingZoneSchema.safeParseAsync(args);

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

    const { name, regions, zipCodes } = result.data;

    console.log(result.data);

    // Create the shipping zone in the database
    const shippingZone = await createShippingZoneService(
      {
        name,
        regions,
        zipCodes,
      },
      user.id
    );

    return {
      statusCode: 201,
      success: true,
      message: "Shipping zone created successfully",
      shippingZone: {
        id: shippingZone.id,
        name: shippingZone.name,
        regions: shippingZone.regions,
        zipCodes: shippingZone.zipCodes,
        createdBy: shippingZone.createdBy as any,
        createdAt:
          shippingZone.createdAt instanceof Date
            ? shippingZone.createdAt.toISOString()
            : shippingZone.createdAt,
        deletedAt:
          shippingZone.deletedAt instanceof Date
            ? shippingZone.deletedAt.toISOString()
            : shippingZone.deletedAt,
      },
      __typename: "ShippingZoneResponse",
    };
  } catch (error: any) {
    console.error("Error creating shipping zone:", error);
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
