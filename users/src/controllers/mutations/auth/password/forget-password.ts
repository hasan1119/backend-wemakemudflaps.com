import { v4 as uuidv4 } from "uuid";
import CONFIG from "../../../../config/config";
import { Context } from "../../../../context";
import {
  getLastResetRequestFromRedis,
  getUserInfoByEmailFromRedis,
  setLastResetRequestInRedis,
  setUserInfoByEmailInRedis,
} from "../../../../helper/redis";
import {
  BaseResponseOrError,
  MutationForgetPasswordArgs,
} from "../../../../types";
import { emailSchema } from "../../../../utils/data-validation";
import SendEmail from "../../../../utils/email/send-email";
import {
  getUserByEmail,
  updateUserResetPasswordToken,
} from "../../../services";

/**
 * Handles password reset request functionality by sending a reset link via email.
 *
 * Workflow:
 * 1. Validates the input email using Zod schema.
 * 2. Retrieves cached user data from Redis to optimize performance.
 * 3. Fetches user data from the database and caches it if not found in Redis.
 * 4. Checks for recent password reset requests to enforce a 1-minute cooldown.
 * 5. Generates a unique reset token and sets a 5-minute expiry.
 * 6. Updates the user's reset token and expiry in the database.
 * 7. Sends a password reset email with a unique reset link.
 * 8. Caches the timestamp of the reset request in Redis to enforce cooldown.
 * 9. Returns a success response or error if validation, user lookup, or email sending fails.
 *
 * @param _ - Unused parent parameter for GraphQL resolver.
 * @param args - Input arguments containing the user's email.
 * @param __ - GraphQL context (unused here).
 * @returns A promise resolving to a BaseResponseOrError object containing status, message, and errors if applicable.
 */
export const forgetPassword = async (
  _,
  args: MutationForgetPasswordArgs,
  __: Context
): Promise<BaseResponseOrError> => {
  try {
    // Validate input email with Zod schema
    const validationResult = await emailSchema.safeParseAsync(args);

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

    const { email } = validationResult.data;

    // Attempt to retrieve cached user data from Redis
    let userData;

    userData = await getUserInfoByEmailFromRedis(email);

    if (!userData) {
      // On cache miss, fetch user data from database
      userData = await getUserByEmail(email);

      if (!userData) {
        return {
          statusCode: 404,
          success: false,
          message: `User not found in database associate with this email: ${email}`,
          __typename: "ErrorResponse",
        };
      }
      // Cache user data in Redis
      await setUserInfoByEmailInRedis(email, userData);
    }

    // Check for recent password reset requests in Redis
    const lastSent = await getLastResetRequestFromRedis(email);

    if (lastSent) {
      const timePassed = Math.floor((Date.now() - lastSent) / 1000);
      const coolDownTime = 60; // 1 minute cooldown
      const timeLeft = coolDownTime - timePassed;

      if (timeLeft > 0) {
        const minutes = Math.floor(timeLeft / 60);
        const seconds = timeLeft % 60;
        return {
          statusCode: 400,
          success: false,
          message: `Please wait ${minutes}m ${seconds}s before requesting another password reset.`,
          __typename: "BaseResponse",
        };
      }
    }

    // Generate a unique reset token
    const resetToken = uuidv4();

    // Set token expiry to 5 minutes
    const tokenExpiry = new Date(Date.now() + 5 * 60 * 1000); // 5 minutes

    // Update user's reset token and expiry in the database
    await updateUserResetPasswordToken({
      email,
      resetToken,
      tokenExpiry,
    });

    // Generate password reset link
    const resetLink = `${CONFIG.FRONTEND_URL}/reset-password?token=${resetToken}`;

    // Prepare email content for password reset
    const subject = "Password Reset Request";
    const text = `Please use the following link to reset your password: ${resetLink}`;
    const html = `<p>Please use the following link to reset your password: <a href="${resetLink}">${resetLink}</a></p><br><br><p>This link will be expired with 5 minutes.</p>`;

    // Attempt to send password reset email
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
        message: "Failed to send password reset email",
        __typename: "BaseResponse",
      };
    }

    // Cache the timestamp of the reset request in Redis
    await setLastResetRequestInRedis(email); // 1 minute only

    return {
      statusCode: 200,
      success: true,
      message:
        "Password reset email sent successfully. The link will expire in 5 minutes.",
      __typename: "BaseResponse",
    };
  } catch (error: any) {
    console.error("Forget password error:", error);

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
