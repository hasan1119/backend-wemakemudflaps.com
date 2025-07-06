import CONFIG from "../../../config/config";
import { Context } from "../../../context";
import {
  getRoleInfoByRoleNameFromRedis,
  getUserInfoByUserIdFromRedis,
  getUserPermissionsByUserIdFromRedis,
  setRoleInfoByRoleNameInRedis,
  setUserInfoByUserIdInRedis,
  setUserPermissionsByUserIdInRedis,
} from "../../../helper/redis";
import {
  GetPermissionsResponseOrError,
  QueryGetAllPermissionsByUserIdArgs,
} from "../../../types";
import { idSchema } from "../../../utils/data-validation";
import { mapUserToResponseById } from "../../../utils/mapper";
import {
  checkUserAuth,
  checkUserPermission,
  findRolesByNames,
  getUserById,
  getUserPersonalizedPermission,
} from "../../services";

/**
 * Handles fetching all permissions for a specified user by their ID.
 *
 * Workflow:
 * 1. Verifies user authentication and checks read permission for permissions.
 * 2. Validates input user ID using Zod schema.
 * 3. Retrieves target user data from Redis or database.
 * 4. Fetches personalized permissions from Redis or database, caching them if needed.
 * 5. Retrieves role information for the authenticated user's roles from Redis or database.
 * 6. Caches any newly fetched roles in Redis.
 * 7. Returns a response with personalized and role-based permissions or an error if validation, permission, or data retrieval fails.
 *
 * @param _ - Unused parent parameter for GraphQL resolver.
 * @param args - Input arguments containing the user ID.
 * @param context - GraphQL context containing authenticated user information.
 * @returns A promise resolving to a GetPermissionsResponseOrError object containing status, message, permissions, and errors if applicable.
 */
export const getAllPermissionsByUserId = async (
  _: any,
  args: QueryGetAllPermissionsByUserIdArgs,
  { user }: Context
): Promise<GetPermissionsResponseOrError> => {
  try {
    // Verify user authentication
    const authResponse = checkUserAuth(user);
    if (authResponse) return authResponse;

    // Check if user has permission to view permissions
    const canReadUserPermission = await checkUserPermission({
      action: "canRead",
      entity: "permission",
      user,
    });

    if (!canReadUserPermission) {
      return {
        statusCode: 403,
        success: false,
        message: "You do not have permission to view permissions",
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

    // Verify target user exists
    let targetUser;

    targetUser = await getUserInfoByUserIdFromRedis(id);

    if (!targetUser) {
      // On cache miss, fetch user data from database
      targetUser = await getUserById(id);

      if (!targetUser) {
        return {
          statusCode: 404,
          success: false,
          message: "User not found or has been deleted",
          __typename: "ErrorResponse",
        };
      }

      targetUser = await mapUserToResponseById(targetUser);

      // Cache user data in Redis
      await setUserInfoByUserIdInRedis(id, targetUser);
    }

    // Retrieve personalized permissions
    let personalizedPermissions;

    personalizedPermissions = await getUserPermissionsByUserIdFromRedis(id);

    if (!personalizedPermissions) {
      // On cache miss, fetch personalized permissions from database
      personalizedPermissions = await getUserPersonalizedPermission(id);

      // Cache permissions in Redis
      await setUserPermissionsByUserIdInRedis(id, personalizedPermissions);
    }

    // Retrieve role information for authenticated user's roles
    let rolesInfoByName;

    rolesInfoByName = await Promise.all(
      targetUser.roles.map(async (role) => {
        const roleInfo = await getRoleInfoByRoleNameFromRedis(role.name);
        return roleInfo ?? null; // Return null if not found
      })
    );

    // Identify missing roles not found in Redis
    const missingRoleNames = targetUser.roles.filter(
      (_, index) => rolesInfoByName[index] === null
    );

    if (missingRoleNames.length > 0) {
      // Fetch missing roles from database
      const dbRoles = await findRolesByNames(missingRoleNames);

      // Merge fetched roles into rolesInfoByName
      rolesInfoByName = rolesInfoByName.map(
        (roleInfo, index) =>
          roleInfo ??
          dbRoles.find((dbRole) => dbRole.name === targetUser.roles[index])
      );

      // Cache newly fetched roles in Redis
      await Promise.all(
        dbRoles.map((dbRole) =>
          setRoleInfoByRoleNameInRedis(dbRole.name, dbRole)
        )
      );
    }

    // Flatten role permissions for response
    rolesInfoByName.flat();

    return {
      statusCode: 200,
      success: true,
      message: "Permissions fetched successfully",
      personalizedPermissions,
      rolePermissions: rolesInfoByName,
      __typename: "PersonalizedWithRolePermissionResponse",
    };
  } catch (error: any) {
    console.error("Error fetching permissions:", {
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
