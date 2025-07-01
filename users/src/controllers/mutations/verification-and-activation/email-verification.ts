import CONFIG from "../../../config/config";
import { Context } from "../../../context";
import {
  clearAllUserSearchCache,
  getUserInfoByEmailFromRedis,
  removeUserEmailFromRedis,
  removeUserInfoByEmailFromRedis,
  removeUserTokenInfoByUserSessionIdFromRedis,
  setUserInfoByEmailInRedis,
  setUserInfoByUserIdInRedis,
  setUserTokenInfoByUserSessionIdInRedis,
} from "../../../helper/redis";
import {
  EmailVerificationResponseOrError,
  MutationVerifyEmailArgs,
  UserSession,
} from "../../../types";
import {
  emailSchema,
  idSchema,
  sessionStringSchema,
} from "../../../utils/data-validation";
import EncodeToken from "../../../utils/jwt/encode-token";
import {
  checkUserAuth,
  deleteUserLoginInfoSessionsByIds,
  getUserLoginInfoByUserId,
  updateUser,
} from "../../services";

/**
 * Handles the verification of a user's email address using a verification link.
 *
 * Workflow:
 * 1. Verifies user authentication status.
 * 2. Validates input (userId and email) using Zod schemas.
 * 3. Retrieves user data from Redis for performance optimization.
 * 4. Verifies the existence of a pending email to be verified.
 * 5. Updates the user's email to the verified one in the database, clearing temporary fields.
 * 6. Prepares user session data with updated information.
 * 7. Updates Redis caches with new user data, removing old email data.
 * 8. Generates a new JWT token for the updated user session.
 * 9. Returns a success response with the token if the session id match or error if validation or verification fails.
 *
 * @param _ - Unused parent parameter for GraphQL resolver.
 * @param args - Input arguments containing userId and email for email verification.
 * @param context - GraphQL context containing authenticated user information.
 * @returns A promise resolving to an EmailVerificationResponseOrError object containing status, message, token, and errors if applicable.
 */
export const verifyEmail = async (
  _: any,
  args: MutationVerifyEmailArgs,
  { user }: Context
): Promise<EmailVerificationResponseOrError> => {
  try {
    // Verify user authentication
    const authResponse = checkUserAuth(user);
    if (authResponse) return authResponse;

    const { userId, email, sessionId } = args;

    // Validate input data with Zod schema
    const [idResult, emailResult, sessionString] = await Promise.all([
      idSchema.safeParseAsync({ id: userId }),
      emailSchema.safeParseAsync({ email }),
      sessionStringSchema.safeParseAsync({ sessionId }),
    ]);

    // Return detailed validation errors if input is invalid
    if (!idResult.success || !emailResult.success || !sessionString.success) {
      const errors = [
        ...(idResult.error?.errors || []),
        ...(emailResult.error?.errors || []),
      ].map((e) => ({
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

    // Attempt to retrieve cached user data from Redis
    let userData;

    userData = await getUserInfoByEmailFromRedis(user.email);

    // Store the old email for Redis cleanup
    const oldEmail = user.email;

    // Verify the presence of a pending email to verify
    if (!userData.tempUpdatedEmail) {
      return {
        statusCode: 400,
        success: false,
        message: "Invalid email to verify",
        __typename: "EmailVerificationResponse",
      };
    }

    // Update user with verified email in the database
    const updateResult = await updateUser({
      ...userData,
      email: userData.tempUpdatedEmail,
      tempUpdatedEmail: null,
      tempEmailVerified: null,
    });

    // Get all login sessions for the user
    const userLoginInfoRaw = await getUserLoginInfoByUserId(user.id);
    const allSessionIds = userLoginInfoRaw.map((s) => s.id);

    // Handle sessions and token generation based on sessionId match
    if (sessionId === user.sessionId) {
      // Keep current session, delete others
      const sessionsToDelete = allSessionIds.filter((id) => id !== sessionId);

      if (sessionsToDelete.length) {
        await deleteUserLoginInfoSessionsByIds(sessionsToDelete);
        await Promise.all(
          sessionsToDelete.map((sid) =>
            removeUserTokenInfoByUserSessionIdFromRedis(sid)
          )
        );
      }

      // Update caches
      const userSessionData: UserSession = {
        id: updateResult.id,
        avatar: updateResult.avatar,
        firstName: updateResult.firstName,
        lastName: updateResult.lastName,
        email: updateResult.email,
        gender: updateResult.gender,
        roles: updateResult.roles.map((role) => role.name.toUpperCase()),
        emailVerified: updateResult.emailVerified,
        isAccountActivated: updateResult.isAccountActivated,
        sessionId,
      };

      await Promise.all([
        setUserTokenInfoByUserSessionIdInRedis(
          sessionId,
          userSessionData,
          2592000
        ),
        setUserInfoByUserIdInRedis(userId, updateResult),
        setUserInfoByEmailInRedis(updateResult.email, updateResult),
        removeUserInfoByEmailFromRedis(oldEmail),
        removeUserEmailFromRedis(oldEmail),
        clearAllUserSearchCache(),
      ]);

      // Generate new JWT token
      const token = await EncodeToken(userSessionData, "30d");

      return {
        statusCode: 200,
        success: true,
        message: "Email verified successfully",
        token,
        __typename: "EmailVerificationResponse",
      };
    } else {
      // Session IDs do NOT match => delete ALL sessions (including current), no token generated
      if (allSessionIds.length) {
        await deleteUserLoginInfoSessionsByIds(allSessionIds);
        await Promise.all(
          allSessionIds.map((sid) =>
            removeUserTokenInfoByUserSessionIdFromRedis(sid)
          )
        );
      }

      // Clear user caches as well
      await Promise.all([
        setUserInfoByUserIdInRedis(userId, updateResult),
        setUserInfoByEmailInRedis(updateResult.email, updateResult),
        removeUserInfoByEmailFromRedis(oldEmail),
        removeUserEmailFromRedis(oldEmail),
        clearAllUserSearchCache(),
      ]);

      return {
        statusCode: 200,
        success: true,
        message:
          "Email verified successfully. All sessions other than current have been deleted.",
        __typename: "EmailVerificationResponse",
      };
    }
  } catch (error: any) {
    console.error("Error verifying email:", error);

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
