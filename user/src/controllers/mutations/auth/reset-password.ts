import { Repository } from "typeorm";
import { Context } from "../../../context";
import { User } from "../../../entities/user.entity";
import { BaseResponse, MutationResetPasswordArgs } from "../../../types";
import HashInfo from "../../../utils/bcrypt/hash-info";
import { resetPasswordSchema } from "../../../utils/data-validation/auth/auth";

/**
 * Handles resetting the user's password using a token.
 * - Validates input (token and new password).
 * - Finds the user with the given token.
 * - Hashes the new password and updates the user's password.
 * - Clears the reset token after successful update.
 *
 * @param _ - Unused GraphQL parent argument
 * @param args - Contains token and new password
 * @param context - Application context with AppDataSource
 * @returns Promise<BaseResponse> - Response status and message
 */
export const resetPassword = async (
  _: any,
  args: MutationResetPasswordArgs,
  context: Context
): Promise<BaseResponse> => {
  const { AppDataSource } = context;
  const { token, newPassword } = args;

  // Get the User repository
  const userRepository: Repository<User> = AppDataSource.getRepository(User);

  try {
    // Validate input using Zod schema
    const validationResult = await resetPasswordSchema.safeParseAsync({
      token,
      newPassword,
    });

    // Return the first validation error message if validation fails
    if (!validationResult.success) {
      const errorMessage = validationResult.error.errors[0].message;
      return {
        statusCode: 400,
        success: false,
        message: errorMessage,
        __typename: "BaseResponse",
      };
    }

    // Find user by reset password token
    const user = await userRepository.findOne({
      where: { resetPasswordToken: token },
    });

    if (!user) {
      return {
        statusCode: 400,
        success: false,
        message: "Invalid or expired password reset token.",
        __typename: "BaseResponse",
      };
    }

    // Hash the new password before saving
    const hashedPassword = await HashInfo(newPassword);
    user.password = hashedPassword;
    user.resetPasswordToken = null; // Clear token after successful reset

    await userRepository.save(user);

    return {
      statusCode: 200,
      success: true,
      message: "Password reset successfully.",
      __typename: "BaseResponse",
    };
  } catch (error: Error | any) {
    console.error("Reset password error:", error);
    return {
      statusCode: 500,
      success: false,
      message: "Failed to reset password.",
      __typename: "BaseResponse",
    };
  }
};
