import CONFIG from "../../../config/config";
import { Context } from "../../../context";
import {
  getUserInfoByUserIdFromRedis,
  setUserInfoByUserIdInRedis,
} from "../../../helper/redis";
import { GetProfileResponseOrError } from "../../../types";
import { mapUserToResponseById } from "../../../utils/mapper";
import { checkUserAuth, getUserById } from "../../services";

/**
 * Handles retrieval of the authenticated user's profile data.
 *
 * Workflow:
 * 1. Verifies user authentication.
 * 2. Attempts to retrieve user data from Redis for performance optimization.
 * 3. On cache miss, fetches user data from the database by ID.
 * 4. Maps user data to response format, including role information.
 * 5. Caches user data in Redis for future requests.
 * 6. Returns a success response with user profile or an error if authentication, user lookup, or retrieval fails.
 *
 * @param _ - Unused parent parameter for GraphQL resolver.
 * @param __ - Unused arguments parameter for GraphQL resolver.
 * @param context - GraphQL context containing authenticated user information.
 * @returns A promise resolving to a GetProfileResponseOrError object containing status, message, user data, and errors if applicable.
 */
export const getProfile = async (
  _: any,
  __: any,
  { user }: Context
): Promise<GetProfileResponseOrError> => {
  try {
    // Verify user authentication
    const authResponse = checkUserAuth(user);
    if (authResponse) return authResponse;

    // Attempt to retrieve cached user data from Redis
    let userExist;

    userExist = await getUserInfoByUserIdFromRedis(user.id);

    // Check if user exists
    if (!userExist) {
      // On cache miss, fetch user data from database
      userExist = await getUserById(user.id);

      if (!userExist) {
        return {
          statusCode: 404,
          success: false,
          message: "User not found",
          __typename: "BaseResponse",
        };
      }
      // Map user data to response format
      userExist = await mapUserToResponseById(userExist);

      // Cache user data in Redis
      await setUserInfoByUserIdInRedis(userExist.id, userExist);
    }

    return {
      statusCode: 200,
      success: true,
      message: "Profile fetched successfully",
      user: userExist,
      __typename: "UserResponse",
    };
  } catch (error: any) {
    console.error("Error to get profile:", error);

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
