import { Not, Repository } from "typeorm";
import CONFIG from "../../../config/config";
import { Context } from "../../../context";
import { User } from "../../../entities/user.entity";
import {
  getUserEmailFromRedis,
  getUserInfoByUserIdFromRedis,
  removeUserInfoByEmailFromRedis,
  setUserEmailInRedis,
  setUserInfoByEmailInRedis,
  setUserInfoByUserIdInRedis,
  setUserTokenInfoByUserIdInRedis,
} from "../../../helper/redis";
import {
  CachedUserSessionByEmailKeyInputs,
  MutationUpdateProfileArgs,
  UserProfileUpdateResponseOrError,
  UserSession,
} from "../../../types";
import { updateProfileSchema } from "../../../utils/data-validation";
import SendEmail from "../../../utils/email/send-email";
import EncodeToken from "../../../utils/jwt/encode-token";
import { checkUserAuth } from "../../../utils/session-check/session-check";

/**
 * Allows the user to update their account information.
 *
 * Steps:
 * - Validates input using Zod schema
 * - Checks Redis for user data to optimize performance via caching
 * - Updates the user's name, email, password, gender, and role
 * - Hashes the password if it is updated
 * - Sends an email verification email, if email is updated
 * - Updates necessary user data in redis for future request
 *
 * @param _ - Unused GraphQL parent argument
 * @param args - Arguments for update user profile ( firstName, lastName, email, gender )
 * @param context - GraphQL context with AppDataSource and user info
 * @returns Promise<UserProfileUpdateResponseOrError> - Response status and message
 */
export const updateProfile = async (
  _: any,
  args: MutationUpdateProfileArgs,
  { AppDataSource, user }: Context
): Promise<UserProfileUpdateResponseOrError> => {
  const { firstName, lastName, email, gender } = args;

  try {
    // Check user authentication
    const authResponse = checkUserAuth(user);
    if (authResponse) return authResponse;

    // Validate input data using Zod
    const validationResult = await updateProfileSchema.safeParseAsync({
      firstName,
      lastName,
      email,
      gender,
    });

    // If validation fails, return detailed error messages with field names
    if (!validationResult.success) {
      const errorMessages = validationResult.error.errors.map((error) => ({
        field: error.path.join("."), // Converts the path array to a string
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

    // Retrieve the user from the database (already authenticated user)
    const userRepository: Repository<User> = AppDataSource.getRepository(User);

    // Check Redis for cached user's data
    let userData;

    userData = await getUserInfoByUserIdFromRedis(user.id);

    if (!userData) {
      // Cache miss: Fetch user from database
      userData = await userRepository.findOne({
        where: { id: user.id },
        select: {
          id: true,
          firstName: true,
          lastName: true,
          email: true,
          gender: true,
          emailVerified: true,
          isAccountActivated: true,
        },
      });

      if (!userData) {
        return {
          statusCode: 404,
          success: false,
          message: "Authenticated user not found in database",
          __typename: "ErrorResponse",
        };
      }
    }

    // Update user fields only if provided
    if (firstName) userData.firstName = firstName;

    if (lastName) userData.lastName = lastName;

    if (email && email !== userData.email) {
      const emailInUse = await getUserEmailFromRedis(email);

      if (emailInUse) {
        return {
          statusCode: 409,
          success: false,
          message: "Email is already in use by another account",
          __typename: "ErrorResponse",
        };
      }

      // Cache miss: Fetch user from database while excluding current user ID
      const existingUser = await userRepository.findOne({
        where: { email, id: Not(user.id) },
      });

      if (existingUser) {
        return {
          statusCode: 409,
          success: false,
          message: "Email is already in use by another account",
          __typename: "ErrorResponse",
        };
      }

      // Create the email verification link with user id
      const verifyEmail = `${CONFIG.FRONTEND_URL}/verify-email/?userId=${userData.id}`;

      // Prepare email contents
      const subject = "Verify Email Request";
      const text = `Please use the following link to verify your email: ${verifyEmail}`;
      const html = `<p>Please use the following link to active your account: <a href="${verifyEmail}">${verifyEmail}</a></p>`;

      // Attempt to send the reset email
      const emailSent = await SendEmail({
        to: email,
        subject,
        text,
        html,
      });

      // If email sending fails, return an error
      if (!emailSent) {
        return {
          statusCode: 500,
          success: false,
          message: "Failed to send email verification email",
          __typename: "ErrorResponse",
        };
      }

      userData.email = email;

      userData.emailVerified = false;
    }

    if (gender) userData.gender = gender;

    // preserve role for session
    const preservedRole = user.role;

    // Delete role from the userData to update the user info properly
    delete userData.role;

    // Save updated user data
    const updatedUser = await userRepository.save(userData);

    // Regenerate the JWT token after the update
    const token = await EncodeToken(
      updatedUser.id,
      updatedUser.email,
      updatedUser.firstName,
      updatedUser.lastName,
      preservedRole,
      updatedUser.gender,
      updatedUser.emailVerified,
      updatedUser.isAccountActivated,
      "30d" // Set the token expiration time
    );

    const session: UserSession = {
      id: updatedUser.id,
      email: updatedUser.email,
      firstName: updatedUser.firstName,
      lastName: updatedUser.lastName,
      role: updatedUser.role.name,
      gender: updatedUser.gender,
      emailVerified: updatedUser.email,
      isAccountActivated: updatedUser.isAccountActivated,
    };

    const userEmailCacheData: CachedUserSessionByEmailKeyInputs = {
      id: updatedUser.id,
      email: updatedUser.email,
      firstName: updatedUser.firstName,
      lastName: updatedUser.lastName,
      role: updatedUser.role.name,
      gender: updatedUser.gender,
      emailVerified: updatedUser.email,
      isAccountActivated: updatedUser.isAccountActivated,
      password: updatedUser.password,
    };

    // Cache user, user session and user email for curd in Redis with configurable TTL(30 days = 25920000)
    const promises = [
      setUserTokenInfoByUserIdInRedis(updatedUser.id, session, 25920000),
      setUserInfoByUserIdInRedis(updatedUser.id, session),
      setUserInfoByEmailInRedis(updatedUser.email, userEmailCacheData),
    ];

    if (email) {
      promises.push(removeUserInfoByEmailFromRedis(user.email));
      promises.push(setUserEmailInRedis(email, email));
    }

    await Promise.all(promises);

    return {
      statusCode: 200,
      success: true,
      token,
      message: `${
        email
          ? "Profile updated successfully, but please verify your email before using the account."
          : "Profile updated successfully"
      }`,
      __typename: "UserProfileUpdateResponse",
    };
  } catch (error: any) {
    console.error("Error updating user profile:", error);

    return {
      statusCode: 500,
      success: false,
      message: error.message || "Internal server error",
      __typename: "ErrorResponse",
    };
  }
};
