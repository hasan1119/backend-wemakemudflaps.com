import CONFIG from "../../../config/config";
import { Context } from "../../../context";
import { getAddressBookInfoByIdFromRedis } from "../../../helper/redis";
import {
  MutationUpdateAddressBookEntryArgs,
  UpdateAddressBookResponseOrError,
} from "../../../types";
import { updateAddressBookEntrySchema } from "../../../utils/data-validation";
import {
  checkUserAuth,
  checkUserPermission,
  getAddressBookById,
  updateAddressBookEntry as updateAddressBookEntryService,
} from "../../services";

/**
 * Handles the update of an address book entry for a user.
 *
 * Workflow:
 * 1. Verifies user authentication.
 * 2. Validates input (id, city, country, houseNo, isDefault, state, street, type, zip) using Zod schema.
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

    const {
      id,
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

    // Check permission if the user is creating on behalf of someone else
    if (args.userId !== user.id) {
      const hasPermission = await checkUserPermission({
        user,
        action: "canUpdate",
        entity: "address book",
      });

      if (!hasPermission) {
        return {
          statusCode: 403,
          success: false,
          message:
            "You do not have permission to update address book for another user",
          __typename: "BaseResponse",
        };
      }
    }

    // Attempt to retrieve cached addressBook data from Redis
    let addressBookData;

    addressBookData = await getAddressBookInfoByIdFromRedis(id, userId);

    if (!addressBookData) {
      // On cache miss, fetch addressBook data from database
      addressBookData = await getAddressBookById(id, userId);

      if (!addressBookData) {
        return {
          statusCode: 404,
          success: false,
          message: `Address book not found with this id: ${id} in you log`,
          __typename: "BaseResponse",
        };
      }
    }

    const resultEntity = await updateAddressBookEntryService(id, {
      id,
      city,
      country,
      company,
      streetOne,
      isDefault,
      state,
      streetTwo,
      type: type as any,
      zip,
      userId,
    });

    return {
      statusCode: 200,
      success: true,
      message: "Address updated successfully",
      addressBook: {
        id: resultEntity.id,
        city: resultEntity.city,
        country: resultEntity.country,
        isDefault: resultEntity.isDefault,
        state: resultEntity.state,
        company: resultEntity.company,
        streetOne: resultEntity.streetOne,
        streetTwo: resultEntity.streetTwo,
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
