import CONFIG from "../../../config/config";
import { Context } from "../../../context";
import {
  CreateAddressBookResponseOrError,
  MutationCreateAddressBookEntryArgs,
} from "../../../types";
import { createAddressBookEntrySchema } from "../../../utils/data-validation";
import {
  checkUserAuth,
  checkUserPermission,
  createAddressBookEntry as createAddressBookEntryService,
} from "../../services";

/**
 * Handles the creation of a new address book entry for a user.
 *
 * Workflow:
 * 1. Verifies user authentication.
 * 2. Validates input (city, country, houseNo, isDefault, state, street, type, zip) using Zod schema.
 * 3. Creates the address book entry in the database with audit information from the authenticated user.
 * 4. Caches the new address book entry in Redis for future requests.
 * 5. Returns a success response or error if validation, permission, or creation fails.
 *
 * @param _ - Unused parent parameter for GraphQL resolver.
 * @param args - Input arguments containing address book entry fields.
 * @param context - GraphQL context containing authenticated user information.
 * @returns A promise resolving to a CreateAddressBookResponseOrError object containing status, message, and errors if applicable.
 */
export const createAddressBookEntry = async (
  _: any,
  args: MutationCreateAddressBookEntryArgs,
  { user }: Context
): Promise<CreateAddressBookResponseOrError> => {
  try {
    // Verify user authentication
    const authError = checkUserAuth(user);
    if (authError) return authError;

    // Validate input data with Zod schema
    const result = await createAddressBookEntrySchema.safeParseAsync(args);

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

    // Check permission if the user is creating on behalf of someone else
    if (args.userId !== user.id) {
      const hasPermission = await checkUserPermission({
        user,
        action: "canCreate",
        entity: "address_book",
      });

      if (!hasPermission) {
        return {
          statusCode: 403,
          success: false,
          message:
            "You do not have permission to create address book for another user",
          __typename: "BaseResponse",
        };
      }
    }

    const {
      city,
      country,
      company,
      isDefault,
      state,
      streetOne,
      streetTwo,
      type,
      zip,
      userId,
    } = result.data;

    // Ensure type is cast to the correct AddressType from types
    const addressEntry = await createAddressBookEntryService({
      company,
      streetOne,
      streetTwo,
      city,
      country,
      isDefault,
      state,
      type: type as any,
      zip,
      userId,
    });

    return {
      statusCode: 201,
      success: true,
      message: "Address added successfully",
      addressBook: {
        id: addressEntry.id,
        city: addressEntry.city,
        country: addressEntry.country,
        isDefault: addressEntry.isDefault,
        state: addressEntry.state,
        company: addressEntry.company,
        streetOne: addressEntry.streetOne,
        streetTwo: addressEntry.streetTwo,
        zip: addressEntry.zip,
        type: addressEntry.type as any,
        createdAt:
          addressEntry.createdAt instanceof Date
            ? addressEntry.createdAt.toISOString()
            : addressEntry.createdAt,
        updatedAt:
          addressEntry.updatedAt instanceof Date
            ? addressEntry.updatedAt.toISOString()
            : addressEntry.updatedAt,
      },
      __typename: "AddressResponseBook",
    };
  } catch (error: any) {
    console.error("Error creating address book:", error);
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
