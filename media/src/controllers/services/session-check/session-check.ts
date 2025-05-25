import { BaseResponseOrError, UserSession } from "../../../types";

/**
 * Checks if the user is authenticated and returns a BaseResponse if not
 * @param user - The user object from the context
 * @returns BaseResponseOrError if not authenticated, or null if authenticated
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
