import CONFIG from "../../../config/config";
import { Context } from "../../../context";
import {
  clearShopAddressesCache,
  setShopAddressByIdInRedis,
} from "../../../helper/redis";
import {
  CreateOrUpdateShopAddressResponseOrError,
  MutationCreateOrUpdateShopAddressArgs,
  ShopAddress,
} from "../../../types";
import { siteSettingsSchema } from "../../../utils/data-validation";
import {
  checkUserAuth,
  checkUserPermission,
  createOrUpdateShopAddress as createOrUpdateShopAddressService,
} from "../../services";

/**
 * Mutation to create shop address.
 * Validates user authentication and permissions, validates input data,
 * and creates the shop address in the database.
 *
 * @param _ - Unused parent argument
 * @param args - Arguments containing shop address data
 * @param context - Context containing user information
 * @returns A response indicating success or failure of the operation
 */
export const createOrUpdateShopAddress = async (
  _: any,
  args: MutationCreateOrUpdateShopAddressArgs,
  { user }: Context
): Promise<CreateOrUpdateShopAddressResponseOrError> => {
  try {
    // Verify user authentication
    const authError = checkUserAuth(user);
    if (authError) return authError;

    // Validate input data with Zod schema
    const result = await siteSettingsSchema
      .innerType()
      .pick({ shopAddress: true })
      .shape.shopAddress.safeParseAsync(args.input);

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

    // Check if user has permission to create a site setting
    const hasPermission = await checkUserPermission({
      user,
      action: args.input.id ? "canUpdate" : "canCreate",
      entity: "site_settings",
    });

    if (!hasPermission) {
      return {
        statusCode: 403,
        success: false,
        message: `${
          args.input.id
            ? "You do not have permission to update shop addresses"
            : "You do not have permission to create shop addresses"
        }`,
        __typename: "BaseResponse",
      };
    }

    // Create the shop address
    const shopAddress = await createOrUpdateShopAddressService(
      result.data as any,
      user.id
    );

    // Return the updated/created address
    const updatedAddress = args.input.id
      ? shopAddress.shopAddresses.find((addr) => addr.id === args.input.id)
      : shopAddress.shopAddresses[shopAddress.shopAddresses.length - 1];

    // Clear the cache for shop addresses
    await Promise.all([
      setShopAddressByIdInRedis(
        updatedAddress.id,
        updatedAddress as ShopAddress
      ),
      clearShopAddressesCache(),
    ]);

    return {
      statusCode: 201,
      success: true,
      shopAddress: updatedAddress as ShopAddress,
      message: `${
        args.input.id
          ? "Shop Address updated successfully"
          : "Shop Address created successfully"
      }`,

      __typename: "ShopAddressResponse",
    };
  } catch (error: any) {
    console.error("Error creating shop address:", error);
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
