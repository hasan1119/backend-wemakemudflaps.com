import CONFIG from "../../../config/config";
import { Context } from "../../../context";
import { RolePermission } from "../../../entities";
import {
  clearAllRoleSearchCache,
  getRoleNameExistFromRedis,
  getUserInfoByUserIdFromRedis,
  setRoleInfoByRoleIdInRedis,
  setRoleInfoByRoleNameInRedis,
  setRoleNameExistInRedis,
  setUserInfoByUserIdInRedis,
} from "../../../helper/redis";
import {
  CreateRoleResponseOrError,
  MutationCreateUserRoleArgs,
} from "../../../types";
import { PERMISSIONS, userRoleSchema } from "../../../utils/data-validation";
import { mapUserToResponseById } from "../../../utils/mapper";
import {
  checkUserAuth,
  checkUserPermission,
  createRole,
  findRoleByName,
  getUserById,
} from "../../services";

/**
 * Handles the creation of a new user role in the system.
 *
 * Workflow:
 * 1. Verifies user authentication and permission to create roles.
 * 2. Validates input (name, description, defaultPermissions, system protections) using Zod schema.
 * 3. Checks Redis for existing role name to prevent duplicates.
 * 4. Queries the database for role existence if not found in Redis.
 * 5. Normalizes provided permissions to include all required permissions with defaults.
 * 6. Creates the role in the database with audit information from the authenticated user.
 * 7. Caches the new role and its name existence in Redis for future requests.
 * 8. Returns a success response or error if validation, permission, or creation fails.
 *
 * @param _ - Unused parent parameter for GraphQL resolver.
 * @param args - Input arguments containing role name, description, permissions, and system protections.
 * @param context - GraphQL context containing authenticated user information.
 * @returns A promise resolving to a BaseResponseOrError object containing status, message, and errors if applicable.
 */
export const createUserRole = async (
  _: any,
  args: MutationCreateUserRoleArgs,
  { user }: Context
): Promise<CreateRoleResponseOrError> => {
  try {
    // Verify user authentication
    const authResponse = checkUserAuth(user);
    if (authResponse) return authResponse;

    // Attempt to retrieve cached user data from Redis
    let userData;

    userData = await getUserInfoByUserIdFromRedis(user.id);

    // Check if user exists
    if (!userData) {
      // On cache miss, fetch user data from database
      userData = await getUserById(user.id);

      if (!userData) {
        return {
          statusCode: 404,
          success: false,
          message: "User not found",
          __typename: "BaseResponse",
        };
      }

      // Map user data to response format
      userData = await mapUserToResponseById(userData);

      // Cache user data in Redis
      await setUserInfoByUserIdInRedis(userData.id, userData);
    }

    // Check if user has permission to create a role
    const canCreate = await checkUserPermission({
      action: "canCreate",
      entity: "role",
      user,
    });

    if (!canCreate) {
      return {
        statusCode: 403,
        success: false,
        message: "You do not have permission to create role",
        __typename: "BaseResponse",
      };
    }

    // Validate input data with Zod schema
    const validationResult = await userRoleSchema.safeParseAsync(args);

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

    const {
      name,
      description,
      defaultPermissions,
      systemDeleteProtection,
      systemUpdateProtection,
    } = validationResult.data;

    // Attempt to check for existing role in Redis
    let roleExists;

    roleExists = await getRoleNameExistFromRedis(name);

    if (!roleExists) {
      // On cache miss, check database for role existence
      roleExists = await findRoleByName(name);

      if (roleExists) {
        // Cache role existence in Redis
        await setRoleNameExistInRedis(name);

        return {
          statusCode: 400,
          success: false,
          message: "Role with this name already exists",
          __typename: "BaseResponse",
        };
      }
    } else {
      return {
        statusCode: 400,
        success: false,
        message: "Role with this name already exists",
        __typename: "BaseResponse",
      };
    }

    // Normalize permissions by ensuring all required permissions are included
    const incomingPermissionsMap = new Map<string, RolePermission>();

    defaultPermissions?.forEach((perm: any) => {
      if (PERMISSIONS.includes(perm.name as PermissionName)) {
        incomingPermissionsMap.set(perm.name, {
          name: perm.name,
          description:
            perm.description ?? `${perm.name} permission for ${name}`,
          canCreate: perm.canCreate ?? false,
          canRead: perm.canRead ?? false,
          canUpdate: perm.canUpdate ?? false,
          canDelete: perm.canDelete ?? false,
        } as RolePermission);
      }
    });

    // Create complete permissions array with defaults for missing permissions
    const completePermissions: RolePermission[] = PERMISSIONS.map(
      (permName) => {
        const perm = incomingPermissionsMap.get(permName as PermissionName);
        if (perm) {
          return perm;
        }
        // Provide default values for all required RolePermission fields
        return {
          name: permName,
          description: `${permName} permission for ${name}`,
          canCreate: false,
          canRead: false,
          canUpdate: false,
          canDelete: false,
        } as RolePermission;
      }
    );

    // Create the role in the database with audit information
    const role = await createRole(
      {
        name,
        description,
        defaultPermissions: completePermissions || [],
        systemDeleteProtection,
        systemUpdateProtection,
      },
      user.id
    );

    // Cache the new role and its name existence in Redis
    await Promise.all([
      setRoleInfoByRoleIdInRedis(role.id, role),
      setRoleInfoByRoleNameInRedis(role.name, role),
      setRoleNameExistInRedis(role.name),
      clearAllRoleSearchCache(),
    ]);

    return {
      statusCode: 201,
      success: true,
      message: "Role created successfully",
      role: {
        id: role.id,
        name: role.name,
        description: role.description,
        defaultPermissions: role.defaultPermissions,
        systemDeleteProtection: role.systemDeleteProtection,
        systemUpdateProtection: role.systemUpdateProtection,
        assignedUserCount: 0,
        createdBy: {
          id: userData.id,
          name: userData.firstName + " " + userData.lastName,
          roles: userData.roles,
        },
        createdAt: role.createdAt?.toISOString(),
        deletedAt: role.deletedAt ? role.deletedAt.toISOString() : null,
      },
      __typename: "RoleResponse",
    };
  } catch (error: any) {
    console.error("Error creating role:", error);

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
