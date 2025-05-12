import { Repository } from "typeorm";
import { Context } from "../../../../context";
import { User } from "../../../../entities/user.entity";
import {
  getUserInfoByEmailInRedis,
  setUserInfoByEmailInRedis,
} from "../../../../helper/redis/utils/user/user-session-manage";
import {
  BaseResponseOrError,
  MutationChangePasswordArgs,
} from "../../../../types";
import CompareInfo from "../../../../utils/bcrypt/compare-info";
import HashInfo from "../../../../utils/bcrypt/hash-info";
import { changePasswordSchema } from "../../../../utils/data-validation";

/**
 * Allows an authenticated user to change their password.
 *
 * Steps:
 * - Validates input using Zod schema
 * - Ensures the user is authenticated
 * - Verifies the old password
 * - Hashes the new password
 * - Updates the password in the database
 *
 * @param _ - Unused GraphQL parent argument
 * @param args - Arguments for change password (oldPassword and newPassword)
 * @param context - GraphQL context with AppDataSource, user info and redis
 * @returns Promise<BaseResponseOrError> - Response status and message
 */
export const changePassword = async (
  _: any,
  args: MutationChangePasswordArgs,
  { AppDataSource, user, redis }: Context
): Promise<BaseResponseOrError> => {
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

    // Initialize repositories for User entity
    const userRepository: Repository<User> = AppDataSource.getRepository(User);

    // Check Redis for cached user's data
    let userData;
    userData = getUserInfoByEmailInRedis(user.email);

    if (!userData) {
      // Fetch user from database
      const dbUser = await userRepository.findOne({
        where: { email: user.email },
        relations: ["role"],
      });

      if (!dbUser) {
        return {
          statusCode: 400,
          success: false,
          message: "Authenticated user not found in database",
          __typename: "ErrorResponse",
        };
      }

      userData = {
        ...dbUser,
        role: dbUser.role.name,
      };
    }

    // Check if the old password matches the stored hashed password
    const isOldPasswordValid = await CompareInfo(
      oldPassword,
      userData.password
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
    userData.password = hashedNewPassword;

    await userRepository.update(userData.id, {
      password: hashedNewPassword,
    });

    const roleName =
      typeof userData.role === "string"
        ? userData.role
        : (userData.role as { name: string }).name;

    const userSessionByEmail = {
      id: userData.id,
      email: userData.email,
      firstName: userData.firstName,
      lastName: userData.lastName,
      role: roleName,
      gender: userData.gender,
      emailVerified: userData.emailVerified,
      isAccountActivated: userData.isAccountActivated,
      password: userData.password,
    };

    // Cache user's info by email in Redis
    await setUserInfoByEmailInRedis(user.email, userSessionByEmail);

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
