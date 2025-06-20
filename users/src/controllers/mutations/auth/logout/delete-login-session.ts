import CONFIG from "../../../../config/config";
import {
  BaseResponseOrError,
  MutationDeleteLoginSessionArgs,
} from "../../../../types";
import {
  checkUserAuth,
  deleteUserLoginInfoBySessionId,
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
  { sessionId }: MutationDeleteLoginSessionArgs,
  { user }
): Promise<BaseResponseOrError> => {
  try {
    // Verify user authentication
    const authResponse = checkUserAuth(user);
    if (authResponse) return authResponse;

    // Delete the user login info from database
    await deleteUserLoginInfoBySessionId(sessionId);

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
