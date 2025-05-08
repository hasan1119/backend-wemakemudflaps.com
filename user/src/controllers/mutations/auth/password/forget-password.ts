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
  const { getSession, setSession, deleteSession } = redis;

  // Get the User repository
  const userRepository: Repository<User> = AppDataSource.getRepository(User);

  try {
    // Validate the provided email using Zod schema
    const validationResult = await emailSchema.safeParseAsync({ email });

    // If validation fails, return detailed error messages with field names
    if (!validationResult.success) {
      const errorMessages = validationResult.error.errors.map((error) => ({
        field: error.path.join('.'), // Converts the path array to a string
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

    // Check Redis for cached user's email
    let user;

    user = await getSession(getUserInfoByEmailCacheKey(email));

    if (!user) {
      // Check for existing user with the same email
      user = await userRepository.findOne({
        where: { email },
        // select: ['email', 'resetPasswordToken'],
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

    // Cooldown key check: prevent multiple emails in short time
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

    // Generate a unique reset token (UUID)
    const resetToken = uuidv4();
    user.resetPasswordToken = resetToken;

    // Save the token to the user record
    await userRepository.save(user);

    // Create the reset password link using the token
    const resetLink = `${CONFIG.FRONTEND_URL}/reset-password?token=${resetToken}`;

    // Prepare email contents
    const subject = 'Password Reset Request';
    const text = `Please use the following link to reset your password: ${resetLink}`;
    const html = `<p>Please use the following link to reset your password: <a href="${resetLink}">${resetLink}</a></p>`;

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
        message: 'Failed to send password reset email',
        __typename: 'BaseResponse',
      };
    }
    // Set last sent time in Redis with 60 seconds TTL
    await setSession(lastSentKey, Date.now().toString(), 60);

// Cache user's info by email in Redis with configurable TTL(default 30 days of redis session because of the env)
      await setSession(getUserInfoByEmailCacheKey(email), {
        id: user.id,
        firstName: user.firstName,
        lastName: user.lastName,
        email: user.email,
        password: user.password,
        gender: user.gender,
        role: user.role.name,
        resetPasswordToken: restToken,
emailVerified: user.emailVerified,
				  isAccountActivated: user.isAccountActivated
      });

    // Return success response
    return {
      statusCode: 200,
      success: true,
      message: 'Password reset email sent successfully',
      __typename: 'BaseResponse',
    };
  } catch (error: any) {
    // Log and return a generic error response
    console.error('Forget password error:', error);
    return {
      statusCode: 500,
      success: false,
      message: 'Failed to process password reset request',
      __typename: 'BaseResponse',
    };
  }
};
