import CONFIG from "../../../config/config";
import { Context } from "../../../context";
import {
  getAddressBookInfoByIdFromRedis,
  setAddressBookInfoByIdInRedis,
} from "../../../helper/redis";
import {
  GetAddressBookByIdResponseOrError,
  QueryGetAddressBookEntryByIdArgs,
} from "../../../types";
import { idSchema } from "../../../utils/data-validation";
import {
  checkUserAuth,
  getAddressBookById as getAddressBookByIdService,
} from "../../services";

/**
 * Handles retrieving a addressBook by its ID with validation and permission checks.
 *
 * Workflow:
 * 1. Verifies user authentication and checks permission to view addressBooks.
 * 2. Validates input addressBook ID using Zod schema.
 * 3. Attempts to retrieve addressBook data from Redis for performance optimization.
 * 4. Fetches addressBook data from the database if not found in Redis and caches it.
 * 5. Returns a success response with addressBook data or an error if validation, permission, or retrieval fails.
 *
 * @param _ - Unused parent parameter for GraphQL resolver.
 * @param args - Input arguments containing the addressBook ID.
 * @param context - GraphQL context containing authenticated user information.
 * @returns A promise resolving to a GetAddressBookByIDResponseOrError object containing status, message, addressBook data, and errors if applicable.
 */
export const getAddressBookEntryById = async (
  _: any,
  args: QueryGetAddressBookEntryByIdArgs,
  { user }: Context
): Promise<GetAddressBookByIdResponseOrError> => {
  try {
    // Verify user authentication
    const authResponse = checkUserAuth(user);
    if (authResponse) return authResponse;

    // Validate input addressBook ID with Zod schema
    const validationResult = await idSchema.safeParseAsync(args);

    if (!validationResult.success) {
      const errorMessages = validationResult.error.errors.map((error) => ({
        field: error.path.join("."),
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

    // Attempt to retrieve cached addressBook data from Redis
    let addressBookData = await getAddressBookInfoByIdFromRedis(id);

    // Check ownership
    if ((addressBookData.user as any).id !== user.id) {
      return {
        statusCode: 403,
        success: false,
        message: "Unauthorized to access this address book entry",
        __typename: "ErrorResponse",
      };
    }

    if (!addressBookData) {
      // On cache miss, fetch addressBook data from database
      const dbAddressBook = await getAddressBookByIdService(id, user.id);

      if (!dbAddressBook) {
        return {
          statusCode: 404,
          success: false,
          message: `AddressBook not found with this id: ${id}, or it may have been deleted or moved to the trash`,
          __typename: "BaseResponse",
        };
      }

      // Cache addressBook data in Redis
      await setAddressBookInfoByIdInRedis(id, dbAddressBook);
      addressBookData = dbAddressBook;
    }

    return {
      statusCode: 200,
      success: true,
      message: "AddressBook fetched successfully",
      addressBook: {
        id: addressBookData.id,
        city: addressBookData.city,
        isDefault: addressBookData.isDefault,
        state: addressBookData.state,
        type: addressBookData.type as any,
        zip: addressBookData.zip,
        houseNo: addressBookData.houseNo,
        county: addressBookData.county,
        street: addressBookData.street,
        createdAt:
          addressBookData.createdAt instanceof Date
            ? addressBookData.createdAt.toISOString()
            : addressBookData.createdAt,
        updatedAt:
          addressBookData.updatedAt instanceof Date
            ? addressBookData.updatedAt.toISOString()
            : addressBookData.updatedAt,
      },
      __typename: "AddressResponseBook",
    };
  } catch (error: any) {
    console.error("Error retrieving address book:", {
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
