import CONFIG from "../../../config/config";
import { Context } from "../../../context";
import {
  CreateTaxOptionsResponseOrError,
  MutationUpdateTaxOptionsArgs,
} from "../../../types";
import { updatedTaxOptionsSchema } from "../../../utils/data-validation";
import {
  checkUserAuth,
  checkUserPermission,
  getTaxOptions,
  updateTaxOptions as updateTaxOptionsService,
} from "../../services";

/**
 * Handles the update of tax options.
 *
 * @param _ - Unused parent argument.
 * @param args - Arguments for updating tax options.
 * @param context - Context containing user information.
 * @returns Response indicating success or failure of the operation.
 */
export const updateTaxOptions = async (
  _: any,
  args: MutationUpdateTaxOptionsArgs,
  { user }: Context
): Promise<CreateTaxOptionsResponseOrError> => {
  try {
    // Verify user authentication
    const authError = checkUserAuth(user);
    if (authError) return authError;

    // Check if user has permission to update tax options
    const hasPermission = await checkUserPermission({
      user,
      action: "canUpdate",
      entity: "tax settings",
    });

    if (!hasPermission) {
      return {
        statusCode: 403,
        success: false,
        message: "You do not have permission to update tax options",
        __typename: "BaseResponse",
      };
    }

    // Validate input data with Zod schema
    const result = await updatedTaxOptionsSchema.safeParseAsync(args);

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

    const taxOptionsExists = await getTaxOptions();

    if (!taxOptionsExists) {
      return {
        statusCode: 400,
        success: false,
        message: "Tax options do not exist",
        __typename: "BaseResponse",
      };
    }

    // Update the tax options in the database
    const taxOptions = await updateTaxOptionsService(taxOptionsExists, args);

    return {
      statusCode: 200,
      success: true,
      message: "Tax options updated successfully",
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
    console.error("Error updating tax options:", error);
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
