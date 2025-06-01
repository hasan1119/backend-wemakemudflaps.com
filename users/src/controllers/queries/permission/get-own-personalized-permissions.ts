import CONFIG from "../../../config/config";
import { Context } from "../../../context";
import { getUserPermissionsByUserIdFromRedis } from "../../../helper/redis";
import { GetPersonalizedPermissionsResponseOrError } from "../../../types";
import { checkUserAuth } from "../../services";

/**
 * Handles fetching the personalized permissions of the authenticated user.
 *
 * Workflow:
 * 1. Verifies user authentication status.
 * 2. Retrieves cached permissions from Redis for the authenticated user.
 * 3. Checks if any personalized permissions exist for the user.
 * 4. Returns a success response with the permissions list or an error if no permissions are found or if authentication fails.
 * or retrieval fails.
 *
 * @param _ - Unused parent parameter for GraphQL resolver.
 * @param __ - Unused arguments (no input arguments required).
 * @param context - GraphQL context containing authenticated user information.
 * @returns A promise resolving to a GetPersonalizedPermissionsResponseOrError object containing status, message, permissions, or errors if applicable.
 */
export const getOwnPersonalizedPermissions = async (
  _: any,
  __: any,
  { user }: Context
): Promise<GetPersonalizedPermissionsResponseOrError> => {
  try {
    // Verify user authentication
    const authResponse = checkUserAuth(user);
    if (authResponse) return authResponse;

    // Attempt to retrieve cached permissions from Redis
    let userPermissionData;

    userPermissionData = await getUserPermissionsByUserIdFromRedis(user.id);

    // Check if permissions exist
    if (!userPermissionData.length) {
      return {
        statusCode: 404,
        success: false,
        message: "No personalized permission not found of your's",
        __typename: "BaseResponse",
      };
    }

    // Return permissions in response
    return {
      statusCode: 200,
      success: true,
      message: "Own personalized permissions fetched successfully",
      permissions: userPermissionData,
      __typename: "PermissionsResponse",
    };
  } catch (error: any) {
    console.error("Error fetching own permissions:", {
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
