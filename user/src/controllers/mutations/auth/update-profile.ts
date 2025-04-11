import { Repository } from "typeorm";
import { Context } from "../../../context";
import { User } from "../../../entities/user.entity";
import {
  BaseResponse,
  MutationUpdateProfileArgs,
  UserProfileUpdateResponse,
} from "../../../types";
import { updateUserSchema } from "../../../utils/data-validation/auth/auth";
import EncodeToken from "../../../utils/jwt/encode-token";

/**
 * Allows the user to update their account information.
 * - Validates the input data.
 * - Updates the user's name, email, password, gender, and role.
 * - Hashes the password if it is updated.
 * @param _ - Unused GraphQL parent argument
 * @param args - User update arguments ( firstName, lastName, email, gender )
 * @param context - Application context containing AppDataSource and user
 * @returns Promise<UserUpdateResponse | BaseResponse> - User update result with status and message
 */
export const updateProfile = async (
  _: any,
  args: MutationUpdateProfileArgs,
  { AppDataSource, user }: Context
): Promise<UserProfileUpdateResponse | BaseResponse> => {
  const { firstName, lastName, email, gender } = args;

  try {
    // Validate input data using Zod schema for user update
    const validationResult = await updateUserSchema.safeParseAsync({
      firstName,
      lastName,
      email,
      gender,
    });

    // If validation fails, return the first error message
    if (!validationResult.success) {
      const errorMessage = validationResult.error.errors[0].message;
      return {
        statusCode: 400,
        success: false,
        message: errorMessage,
        __typename: "BaseResponse",
      };
    }

    // Ensure the user is authenticated
    if (!user) {
      return {
        statusCode: 401,
        success: false,
        message: "User not authenticated",
        __typename: "BaseResponse",
      };
    }

    // Retrieve the user from the database (already authenticated user)
    const userRepository: Repository<User> = AppDataSource.getRepository(User);
    const existingUser = await userRepository.findOne({
      where: { id: user.id },
    });

    if (!existingUser) {
      return {
        statusCode: 404,
        success: false,
        message: "User not found",
        __typename: "BaseResponse",
      };
    }

    // Update user fields only if provided
    if (firstName) existingUser.firstName = firstName;
    if (lastName) existingUser.lastName = lastName;
    if (email) existingUser.email = email;
    if (gender) existingUser.gender = gender;

    // Save updated user data
    await userRepository.save(existingUser);

    // Regenerate the JWT token after the update
    const token = await EncodeToken(
      existingUser.id,
      existingUser.email,
      existingUser.firstName,
      existingUser.lastName,
      existingUser.role.name,
      "30d" // Set the token expiration time
    );

    // Return success response
    return {
      statusCode: 200,
      success: true,
      token,
      message: "User updated successfully",
      __typename: "UserProfileUpdateResponse",
    };
  } catch (error: any) {
    // Log the error for debugging purposes
    console.error("Error updating user:", error);

    // Return a detailed error message if available, otherwise a generic one
    return {
      statusCode: 500,
      success: false,
      message: error.message || "Internal server error",
      __typename: "BaseResponse",
    };
  }
};
