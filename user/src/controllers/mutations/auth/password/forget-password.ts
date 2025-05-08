import { Repository } from 'typeorm';
import { v4 as uuidv4 } from 'uuid';
import CONFIG from '../../../../config/config';
import { Context } from '../../../../context';
import { User } from '../../../../entities/user.entity';
import {
  getUserEmailCacheKey,
  getUserInfoByEmailCacheKey,
} from '../../../../helper/redis/session-keys';
import {
  BaseResponseOrError,
  MutationForgetPasswordArgs,
} from '../../../../types';
import { emailSchema } from '../../../../utils/data-validation';
import SendEmail from '../../../../utils/email/send-email';

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
 * - Checks if the user exists
 * - Generates a password reset token and saves it to the user
 * - Sends a password reset email with a reset link
 *
 * @param _ - Unused GraphQL parent argument
 * @param args - Arguments for reset password request (email)
 * @param context - GraphQL context with AppDataSource and Redis
 * @returns Promise<BaseResponseOrError> - Response status and message
 */
export const forgetPassword = async (
  _,
  args: MutationForgetPasswordArgs,
  { AppDataSource, redis }: Context
): Promise<BaseResponseOrError> => {
  const { email } = args;
  const { getSession, setSession } = redis;

  const userRepository: Repository<User> = AppDataSource.getRepository(User);

  try {
    const validationResult = await emailSchema.safeParseAsync({ email });

    if (!validationResult.success) {
      const errorMessages = validationResult.error.errors.map((error) => ({
        field: error.path.join('.'),
        message: error.message,
      }));

      return {
        statusCode: 400,
        success: false,
        message: 'Validation failed',
        errors: errorMessages,
        __typename: 'ErrorResponse',
      };
    }

    let user = await getSession(getUserInfoByEmailCacheKey(email));

    if (!user) {
      user = await userRepository.findOne({
        where: { email },
      });

      if (!user) {
        return {
          statusCode: 400,
          success: false,
          message: `User not found with this email: ${email}`,
          __typename: 'BaseResponse',
        };
      }
    }

    const lastSentKey = `forget_password_last_sent_${email}`;
    const lastSent = await getSession(lastSentKey);

    if (lastSent) {
      const timePassed = Math.floor((Date.now() - Number(lastSent)) / 1000);
      const cooldownTime = 60; // 1 minute cooldown
      const timeLeft = cooldownTime - timePassed;

      if (timeLeft > 0) {
        const minutes = Math.floor(timeLeft / 60);
        const seconds = timeLeft % 60;
        return {
          statusCode: 400,
          success: false,
          message: `Please wait ${minutes}m ${seconds}s before requesting another password reset.`,
          __typename: 'BaseResponse',
        };
      }
    }

    const resetToken = uuidv4();
    const tokenExpiry = new Date(Date.now() + 5 * 60 * 1000); // 5 minutes

    user.resetPasswordToken = resetToken;
    user.resetPasswordTokenExpiry = tokenExpiry;

    await userRepository.save(user);

    const resetLink = `${CONFIG.FRONTEND_URL}/reset-password?token=${resetToken}`;

    const subject = 'Password Reset Request';
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
        message: 'Failed to send password reset email',
        __typename: 'BaseResponse',
      };
    }

    await setSession(lastSentKey, Date.now().toString(), 60); // 1 minute only

    await setSession(getUserInfoByEmailCacheKey(email), {
      id: user.id,
      firstName: user.firstName,
      lastName: user.lastName,
      email: user.email,
      password: user.password,
      gender: user.gender,
      role: user.role.name,
      resetPasswordToken: resetToken,
      resetPasswordTokenExpiry: tokenExpiry.toISOString(),
      emailVerified: user.emailVerified,
      isAccountActivated: user.isAccountActivated,
    });

    return {
      statusCode: 200,
      success: true,
      message: 'Password reset email sent successfully. The link will expire in 5 minutes.',
      __typename: 'BaseResponse',
    };
  } catch (error: any) {
    console.error('Forget password error:', error);
    return {
      statusCode: 500,
      success: false,
      message: 'Failed to process password reset request',
      __typename: 'BaseResponse',
    };
  }
};