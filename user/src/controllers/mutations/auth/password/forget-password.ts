import { Repository } from "typeorm";
import { v4 as uuidv4 } from "uuid";
import CONFIG from "../../../../config/config";
import { Context } from "../../../../context";
import { User } from "../../../../entities/user.entity";
import {
  getLastResetRequestFromRedis,
  getUserInfoByEmailInRedis,
  setLastResetRequestInRedis,
  setUserInfoByEmailInRedis,
} from "../../../../helper/redis";
import {
  BaseResponseOrError,
  MutationForgetPasswordArgs,
} from "../../../../types";
import { emailSchema } from "../../../../utils/data-validation";
import SendEmail from "../../../../utils/email/send-email";

// Define the type for lockout session
interface LockoutSession {
  lockedAt: number; // Timestamp when the account was locked
  duration: number; // Duration in seconds for the lockout
}

/**
 * Handles the password reset request via email.
 *
 * Steps:
 * - Validates input using Zod schema
 * - Checks Redis for user data to optimize performance via caching
 * - Checks if the user exists
 * - Generates a password reset token and saves it to the user
 * - Sends a password reset email with a reset link
 *
 * @param _ - Unused GraphQL parent argument
 * @param args - Arguments for reset password request (email)
 * @param context - GraphQL context with AppDataSource
 * @returns Promise<BaseResponseOrError> - Response status and message
 */
export const forgetPassword = async (
  _,
  args: MutationForgetPasswordArgs,
  { AppDataSource }: Context
): Promise<BaseResponseOrError> => {
  const { email } = args;

  const userRepository: Repository<User> = AppDataSource.getRepository(User);

  try {
    const validationResult = await emailSchema.safeParseAsync({ email });

    if (!validationResult.success) {
      const errorMessages = validationResult.error.errors.map((error) => ({
        field: error.path.join("."),
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

    // Check Redis for cached user's data
    let user;

    user = getUserInfoByEmailInRedis(email);

    if (!user.email) {
      const dbUser = await userRepository.findOne({
        where: { email },
        relations: ["role"],
      });

      if (!dbUser) {
        return {
          statusCode: 400,
          success: false,
          message: `User not found with this email: ${email}`,
          __typename: "BaseResponse",
        };
      }

      user = {
        ...dbUser,
        role: dbUser.role.name,
      };

      // Create a new session for the user
      const userSessionByEmail = {
        id: user.id,
        email: user.email,
        firstName: user.firstName,
        lastName: user.lastName,
        role: dbUser.role.name,
        gender: user.gender,
        emailVerified: user.emailVerified,
        isAccountActivated: user.isAccountActivated,
        password: user.password,
      };

      await setUserInfoByEmailInRedis(email, userSessionByEmail);
    }

    const lastSent = await getLastResetRequestFromRedis(email);

    if (lastSent) {
      const timePassed = Math.floor((Date.now() - lastSent) / 1000);
      const coolDownTime = 60; // 1 minute cool down
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

    const resetToken = uuidv4();

    const tokenExpiry = new Date(Date.now() + 5 * 60 * 1000); // 5 minutes

    await userRepository.update(
      { email },
      {
        resetPasswordToken: resetToken,
        resetPasswordTokenExpiry: tokenExpiry,
      }
    );

    const resetLink = `${CONFIG.FRONTEND_URL}/reset-password?token=${resetToken}`;

    const subject = "Password Reset Request";
    const text = `Please use the following link to reset your password: ${resetLink}`;
    const html = `<p>Please use the following link to reset your password: <a href="${resetLink}">${resetLink}</a></p>`;

    const emailSent = await SendEmail({
      to: email,
      subject,
      text,
      html,
    });

    if (!emailSent) {
      return {
        statusCode: 500,
        success: false,
        message: "Failed to send password reset email",
        __typename: "BaseResponse",
      };
    }

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
      message: "Failed to process password reset request",
      __typename: "BaseResponse",
    };
  }
};
