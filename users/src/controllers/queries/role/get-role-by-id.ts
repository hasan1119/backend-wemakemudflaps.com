import CONFIG from "../../../config/config";
import { Context } from "../../../context";
import {
  getRoleInfoByRoleIdFromRedis,
  getTotalUserCountByRoleIdFromRedis,
  setRoleInfoByRoleIdInRedis,
  setTotalUserCountByRoleIdInRedis,
} from "../../../helper/redis";
import {
  GetRoleByIdResponseOrError,
  QueryGetRoleByIdArgs,
} from "../../../types";
import { idSchema } from "../../../utils/data-validation";
import {
  checkUserAuth,
  checkUserPermission,
  countUsersWithRole,
  getRoleById as getRoleByIdService,
} from "../../services";

/**
 * Handles retrieving a user role by its ID with validation and permission checks.
 *
 * Workflow:
 * 1. Verifies user authentication and checks permission to view roles.
 * 2. Validates input role ID using Zod schema.
 * 3. Attempts to retrieve role data from Redis for performance optimization.
 * 4. Fetches role data from the database if not found in Redis and caches it.
 * 5. Retrieves the total user count for the role, preferring Redis cache.
 * 6. Fetches user count from the database if not cached and stores it in Redis.
 * 7. Returns a success response with role data and user count or an error if validation, permission, or retrieval fails.
 *
 * @param _ - Unused parent parameter for GraphQL resolver.
 * @param args - Input arguments containing the role ID.
 * @param context - GraphQL context containing authenticated user information.
 * @returns A promise resolving to a GetRoleByIdResponseOrError object containing status, message, role data, and errors if applicable.
 */
export const getRoleById = async (
  _: any,
  args: QueryGetRoleByIdArgs,
  { user }: Context
): Promise<GetRoleByIdResponseOrError> => {
  try {
    // Verify user authentication
    const authResponse = checkUserAuth(user);
    if (authResponse) return authResponse;

    // Check if user has permission to view roles
    const canRead = await checkUserPermission({
      action: "canRead",
      entity: "role",
      user,
    });

    if (!canRead) {
      return {
        statusCode: 403,
        success: false,
        message: "You do not have permission to view role info",
        __typename: "BaseResponse",
      };
    }

    // Validate input role ID with Zod schema
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

    // Attempt to retrieve cached role data from Redis
    let roleData;

    roleData = await getRoleInfoByRoleIdFromRedis(id);

    if (roleData.deletedAt) {
      return {
        statusCode: 404,
        success: false,
        message: `Role not found with this id: ${id} or has been deleted`,
        __typename: "BaseResponse",
      };
    }

    if (!roleData) {
      // On cache miss, fetch role data from database
      const dbRole = await getRoleByIdService(id);

      if (!dbRole) {
        return {
          statusCode: 404,
          success: false,
          message: `Role not found with this id: ${id} or has been deleted`,
          __typename: "BaseResponse",
        };
      }

      // Cache role data in Redis
      roleData = await setRoleInfoByRoleIdInRedis(id, dbRole);
    }

    // Retrieve total user count for the role from Redis
    let assignedUserCount = await getTotalUserCountByRoleIdFromRedis(id);

    if (!assignedUserCount) {
      // On cache miss, fetch user count from database
      assignedUserCount = await countUsersWithRole(id);

      // Cache user count in Redis
      await setTotalUserCountByRoleIdInRedis(id, assignedUserCount);
    }

    return {
      statusCode: 200,
      success: true,
      message: "Role fetched successfully",
      role: {
        ...roleData,
        assignedUserCount,
      },
      __typename: "RoleResponse",
    };
  } catch (error: any) {
    console.error("Error retrieving role:", {
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
