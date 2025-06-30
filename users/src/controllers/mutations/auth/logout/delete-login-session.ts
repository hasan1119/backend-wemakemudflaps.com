import CONFIG from "../../../../config/config";
import {
  BaseResponseOrError,
  MutationDeleteLoginSessionArgs,
} from "../../../../types";
import { idsSchema } from "../../../../utils/data-validation";
import {
  checkUserAuth,
  deleteUserLoginInfoSessionsByIds,
} from "../../../services";

/**
 * Handles the deletion of a user's login session.
 *
 * Workflow:
 * 1. Checks if the user is authenticated using `checkUserAuth`.
 * 2. If authenticated, deletes the user's login session by session ID.
 * 3. Returns a response indicating success or an error message.
 *
 * @param _ - Unused parameter (parent).
 * @param args - Arguments containing the session ID to delete.
 * @param context - The context containing the authenticated user.
 * @returns A response object with status code, success flag, and message.
 */
export const deleteLoginSession = async (
  _,
  { sessionIds }: MutationDeleteLoginSessionArgs,
  { user }
): Promise<BaseResponseOrError> => {
  try {
    // Verify user authentication
    const authResponse = checkUserAuth(user);
    if (authResponse) return authResponse;

    // Validate input user ID with Zod schema
    const validationResult = await idsSchema.safeParseAsync({
      ids: sessionIds,
    });

    // Return detailed validation errors if input is invalid
    if (!validationResult.success) {
      const errorMessages = validationResult.error.errors.map((error) => ({
        field: error.path.join("."), // Join path array to string for field identification
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

    // Delete the user login info from database
    await deleteUserLoginInfoSessionsByIds(sessionIds);

    return {
      statusCode: 200,
      success: true,
      message: "Login session deleted successfully",
      __typename: "BaseResponse",
    };
  } catch (error) {
    console.error("Error delete login session of user:", error);

    return {
      statusCode: 500,
      success: false,
      message: `${
        CONFIG.NODE_ENV === "production"
          ? "Something went wrong, please try again."
          : error.message || "Internal server error"
      }`,
      __typename: "ErrorResponse",
    };
  }
};
