import { z } from "zod";
import CONFIG from "../../../config/config";
import { Context } from "../../../context";
import {
  DeleteAddressesBookResponseOrError,
  MutationDeleteAddressBookEntryArgs,
} from "../../../types";
import {
  checkUserAuth,
  checkUserPermission,
  deleteAddressBook,
} from "../../services";
import { idSchema } from "./../../../utils/data-validation/common/common";

/**
 * Handles the deletion of an address book entry for a user.
 *
 * Workflow:
 * 1. Verifies user authentication.
 * 2. Checks if the user has permission to delete the address book entry.
 * 3. Deletes the entry.
 * 4. Removes the cache for the deleted entry.
 * 5. If the deleted entry was the default, it sets another entry of the same type as the default.
 * 6. Updates the Redis cache accordingly.
 * 7. Returns a structured success or error response.
 */
export const deleteAddressBookEntry = async (
  _: any,
  args: MutationDeleteAddressBookEntryArgs,
  { user }: Context
): Promise<DeleteAddressesBookResponseOrError> => {
  try {
    const authError = checkUserAuth(user);
    if (authError) return authError;

    const deleteAddressBookSchema = z.object({
      id: idSchema,
      userId: idSchema,
    });

    const validationResult = await deleteAddressBookSchema.safeParseAsync(args);

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

    if (args.userId !== user.id) {
      const hasPermission = await checkUserPermission({
        user,
        action: "canDelete",
        entity: "address book",
      });

      if (!hasPermission) {
        return {
          statusCode: 403,
          success: false,
          message:
            "You do not have permission to delete an address book for another user",
          __typename: "BaseResponse",
        };
      }
    }

    const { id } = args;

    const result = await deleteAddressBook(id);

    return {
      statusCode: 200,
      success: true,
      message: "Address book entry deleted successfully",
      newDefaultAddressId: result,
      __typename: "DeleteAddressResponseBook",
    };
  } catch (error: any) {
    console.error("Error deleting address book entry:", error);
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
