import CONFIG from "../../../config/config";
import { Context } from "../../../context";
import {
  clearAllUserSearchCache,
  getUserInfoByUserIdFromRedis,
  removeUserTokenInfoByUserSessionIdFromRedis,
  setUserEmailInRedis,
  setUserInfoByEmailInRedis,
  setUserInfoByUserIdInRedis,
  setUserTokenInfoByUserSessionIdInRedis,
} from "../../../helper/redis";
import {
  MutationUpdateProfileArgs,
  UserProfileUpdateResponseOrError,
  UserSession,
  UserSessionById,
} from "../../../types";
import { updateProfileSchema } from "../../../utils/data-validation";
import SendEmail from "../../../utils/email/send-email";
import EncodeToken from "../../../utils/jwt/encode-token";
import {
  checkUserAuth,
  checkUserPermission,
  deleteUserLoginInfoSessionsByIds,
  getUserLoginInfoByUserId,
  isEmailInUse,
  isUsernameAvailable,
  updateUser,
} from "../../services";

/**
 * Handles updating a user's account information.
 *
 * Workflow:
 * 1. Verifies user authentication status.
 * 2. Validates input data (firstName, lastName, email, gender, username, company, bio and website) using Zod schema.
 * 3. Retrieves cached user data from Redis to optimize performance.
 * 4. Checks for email uniqueness if email is updated.
 * 5. Sends an email verification link if the email is changed.
 * 6. Updates user fields (name, email, gender) in the database.
 * 7. Caches updated user data and session in Redis with a 30-day TTL.
 * 8. Generates a new JWT token for the updated user session.
 * 9. Returns a success response with the new token or error if validation, email verification, or update fails.
 *
 * @param _ - Unused parent parameter for GraphQL resolver.
 * @param args - Input arguments containing firstName, lastName, email, and gender.
 * @param context - GraphQL context containing authenticated user information.
 * @returns A promise resolving to a UserProfileUpdateResponseOrError object containing status, message, token, and errors if applicable.
 */
export const updateProfile = async (
  _: any,
  args: MutationUpdateProfileArgs,
  { user }: Context
): Promise<UserProfileUpdateResponseOrError> => {
  try {
    // Verify user authentication
    const authResponse = checkUserAuth(user);
    if (authResponse) return authResponse;

    // Validate input data with Zod schema
    const validationResult = await updateProfileSchema.safeParseAsync(args);

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

    const {
      firstName,
      lastName,
      avatar,
      email,
      gender,
      address,
      phone,
      username,
      bio,
      company,
      website,
    } = validationResult.data;

    // Check permission if the user is updating on behalf of someone else
    if (args.userId !== user.id) {
      const hasPermission = await checkUserPermission({
        user,
        action: "canUpdate",
        entity: "user",
      });

      if (!hasPermission) {
        return {
          statusCode: 403,
          success: false,
          message:
            "You do not have permission to update for another user profile information",
          __typename: "BaseResponse",
        };
      }
    }

    // Attempt to retrieve cached user data from Redis
    let userData: UserSessionById;

    userData = await getUserInfoByUserIdFromRedis(user.id);

    if (userData.username !== username) {
      // Check if username is available
      const isAvailable = !(await isUsernameAvailable(username, user.id));

      if (isAvailable) {
        return {
          statusCode: 400,
          success: false,
          message: "Username already in use",
          __typename: "BaseResponse",
        };
      }
      userData.username = username;
    }

    // Update user fields only if provided
    if (firstName !== userData.firstName) userData.firstName = firstName;

    if (lastName !== userData.lastName) userData.lastName = lastName;

    if (gender !== userData.gender) userData.gender = gender;

    if (address !== userData.address) userData.address = address;

    if (avatar !== userData.avatar) userData.avatar = avatar;

    if (phone !== userData.phone) userData.phone = phone;

    if (website !== userData.website) userData.website = website;

    if (bio !== userData.bio) userData.bio = bio;

    if (company !== userData.company) userData.company = company;

    if (email !== userData.email) {
      // Check if the new email is already in use
      if (await isEmailInUse(email, user.id)) {
        return {
          statusCode: 409,
          success: false,
          message: "Email is already in use by another account",
          __typename: "ErrorResponse",
        };
      }

      // Generate email verification link
      const verifyEmail = `${CONFIG.FRONTEND_URL}/verify-email/?userId=${userData.id}&email=${email}&sessionId=${user.sessionId}`;

      // Prepare email content for verification
      const subject = "Verify Email Request";
      const text = `Please use the following link to verify your email: ${verifyEmail}`;
      const html = `<p>Please use the following link to verify your email to use it as main email: <a href="${verifyEmail}">${verifyEmail}</a></p>`;

      // Attempt to send verification email
      const emailSent = await SendEmail({
        to: email,
        subject,
        text,
        html,
      });

      // Return error if email sending fails
      if (!emailSent) {
        return {
          statusCode: 500,
          success: false,
          message: "Failed to send email verification email",
          __typename: "ErrorResponse",
        };
      }

      // Set temporary email fields for verification
      userData.tempUpdatedEmail = email;
      userData.tempEmailVerified = false;
    }

    // Remove fields that should not be updated
    delete userData.roles;
    delete userData.permissions;
    delete userData.createdAt;
    delete userData.deletedAt;

    const updatedData = {
      ...userData,
    };

    // Update user data in the database
    const updatedUser = await updateUser(updatedData as any);

    // Prepare user session data
    const userSessionData: UserSession = {
      id: updatedUser.id,
      avatar: updatedUser.avatar,
      firstName: updatedUser.firstName,
      lastName: updatedUser.lastName,
      email: updatedUser.email,
      gender: updatedUser.gender,
      roles: user.roles.map((role) => ({
        id: role.id,
        name: role.name.toUpperCase(),
      })),
      emailVerified: updatedUser.emailVerified,
      isAccountActivated: updatedUser.isAccountActivated,
      sessionId: user.sessionId,
    };

    const userLoginInfoRaw = await getUserLoginInfoByUserId(user.id);

    // Filter out all sessions except the current one to delete others
    const sessionsToDelete = userLoginInfoRaw
      .filter((info) => info.id !== user.sessionId)
      .map((info) => info.id);

    await deleteUserLoginInfoSessionsByIds(sessionsToDelete),
      await Promise.all(
        sessionsToDelete.map((sessionId) => [
          removeUserTokenInfoByUserSessionIdFromRedis(sessionId),
        ])
      );

    // Cache user data, session, and email in Redis with 30-day TTL
    const promises = [
      setUserTokenInfoByUserSessionIdInRedis(
        user.sessionId,
        userSessionData,
        25920000
      ),
      setUserInfoByUserIdInRedis(updatedUser.id, updatedUser),
      setUserInfoByEmailInRedis(updatedUser.email, updatedUser),
      clearAllUserSearchCache(),
    ];

    if (email) {
      promises.push(
        setUserEmailInRedis(email, email),
        setUserInfoByEmailInRedis(email, updatedUser)
      );
    }

    await Promise.all(promises);

    // Generate new JWT token
    const token = await EncodeToken(
      userSessionData,
      "30d" // Token expiration set to 30 days
    );

    return {
      statusCode: 200,
      success: true,
      token,
      message: `${
        email !== userData.email
          ? "Profile updated successfully, but please verify your updated email before using it as main email."
          : "Profile updated successfully"
      }`,
      __typename: "UserProfileUpdateResponse",
    };
  } catch (error: any) {
    console.error("Error updating user profile:", error);

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
