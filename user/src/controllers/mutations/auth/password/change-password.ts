import { Repository } from "typeorm";
import { Context } from "../../../../context";
import { User } from "../../../../entities/user.entity";
import {
  BaseResponse,
  ErrorResponse,
  MutationChangePasswordArgs,
} from "../../../../types";
import CompareInfo from "../../../../utils/bcrypt/compare-info";
import HashInfo from "../../../../utils/bcrypt/hash-info";
import { changePasswordSchema } from "../../../../utils/data-validation/auth/auth";

/**
 * Allows the user to change their password.
 * - Verifies the old password.
 * - Validates the new password.
 * - Updates the password in the database.
 * @param _ - Unused GraphQL parent argument
 * @param args - Password change arguments (oldPassword, newPassword)
 * @param context - Application context containing AppDataSource and user
 * @returns Promise<BaseResponse | ErrorResponse> change result with status and message
 */
export const changePassword = async (
  _: any,
  args: MutationChangePasswordArgs,
  { AppDataSource, user }: Context
): Promise<BaseResponse | ErrorResponse> => {
  const { oldPassword, newPassword } = args;

  try {
    // Validate input data using Zod schema for the change password operation
    const validationResult = await changePasswordSchema.safeParseAsync({
      oldPassword,
      newPassword,
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

    // Use the user from the context (already authenticated user)
    if (!user) {
      return {
        statusCode: 401,
        success: false,
        message: "You're not authenticated",
        __typename: "BaseResponse",
      };
    }

    // Retrieve the user from the database (no need to fetch again if we already have it in context)
    const userRepository: Repository<User> = AppDataSource.getRepository(User);

    // Fetch the full User entity for authenticated user
    const authenticatedUser = await userRepository.findOne({
      where: { id: user.id },
    });

    if (!authenticatedUser) {
      return {
        statusCode: 404,
        success: false,
        message: "Authenticated user not found in database",
        __typename: "BaseResponse",
      };
    }

    // Check if the old password matches the stored hashed password
    const isOldPasswordValid = await CompareInfo(
      oldPassword,
      authenticatedUser.password
    );

    if (!isOldPasswordValid) {
      return {
        statusCode: 400,
        success: false,
        message: "Old password is incorrect",
        __typename: "BaseResponse",
      };
    }

    // Hash the new password for secure storage
    const hashedNewPassword = await HashInfo(newPassword);

    // Update the user's password in the database
    authenticatedUser.password = hashedNewPassword;
    await userRepository.save(authenticatedUser);

    // Return success response
    return {
      statusCode: 200,
      success: true,
      message: "Password changed successfully",
      __typename: "BaseResponse",
    };
  } catch (error: any) {
    // Log the error for debugging purposes
    console.error("Error changing password:", error);

    // Return a detailed error message if available, otherwise a generic one
    return {
      statusCode: 500,
      success: false,
      message: error.message || "Internal server error",
      __typename: "BaseResponse",
    };
  }
};
