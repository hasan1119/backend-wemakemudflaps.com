import CONFIG from "../../../config/config";
import { Context } from "../../../context";
import {
  DeleteAddressesBookResponseOrError,
  MutationDeleteAddressBookEntryArgs,
} from "../../../types";
import { idsSchema } from "../../../utils/data-validation";
import {
  checkUserAuth,
  checkUserPermission,
  hardDeleteAddressBook,
} from "../../services";

/**
 * Handles the deletion of an address book entry for a user.
 *
 * Workflow:
 * 1. Verifies user authentication.
 * 2. Checks if address book entry exists and belongs to the user.
 * 3. Deletes the entry.
 * 4. Removes cache for deleted entry.
 * 5. If deleted entry was default, sets another entry of the same type as default.
 * 6. Updates Redis cache accordingly.
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

    // Validate input brand ID with Zod schema
    const validationResult = await idsSchema.safeParseAsync(args.ids);

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

    // Check permission if the user is updating on behalf of someone else
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
            "You do not have permission to delete address book for another user",
          __typename: "BaseResponse",
        };
      }
    }

    const { ids } = args;

    // Delete entry using service
    const result = await hardDeleteAddressBook(ids);

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
