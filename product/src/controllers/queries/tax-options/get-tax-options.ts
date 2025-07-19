import CONFIG from "../../../config/config";
import { Context } from "../../../context";
import { GetTaxOptionsResponseOrError } from "../../../types";
import {
  checkUserAuth,
  checkUserPermission,
  getTaxOptions as getTaxOptionsService,
} from "../../services";

/**
 * Handles the retrieval of tax options.
 *
 * @param _ - Unused parent argument.
 * @param __ - Unused arguments.
 * @param context - Context containing user information.
 * @returns Response containing tax options or an error message.
 */
export const getTaxOptions = async (
  _: any,
  __: any,
  { user }: Context
): Promise<GetTaxOptionsResponseOrError> => {
  try {
    // Verify user authentication
    const authResponse = checkUserAuth(user);
    if (authResponse) return authResponse;

    // Check if user has permission to view tax settings
    const canRead = await checkUserPermission({
      action: "canRead",
      entity: "tax settings",
      user,
    });

    if (!canRead) {
      return {
        statusCode: 403,
        success: false,
        message: "You do not have permission to view tax settings info",
        __typename: "BaseResponse",
      };
    }

    const taxOptions = await getTaxOptionsService();

    if (!taxOptions) {
      return {
        statusCode: 404,
        success: false,
        message: "Tax options not found",
        __typename: "BaseResponse",
      };
    }

    return {
      statusCode: 200,
      success: true,
      message: "Tax options fetched successfully",
      taxOptions: {
        id: taxOptions.id,
        priceDisplaySuffix: taxOptions.priceDisplaySuffix,
        roundTaxAtSubtotalLevel: taxOptions.roundTaxAtSubtotalLevel,
        pricesEnteredWithTax: taxOptions.pricesEnteredWithTax,
        shippingTaxClass: taxOptions.shippingTaxClass
          ? {
              ...taxOptions.shippingTaxClass,
              createdBy: taxOptions.shippingTaxClass.createdBy as any,
              createdAt:
                taxOptions.shippingTaxClass.createdAt instanceof Date
                  ? taxOptions.shippingTaxClass.createdAt.toISOString()
                  : taxOptions.shippingTaxClass.createdAt,
              deletedAt:
                taxOptions.shippingTaxClass.deletedAt instanceof Date
                  ? taxOptions.shippingTaxClass.deletedAt.toISOString()
                  : taxOptions.shippingTaxClass.deletedAt,
            }
          : null,
        createdBy: taxOptions.createdBy as any,
        createdAt:
          taxOptions.createdAt instanceof Date
            ? taxOptions.createdAt.toISOString()
            : taxOptions.createdAt,
        updatedAt:
          taxOptions.updatedAt instanceof Date
            ? taxOptions.updatedAt.toISOString()
            : taxOptions.updatedAt,
        calculateTaxBasedOn: taxOptions.calculateTaxBasedOn,
        displayPricesDuringCartAndCheckout:
          taxOptions.displayPricesDuringCartAndCheckout,
        displayPricesInShop: taxOptions.displayPricesInShop,
        displayTaxTotals: taxOptions.displayTaxTotals,
      },
      __typename: "TaxOptionsResponse",
    };
  } catch (error: any) {
    console.error("Error fetching tax options:", {
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
