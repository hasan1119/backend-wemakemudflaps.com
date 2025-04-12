import { Repository } from "typeorm";
import { Context } from "../../../../context";
import { User } from "../../../../entities/user.entity";
import {
  BaseResponse,
  ErrorResponse,
  MutationUpdateProfileArgs,
  UserProfileUpdateResponse,
} from "../../../../types";
import { updateProfileSchema } from "../../../../utils/data-validation/auth/auth";
import EncodeToken from "../../../../utils/jwt/encode-token";

/**
 * Allows the user to update their account information.
 * - Validates the input data.
 * - Updates the user's name, email, password, gender, and role.
 * - Hashes the password if it is updated.
 * - Redis cache for user data after update in database.
 * - Caches user and role data in Redis for future requests.
 * @param _ - Unused GraphQL parent argument
 * @param args - User update arguments ( firstName, lastName, email, gender )
 * @param context - Application context containing AppDataSource, user and redis
 * @returns Promise<UserUpdateResponse | ErrorResponse | BaseResponse> - User profile update result with status and message
 */
export const updateProfile = async (
  _: any,
  args: MutationUpdateProfileArgs,
  { AppDataSource, user, redis }: Context
): Promise<UserProfileUpdateResponse | ErrorResponse | BaseResponse> => {
  const { firstName, lastName, email, gender } = args;
  const { setSession } = redis;

  try {
    // Validate input data using Zod schema for update profile
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
        message: "Validation failed.",
        errors: errorMessages,
        __typename: "ErrorResponse",
      };
    }

    // Ensure the user is authenticated
    if (!user) {
      return {
        statusCode: 401,
        success: false,
        message: "You're not authenticated",
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

    // Cache permissions in Redis with configurable TTL
    const userCacheKey = `user-${user.id}`;
    const TTL = 2592000; // 30 days in seconds

    try {
      await setSession(
        userCacheKey,
        {
          id: existingUser.id,
          firstName: existingUser.firstName,
          lastName: existingUser.lastName,
          email: existingUser.email,
          role: existingUser.role?.name || null,
        },
        TTL
      );
    } catch (redisError) {
      console.warn("Redis error caching profile:", redisError);
    }

    // Return success response
    return {
      statusCode: 200,
      success: true,
      token,
      message: "Profile updated successfully",
      __typename: "UserProfileUpdateResponse",
    };
  } catch (error: any) {
    // Log the error for debugging purposes
    console.error("Error updating user profile:", error);

    // Return a detailed error message if available, otherwise a generic one
    return {
      statusCode: 500,
      success: false,
      message: error.message || "Internal server error",
      __typename: "BaseResponse",
    };
  }
};
