import CONFIG from "../../../config/config";
import { Context } from "../../../context";
import {
  GetShopForDefaultTaxResponseOrError,
  ShopAddress,
} from "../../../types";
import {
  checkUserAuth,
  checkUserPermission,
  getShopForDefaultTax as getShopForDefaultTaxService,
} from "./../../services";

/**
 * Handles the retrieval of shop addresses with pagination and search functionality.
 *
 * @param _ - Unused parent argument.
 * @param args - Arguments containing pagination and search parameters.
 * @param context - Context containing user information.
 * @returns Response containing shop addresses or an error message.
 */
export const getShopForDefaultTax = async (
  _: any,
  __: any,
  { user }: Context
): Promise<GetShopForDefaultTaxResponseOrError> => {
  try {
    // Verify user authentication
    const authError = checkUserAuth(user);
    if (authError) return authError;

    // Check if user has permission to read shop addresses
    const hasPermission = await checkUserPermission({
      user,
      action: "canRead",
      entity: "site_settings",
    });

    if (!hasPermission) {
      return {
        statusCode: 403,
        success: false,
        message: "You do not have permission to read shop addresses",
        __typename: "BaseResponse",
      };
    }

    const shopAddress = await getShopForDefaultTaxService();

    if (!shopAddress) {
      return {
        statusCode: 404,
        success: false,
        message: "Shop address not found",
        __typename: "BaseResponse",
      };
    }

    // Return the fetched data
    return {
      statusCode: 200,
      success: true,
      message: "Shop addresses fetched successfully",
      shopAddress: shopAddress as ShopAddress,
      __typename: "ShopAddressResponse",
    };
  } catch (error: any) {
    console.error("Error fetching shop addresses:", {
      message: error.message,
    });

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
