import { Repository } from "typeorm";
import { Context } from "../../../context";
import { User } from "../../../entities/user.entity";
import { getSingleUserCacheKey } from "../../../helper/redis/session-keys";
import {
  MutationUpdateProfileArgs,
  UserProfileUpdateResponseOrError,
} from "../../../types";
import { updateProfileSchema } from "../../../utils/data-validation/auth/auth";
import EncodeToken from "../../../utils/jwt/encode-token";

/**
 * Allows the user to update their account information.
 *
 * Steps:
 * - Validates input using Zod schema
 * - Updates the user's name, email, password, gender, and role
 * - Hashes the password if it is updated
 * - Redis cache for user data after update in database
 * - Caches user and role data in Redis for future requests
 *
 * @param _ - Unused GraphQL parent argument
 * @param args - Arguments for update user profile ( firstName, lastName, email, gender )
 * @param context - Application context containing AppDataSource, user and redis
 * @returns Promise<UserProfileUpdateResponseOrError> - User profile update result with status and message
 */
export const updateProfile = async (
  _: any,
  args: MutationUpdateProfileArgs,
  { AppDataSource, user, redis }: Context
): Promise<UserProfileUpdateResponseOrError> => {
  const { firstName, lastName, email, gender } = args;
  const { setSession, getSession } = redis;

  try {
    // Ensure the user is authenticated
    if (!user) {
      return {
        statusCode: 401,
        success: false,
        message: "You're not authenticated",
        __typename: "ErrorResponse",
      };
    }

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
        message: "Validation failed",
        errors: errorMessages,
        __typename: "ErrorResponse",
      };
    }

    // Retrieve the user from the database (already authenticated user)
    const userRepository: Repository<User> = AppDataSource.getRepository(User);

    // Check Redis for cached user's data
    let userData;

    userData = await getSession(getSingleUserCacheKey(user.id));

    if (!userData) {
      // Cache miss: Fetch user from database
      userData = await userRepository.findOne({
        where: { id: user.id },
      });

      if (!userData) {
        return {
          statusCode: 404,
          success: false,
          message: "Authenticated user not found in database",
          __typename: "ErrorResponse",
        };
      }
    }

    // Update user fields only if provided
    if (firstName) userData.firstName = firstName;
    if (lastName) userData.lastName = lastName;
    if (email) userData.email = email;
    if (gender) userData.gender = gender;

    // preserve role for session
    const preservedRole = user.role;
    // Delete role from the userData to update the user info properly
    delete userData.role;

    // Save updated user data
    await userRepository.save(userData);

    // Regenerate the JWT token after the update
    const token = await EncodeToken(
      userData.id,
      userData.email,
      userData.firstName,
      userData.lastName,
      preservedRole,
      "30d" // Set the token expiration time
    );

    // Cache user data in Redis with configurable TTL(default 30 days of redis session because of the env)
    await setSession(getSingleUserCacheKey(userData.id), {
      id: userData.id,
      firstName: userData.firstName,
      lastName: userData.lastName,
      email: userData.email,
      role: preservedRole || null,
    });

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
      __typename: "ErrorResponse",
    };
  }
};
