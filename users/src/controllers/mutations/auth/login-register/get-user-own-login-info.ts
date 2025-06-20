import CONFIG from "../../../../config/config";
import { GetUserLoginInfoResponseOrError } from "../../../../types";
import { checkUserAuth, getUserLoginInfoByUserId } from "../../../services";

/**
 * Handles the retrieval of the authenticated user's login information.
 *
 * Workflow:
 * 1. Checks if the user is authenticated using `checkUserAuth`.
 * 2. If authenticated, retrieves the user's login information by their user ID.
 * 3. Returns a response containing the user's login information or an error message.
 *
 * @param _ - Unused parameter (parent).
 * @param __ - Unused parameter (args).
 * @param context - The context containing the authenticated user.
 * @returns A response object with status code, success flag, message, and user login information.
 */
export const getUserOwnLoginInfo = async (
  _,
  __,
  { user }
): Promise<GetUserLoginInfoResponseOrError> => {
  try {
    // Verify user authentication
    const authResponse = checkUserAuth(user);
    if (authResponse) return authResponse;

    const userLoginInfoRaw = await getUserLoginInfoByUserId(user.id);
    const userLoginInfo = userLoginInfoRaw.map((info) => ({
      ...info,
      loggedInAt:
        info.loggedInAt instanceof Date
          ? info.loggedInAt.toISOString()
          : info.loggedInAt,
    }));

    return {
      statusCode: 200,
      success: true,
      message: "User login information retrieved successfully",
      userLoginInfo,
      __typename: "UserLoginInfoResponse",
    };
  } catch (error) {
    console.error("Error getting user login infos:", {
      message: error.message,
    });

    return {
      statusCode: 500,
      success: false,
      message: `${
        CONFIG.NODE_ENV === "production"
          ? "Something went wrong, please try again."
          : error.message || "Internal server error"
      }`,
      __typename: "BaseResponse",
    };
  }
};
