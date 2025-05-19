import { Not, Repository } from "typeorm";
import CONFIG from "../../../config/config";
import { Context } from "../../../context";
import { User } from "../../../entities/user.entity";
import {
  getUserEmailFromRedis,
  getUserInfoByUserIdFromRedis,
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
        where: { id: user.id, deletedAt: null },
        select: {
          id: true,
          firstName: true,
          lastName: true,
          email: true,
          gender: true,
          role: {
            name: true,
          },
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
      // Check if the new email is already in use
      if (await getUserEmailFromRedis(email)) {
        return {
          statusCode: 409,
          success: false,
          message: "Email is already in use by another account",
          __typename: "ErrorResponse",
        };
      }

      const existingUser = await userRepository.findOne({
        where: [
          { email, id: Not(user.id), deletedAt: null },
          { tempUpdatedEmail: email, id: Not(user.id), deletedAt: null },
        ],
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
      const verifyEmail = `${CONFIG.FRONTEND_URL}/verify-email/?userId=${userData.id}&email=${email}`;

      // Prepare email contents
      const subject = "Verify Email Request";
      const text = `Please use the following link to verify your email: ${verifyEmail}`;
      const html = `<p>Please use the following link to verify your email to use it as main email: <a href="${verifyEmail}">${verifyEmail}</a></p>`;

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

      // Update temp email fields for verification
      userData.tempUpdatedEmail = email;
      userData.tempEmailVerified = false;
    }

    if (gender) userData.gender = gender;

    // preserve role for session
    const preservedRole = user.role;

    // Delete role from the userData to update the user info properly
    delete userData.role;

    // Save updated user data
    const updatedUser = await userRepository.save(userData);

    // Generate JWT token
    const token = await EncodeToken(
      updatedUser.id,
      updatedUser.firstName,
      updatedUser.lastName,
      updatedUser.email,
      updatedUser.gender,
      preservedRole,
      updatedUser.emailVerified,
      updatedUser.isAccountActivated,
      "30d" // Set the token expiration time
    );

    const session: UserSession = {
      id: updatedUser.id,
      firstName: updatedUser.firstName,
      lastName: updatedUser.lastName,
      email: updatedUser.email,
      gender: updatedUser.gender,
      role: updatedUser.role.name,
      emailVerified: updatedUser.emailVerified,
      isAccountActivated: updatedUser.isAccountActivated,
    };

    const userEmailCacheData: CachedUserSessionByEmailKeyInputs = {
      id: updatedUser.id,
      firstName: updatedUser.firstName,
      lastName: updatedUser.lastName,
      email: updatedUser.email,
      emailVerified: updatedUser.emailVerified,
      gender: updatedUser.gender,
      role: updatedUser.role.name,
      password: updatedUser.password,
      isAccountActivated: updatedUser.isAccountActivated,
      tempUpdatedEmail: updatedUser.tempUpdatedEmail,
      tempEmailVerified: updatedUser.tempEmailVerified,
    };

    // Cache user, user session and user email for curd in Redis with configurable TTL(30 days = 25920000)
    const promises = [
      setUserTokenInfoByUserIdInRedis(updatedUser.id, session, 25920000),
      setUserInfoByUserIdInRedis(updatedUser.id, session),
      setUserInfoByEmailInRedis(updatedUser.email, userEmailCacheData),
    ];

    if (email) {
      promises.push(
        setUserEmailInRedis(email, email),
        setUserInfoByEmailInRedis(email, userEmailCacheData)
      );
    }

    await Promise.all(promises);

    return {
      statusCode: 200,
      success: true,
      token,
      message: `${
        email
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
      message: error.message || "Internal server error",
      __typename: "ErrorResponse",
    };
  }
};
