import CONFIG from "../../../config/config";
import { Context } from "../../../context";
import {
  CreateTaxOptionsResponseOrError,
  MutationCreateTaxOptionsArgs,
} from "../../../types";
import { createdTaxOptionsSchema } from "../../../utils/data-validation";
import {
  checkUserAuth,
  checkUserPermission,
  createTaxOptions as createTaxOptionsService,
  getTaxOptions,
} from "../../services";

/**
 * Handles the creation of tax options.
 *
 * @param _ - Unused parent argument.
 * @param args - Arguments for creating tax options.
 * @param context - Context containing user information.
 * @returns Response indicating success or failure of the operation.
 */
export const createTaxOptions = async (
  _: any,
  args: MutationCreateTaxOptionsArgs,
  { user }: Context
): Promise<CreateTaxOptionsResponseOrError> => {
  try {
    // Verify user authentication
    const authError = checkUserAuth(user);
    if (authError) return authError;

    // Check if user has permission to create tax options
    const hasPermission = await checkUserPermission({
      user,
      action: "canCreate",
      entity: "tax settings",
    });

    if (!hasPermission) {
      return {
        statusCode: 403,
        success: false,
        message: "You do not have permission to create tax options",
        __typename: "BaseResponse",
      };
    }

    // Validate input data with Zod schema
    const result = await createdTaxOptionsSchema.safeParseAsync(args);

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

    if (taxOptionsExists) {
      return {
        statusCode: 400,
        success: false,
        message: "Tax options already exist",
        __typename: "BaseResponse",
      };
    }

    // Create the tax options in the database
    const taxOptions = await createTaxOptionsService(user.id, args);

    return {
      statusCode: 201,
      success: true,
      message: "Tax options created successfully",
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
    console.error("Error creating brand:", error);
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
