import CONFIG from "../../../config/config";
import { Context } from "../../../context";
import {
  getAllAddressBooksFromRedis,
  setAllAddressBookByUserIdInRedis,
} from "../../../helper/redis";
import {
  GetAddressesBookResponseOrError,
  QueryGetAllMyAddressEntiresArgs,
} from "../../../types";
import { checkUserAuth, getAddressBooks } from "../../services";

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
export const getAllMyAddressEntires = async (
  _: any,
  args: QueryGetAllMyAddressEntiresArgs,
  { user }: Context
): Promise<GetAddressesBookResponseOrError> => {
  try {
    // Step 1: Check authentication
    const authResponse = checkUserAuth(user);
    if (authResponse) return authResponse;

    const { type } = args;

    // Step 2: Try to fetch from Redis cache
    let addressBookList = await getAllAddressBooksFromRedis(user.id);

    // Step 3: If Redis cache miss, fetch from DB
    if (!addressBookList) {
      const dbAddresses = await getAddressBooks(user.id, type);

      // Cache in Redis
      await setAllAddressBookByUserIdInRedis(user.id, dbAddresses);
      addressBookList = dbAddresses;
    }

    // Step 5: Return formatted response
    return {
      statusCode: 200,
      success: true,
      message: "Address book entries fetched successfully",
      addressBook: addressBookList.map((entry) => ({
        id: entry.id,
        houseNo: entry.houseNo,
        street: entry.street,
        city: entry.city,
        state: entry.state,
        zip: entry.zip,
        county: entry.county,
        isDefault: entry.isDefault,
        type: entry.type as any,
        createdAt:
          entry.createdAt instanceof Date
            ? entry.createdAt.toISOString()
            : entry.createdAt,
        updatedAt:
          entry.updatedAt instanceof Date
            ? entry.updatedAt.toISOString()
            : entry.updatedAt,
      })),
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
