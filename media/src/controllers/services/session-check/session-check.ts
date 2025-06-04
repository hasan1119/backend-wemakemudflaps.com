import { BaseResponseOrError, UserSession } from "../../../types";

/**
 * Handles verification of user authentication status.
 *
 * Workflow:
 * 1. Checks if the provided user object exists and is valid.
 * 2. Returns an error response with a 401 status if the user is not authenticated.
 * 3. Returns null if the user is authenticated, indicating no error.
 *
 * @param user - The user session object from the context, which may be null or undefined.
 * @returns A BaseResponseOrError object if authentication fails, or null if the user is authenticated.
 */
export function checkUserAuth(
  user: UserSession | null | undefined
): BaseResponseOrError | null {
  if (!user) {
    return {
      statusCode: 401,
      success: false,
      message: "Session expired, please login again.",
      __typename: "BaseResponse",
    };
  }
  return null;
}
