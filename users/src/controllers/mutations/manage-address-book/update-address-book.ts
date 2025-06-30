import CONFIG from "../../../config/config";
import { Context } from "../../../context";
import {
  getAddressBookInfoByIdFromRedis,
  setAddressBookInfoByIdInRedis,
} from "../../../helper/redis";
import {
  MutationUpdateAddressBookEntryArgs,
  UpdateAddressBookResponseOrError,
} from "../../../types";
import { updateAddressBookEntrySchema } from "../../../utils/data-validation";
import {
  checkUserAuth,
  getAddressBookById,
  updateAddressBookEntry as updateAddressBookEntryService,
} from "../../services";

/**
 * Handles the update of an address book entry for a user.
 *
 * Workflow:
 * 1. Verifies user authentication.
 * 2. Validates input (id, city, county, houseNo, isDefault, state, street, type, zip) using Zod schema.
 * 3. Handles isDefault logic (unset others if new one is default).
 * 4. Updates the entry in DB and cache.
 * 5. Returns a structured success or error response.
 */
export const updateAddressBookEntry = async (
  _: any,
  args: MutationUpdateAddressBookEntryArgs,
  { user }: Context
): Promise<UpdateAddressBookResponseOrError> => {
  try {
    const authError = checkUserAuth(user);
    if (authError) return authError;

    const result = await updateAddressBookEntrySchema.safeParseAsync(args);
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

    const { id, city, county, houseNo, isDefault, state, street, type, zip } =
      result.data;

    // Attempt to retrieve cached addressBook data from Redis
    let addressBookData;

    addressBookData = await getAddressBookInfoByIdFromRedis(id);

    if (!addressBookData) {
      // On cache miss, fetch addressBook data from database
      addressBookData = await getAddressBookById(id);

      if (!addressBookData) {
        return {
          statusCode: 404,
          success: false,
          message: `Address book not found with this id: ${id}, or it may have been deleted or moved to the trash.`,
          __typename: "BaseResponse",
        };
      }

      // Cache addressBook data in Redis
      await setAddressBookInfoByIdInRedis(addressBookData.id, addressBookData);
    }

    const resultEntity = await updateAddressBookEntryService(
      id,
      {
        id,
        city,
        county,
        houseNo,
        isDefault,
        state,
        street,
        type: type as any,
        zip,
      },
      user.id
    );

    return {
      statusCode: 200,
      success: true,
      message: "Address updated successfully",
      addressBook: {
        id: resultEntity.id,
        city: resultEntity.city,
        county: resultEntity.county,
        houseNo: resultEntity.houseNo,
        isDefault: resultEntity.isDefault,
        state: resultEntity.state,
        street: resultEntity.street,
        zip: resultEntity.zip,
        type: resultEntity.type as any,
        createdAt:
          resultEntity.createdAt instanceof Date
            ? resultEntity.createdAt.toISOString()
            : resultEntity.createdAt,
        updatedAt:
          resultEntity.updatedAt instanceof Date
            ? resultEntity.updatedAt.toISOString()
            : resultEntity.updatedAt,
      },
      __typename: "AddressResponseBook",
    };
  } catch (error: any) {
    console.error("Error updating address:", error);
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
