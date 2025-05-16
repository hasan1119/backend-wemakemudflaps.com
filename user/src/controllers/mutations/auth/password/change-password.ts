import { Repository } from "typeorm";
import { Context } from "../../../../context";
import { User } from "../../../../entities/user.entity";
import {
  getUserInfoByEmailInRedis,
  setUserInfoByEmailInRedis,
} from "../../../../helper/redis";
import {
  BaseResponseOrError,
  CachedUserSessionByEmailKeyInputs,
  MutationChangePasswordArgs,
} from "../../../../types";
import CompareInfo from "../../../../utils/bcrypt/compare-info";
import HashInfo from "../../../../utils/bcrypt/hash-info";
import { changePasswordSchema } from "../../../../utils/data-validation";
import { checkUserAuth } from "../../../../utils/session-check/session-check";

/**
 * Allows an authenticated user to change their password.
 *
 * Steps:
 * - Validates input using Zod schema
 * - Checks Redis for user data to optimize performance via caching
 * - Ensures the user is authenticated
 * - Verifies the old password
 * - Hashes the new password
 * - Updates the password in the database
 * - Updates necessary user data in redis for future request
 *
 * @param _ - Unused GraphQL parent argument
 * @param args - Arguments for change password (oldPassword and newPassword)
 * @param context - GraphQL context with AppDataSource and user info
 * @returns Promise<BaseResponseOrError> - Response status and message
 */
export const changePassword = async (
  _: any,
  args: MutationChangePasswordArgs,
  { AppDataSource, user }: Context
): Promise<BaseResponseOrError> => {
  const { oldPassword, newPassword } = args;

  try {
    // Check user authentication
    const authResponse = checkUserAuth(user);
    if (authResponse) return authResponse;

    // Validate input data using Zod schema
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

    // Initialize repositories for User entity
    const userRepository: Repository<User> = AppDataSource.getRepository(User);

    // Check Redis for cached user's data
    let userData;

    userData = await getUserInfoByEmailInRedis(user.email);

    if (!userData) {
      // Cache miss: Fetch user from database
      const dbUser = await userRepository.findOne({
        where: { id: user.id, email: user.email },
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

    // Initiate the empty variable for the user role
    let roleName;

    if (typeof userData.role !== "string") {
      roleName = userData.role.name; // Safe update
    } else {
      roleName = userData.role; // Direct assignment
    }

    const userSessionByEmail: CachedUserSessionByEmailKeyInputs = {
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

    return {
      statusCode: 200,
      success: true,
      message: "Password changed successfully",
      __typename: "BaseResponse",
    };
  } catch (error: any) {
    console.error("Error changing password:", error);

    return {
      statusCode: 500,
      success: false,
      message: error.message || "Internal server error",
      __typename: "BaseResponse",
    };
  }
};
