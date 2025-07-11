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
  checkUserPermission,
  getAddressBookById as getAddressBookByIdService,
} from "../../services";

/**
 * Handles retrieving a addressBook by of a user by, its ID with validation.
 *
 * Workflow:
 * 1. Verifies user authentication.
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

    const { id, userId } = args;

    // Validate input data with Zod schemas
    const [idsResult, userIDResult] = await Promise.all([
      idSchema.safeParseAsync({ id }),
      idSchema.safeParseAsync({ userId }),
    ]);

    if (!idsResult.success || !userIDResult.success) {
      const errors = [
        ...(idsResult.error?.errors || []),
        ...(userIDResult.error?.errors || []),
      ].map((e) => ({
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

    // Check permission if the user is fetching on behalf of someone else
    if (args.userId !== user.id) {
      const hasPermission = await checkUserPermission({
        user,
        action: "canRead",
        entity: "address book",
      });

      if (!hasPermission) {
        return {
          statusCode: 403,
          success: false,
          message:
            "You do not have permission to read address book for another user",
          __typename: "BaseResponse",
        };
      }
    }

    // Attempt to retrieve cached addressBook data from Redis
    let addressBookData = await getAddressBookInfoByIdFromRedis(id, userId);

    if (!addressBookData) {
      // On cache miss, fetch addressBook data from database
      const dbAddressBook = await getAddressBookByIdService(id, userId);

      if (!dbAddressBook) {
        return {
          statusCode: 404,
          success: false,
          message: `Address book not found with this id: ${id} in you log`,
          __typename: "BaseResponse",
        };
      }

      addressBookData = {
        ...dbAddressBook,
        type: dbAddressBook.type as any,
        createdAt:
          dbAddressBook.createdAt instanceof Date
            ? dbAddressBook.createdAt.toISOString()
            : dbAddressBook.createdAt,
        updatedAt:
          dbAddressBook.updatedAt instanceof Date
            ? dbAddressBook.updatedAt.toISOString()
            : dbAddressBook.updatedAt,
      };
      // Cache addressBook data in Redis
      await setAddressBookInfoByIdInRedis(id, userId, addressBookData);
    }

    return {
      statusCode: 200,
      success: true,
      message: "AddressBook fetched successfully",
      addressBook: addressBookData,
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
