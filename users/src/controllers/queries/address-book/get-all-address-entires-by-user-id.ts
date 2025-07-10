import CONFIG from "../../../config/config";
import { Context } from "../../../context";
import {
  getAllAddressBookByUserIdFromRedis,
  setAllAddressBookByUserIdInRedis,
} from "../../../helper/redis";
import {
  GetAddressesBookResponseOrError,
  QueryGetAddressEntiresArgs,
} from "../../../types";
import { getAddressBookSchema } from "../../../utils/data-validation";
import {
  checkUserAuth,
  checkUserPermission,
  getAddressBooks,
} from "../../services";

/**
 * Handles fetching all address book entries of a specific type for an authenticated user.
 *
 * Workflow:
 * 1. Verifies user authentication.
 * 2. Attempts to fetch address book list from Redis cache.
 * 3. On cache miss, queries from the database and sets the result in Redis.
 * 4. Filters by address type if provided.
 * 5. Returns all matched address book entries or error if unauthorized or failed.
 *
 * @param _ - Unused GraphQL resolver parent parameter.
 * @param args - Contains address type (optional).
 * @param context - Contains authenticated user data.
 * @returns A response with address book list or error.
 */
export const getAddressEntires = async (
  _: any,
  args: QueryGetAddressEntiresArgs,
  { user }: Context
): Promise<GetAddressesBookResponseOrError> => {
  try {
    // Verify user authentication
    const authResponse = checkUserAuth(user);
    if (authResponse) return authResponse;

    // Validate input addressBook ID with Zod schema
    const validationResult = await getAddressBookSchema.safeParseAsync(args);

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

    const { type, userId } = args;

    // Attempt to retrieve cached addressBook data from Redis
    let addressBookList = await getAllAddressBookByUserIdFromRedis(
      type,
      userId
    );

    // On cache miss, fetch addressBook data from database
    if (!addressBookList) {
      const dbAddresses = await getAddressBooks(userId, type);

      addressBookList = dbAddresses.map((entry) => ({
        ...entry,
        type: entry.type as any,
        createdAt:
          entry.createdAt instanceof Date
            ? entry.createdAt.toISOString()
            : entry.createdAt,
        updatedAt:
          entry.updatedAt instanceof Date
            ? entry.updatedAt.toISOString()
            : entry.updatedAt,
      }));

      // Cache in Redis
      await setAllAddressBookByUserIdInRedis(type, userId, addressBookList);
    }

    // Step 5: Return formatted response
    return {
      statusCode: 200,
      success: true,
      message: "Address book entries fetched successfully",
      addressBook: addressBookList,
      __typename: "AddressesBookResponse",
    };
  } catch (error: any) {
    console.error("Error fetching address book entries:", {
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
