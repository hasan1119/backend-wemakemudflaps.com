import CONFIG from "../../../config/config";
import { Context } from "../../../context";
import { clearShopAddressesCache } from "../../../helper/redis";
import {
  BaseResponseOrError,
  MutationDeleteShopAddressesArgs,
} from "../../../types";
import { idsSchema } from "../../../utils/data-validation";
import {
  checkUserAuth,
  checkUserPermission,
  deleteShopAddresses as deleteShopAddressesService,
} from "../../services";

/**
 * Mutation to delete a shop address by ID.
 *
 * @param _ - Unused parent argument.
 * @param args - Arguments containing the shop address ID.
 * @param context - Context containing user information.
 * @returns Response indicating success or failure.
 */
export const deleteShopAddresses = async (
  _: any,
  args: MutationDeleteShopAddressesArgs,
  { user }: Context
): Promise<BaseResponseOrError> => {
  try {
    // Check user authentication
    const authError = checkUserAuth(user);
    if (authError) return authError;

    // Check permission to delete
    const canDelete = await checkUserPermission({
      action: "canDelete",
      entity: "site_settings",
      user,
    });

    if (!canDelete) {
      return {
        statusCode: 403,
        success: false,
        message: "You do not have permission to delete shop addresses",
        __typename: "BaseResponse",
      };
    }

    // Validate input user ID with Zod schema
    const validationResult = await idsSchema.safeParseAsync(args);

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

    const { ids } = args;

    // Call service to delete shop addresses
    await deleteShopAddressesService(ids);

    // Clear the cache for shop addresses
    await clearShopAddressesCache();

    return {
      statusCode: 200,
      success: true,
      message: "Shop addresses deleted successfully",
      __typename: "BaseResponse",
    };
  } catch (error: any) {
    console.error("Error deleting shop addresses:", error);

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
