import CONFIG from "../../../config/config";
import { Context } from "../../../context";
import {
  getUserInfoByUserIdFromRedis,
  setUserInfoByUserIdInRedis,
} from "../../../helper/redis";
import { QueryGetUserByIdArgs } from "../../../types";
import { idSchema } from "../../../utils/data-validation";
import { mapUserToResponseById } from "../../../utils/mapper";
import {
  checkUserAuth,
  checkUserPermission,
  getUserById as getUserWithId,
} from "../../services";
import { GetUserByIdResponseOrError } from "./../../../types";

/**
 * Handles retrieval of a user's profile data by their ID, including role and permissions.
 *
 * Workflow:
 * 1. Verifies user authentication and checks read permission for user data.
 * 2. Validates input user ID using Zod schema.
 * 3. Attempts to retrieve user data from Redis for performance optimization.
 * 4. On cache miss, fetches user data from the database by ID.
 * 5. Maps user data to response format, including role and permissions.
 * 6. Caches user data in Redis for future requests.
 * 7. Returns a success response with user profile or an error if validation, permission, or retrieval fails.
 *
 * @param _ - Unused parent parameter for GraphQL resolver.
 * @param args - Input arguments containing the user ID.
 * @param context - GraphQL context containing authenticated user information.
 * @returns A promise resolving to a GetUserByIdResponseOrError object containing status, message, user data, and errors if applicable.
 */
export const getUserById = async (
  _: any,
  args: QueryGetUserByIdArgs,
  { user }: Context
): Promise<GetUserByIdResponseOrError> => {
  try {
    // Verify user authentication
    const authResponse = checkUserAuth(user);
    if (authResponse) return authResponse;

    // Check if user has permission to view user data
    const canRead = await checkUserPermission({
      action: "canRead",
      entity: "user",
      user,
    });

    if (!canRead) {
      return {
        statusCode: 403,
        success: false,
        message: "You do not have permission to view user info",
        __typename: "BaseResponse",
      };
    }

    // Validate input user ID with Zod schema
    const validationResult = await idSchema.safeParseAsync(args);

    // Return detailed validation errors if input is invalid
    if (!validationResult.success) {
      const errorMessages = validationResult.error.errors.map((error) => ({
        field: error.path.join("."), // Join path array to string for field identification
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

    const { id } = args;

    // Attempt to retrieve cached user data from Redis
    let userData;

    userData = await getUserInfoByUserIdFromRedis(id);

    // Check if user exists
    if (!userData) {
      // On cache miss, fetch user data from database
      userData = await getUserWithId(id);

      if (!userData) {
        return {
          statusCode: 404,
          success: false,
          message: "User not found",
          __typename: "BaseResponse",
        };
      }

      // Map user data to response format
      userData = await mapUserToResponseById(userData.id);

      // Cache user data in Redis
      await setUserInfoByUserIdInRedis(userData.id, userData);
    }

    return {
      statusCode: 200,
      success: true,
      message: "User fetched successfully",
      user: userData,
      __typename: "UserResponse",
    };
  } catch (error: any) {
    console.error("Error fetching user by ID:", {
      message: error.message,
    });

    return {
      statusCode: 500,
      success: false,
      message: `${
        CONFIG.NODE_ENV === "production"
          ? "Something went wrong, please try again."
          : error.message || "Internal server error"
      }`,
      __typename: "BaseResponse",
    };
  }
};
