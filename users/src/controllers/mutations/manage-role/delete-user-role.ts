import CONFIG from "../../../config/config";
import { Context } from "../../../context";
import {
  clearAllRoleSearchCache,
  getRoleInfoByRoleIdFromRedis,
  getTotalUserCountByRoleIdFromRedis,
  getUserInfoByEmailFromRedis,
  removeRoleInfoByRoleIdFromRedis,
  removeRoleInfoByRoleNameFromRedis,
  removeRoleNameExistFromRedis,
  removeTotalUserCountByRoleIdFromRedis,
  setRoleInfoByRoleIdInRedis,
  setRoleInfoByRoleNameInRedis,
  setTotalUserCountByRoleIdInRedis,
} from "../../../helper/redis";
import {
  BaseResponseOrError,
  MutationDeleteUserRoleArgs,
} from "../../../types";
import CompareInfo from "../../../utils/bcrypt/compare-info";
import { idsSchema, skipTrashSchema } from "../../../utils/data-validation";
import {
  checkUserAuth,
  checkUserPermission,
  countUsersWithRole,
  getRolesByIds,
  hardDeleteRole,
  softDeleteRole,
} from "../../services";

// Clear role-related cache entries in Redis
const clearRoleCache = async (id: string, name: string) => {
  await Promise.all([
    removeRoleInfoByRoleIdFromRedis(id),
    removeRoleInfoByRoleNameFromRedis(name),
    removeRoleNameExistFromRedis(name),
    removeTotalUserCountByRoleIdFromRedis(id),
    clearAllRoleSearchCache(),
  ]);
};

// Perform soft delete and update cache
const softDeleteAndCache = async (id: string, name: string) => {
  const deletedData = await softDeleteRole(id);
  await Promise.all([
    setRoleInfoByRoleIdInRedis(id, deletedData),
    setRoleInfoByRoleNameInRedis(name, deletedData),
    clearAllRoleSearchCache(),
  ]);
};

/**
 * Handles the deletion of user roles with validation and permission checks.
 *
 * Workflow:
 * 1. Verifies user authentication and permission to delete roles.
 * 2. Validates input (ids, skipTrash, password) using Zod schemas.
 * 3. For non-Super Admin users, verifies provided password.
 * 4. Retrieves role data from Redis or database for each role ID.
 * 5. Checks if roles are in use or protected from deletion.
 * 6. Performs soft or hard deletion based on skipTrash parameter.
 * 7. Clears or updates related cache entries in Redis.
 * 8. Returns a success response with deleted role names or error if validation, permission, or deletion fails.
 *
 * @param _ - Unused parent parameter for GraphQL resolver.
 * @param args - Input arguments containing role IDs, skipTrash flag, and optional password.
 * @param context - GraphQL context containing authenticated user information.
 * @returns A promise resolving to a BaseResponseOrError object containing status, message, and errors if applicable.
 */
export const deleteUserRole = async (
  _: any,
  args: MutationDeleteUserRoleArgs,
  { user }: Context
): Promise<BaseResponseOrError> => {
  try {
    // Verify user authentication
    const authResponse = checkUserAuth(user);
    if (authResponse) return authResponse;

    // Check if user has permission to delete roles
    const canDelete = await checkUserPermission({
      action: "canDelete",
      entity: "role",
      user,
    });

    const userData = await getUserInfoByEmailFromRedis(user.email);

    if (!canDelete) {
      return {
        statusCode: 403,
        success: false,
        message: "You do not have permission to delete role(s)",
        __typename: "BaseResponse",
      };
    }

    const { ids, skipTrash, password } = args;

    // Validate input data with Zod schemas
    const [idsResult, skipTrashResult] = await Promise.all([
      idsSchema.safeParseAsync({ ids }),
      skipTrashSchema.safeParseAsync({ skipTrash }),
    ]);

    if (!idsResult.success || !skipTrashResult.success) {
      const errors = [
        ...(idsResult.error?.errors || []),
        ...(skipTrashResult.error?.errors || []),
      ].map((e) => ({
        field: e.path.join("."), // Join path array to string for field identification
        message: e.message,
      }));

      return {
        statusCode: 400,
        success: false,
        message: "Validation failed",
        errors,
        __typename: "ErrorResponse",
      };
    }

    const isNotSuperAdmin = !user.roles
      .map((role) => role.name)
      .includes("SUPER ADMIN");

    // Validate password for non-Super Admin users
    if (isNotSuperAdmin) {
      if (!password) {
        return {
          statusCode: 400,
          success: false,
          message: "Password is required for non-SUPER ADMIN users",
          __typename: "BaseResponse",
        };
      }

      // Verify provided password
      const isPasswordValid = await CompareInfo(password, userData.password);
      if (!isPasswordValid) {
        return {
          statusCode: 403,
          success: false,
          message: "Invalid password",
          __typename: "BaseResponse",
        };
      }
    }

    // Attempt to retrieve role data from Redis
    const cachedRoles = await Promise.all(
      ids.map(getRoleInfoByRoleIdFromRedis)
    );

    const foundRoles: any[] = [];
    const missingIds: string[] = [];

    cachedRoles.forEach((role, index) => {
      if (role) {
        foundRoles.push(role);
      } else {
        missingIds.push(ids[index]);
      }
    });

    // Fetch missing roles from the database
    if (missingIds.length > 0) {
      const dbRoles = await getRolesByIds(missingIds);
      if (dbRoles.length !== missingIds.length) {
        const dbFoundIds = new Set(dbRoles.map((r) => r.id));
        const notFoundRoles = missingIds
          .filter((id) => !dbFoundIds.has(id))
          .map((id) => id);

        const notFoundNames = notFoundRoles.map((id) => {
          const role = dbRoles.find((r) => r.id === id);
          return role ? role.name : '"Unknown Role"';
        });

        return {
          statusCode: 404,
          success: false,
          message: `Roles with name: ${notFoundNames.join(", ")} not found`,
          __typename: "BaseResponse",
        };
      }
      foundRoles.push(...dbRoles);
    }

    const deletedRoles: string[] = [];

    for (const roleData of foundRoles) {
      const {
        id,
        name,
        systemDeleteProtection,
        systemPermanentDeleteProtection,
        deletedAt,
      } = roleData;

      // Prevent deletes to permanently protected roles
      if (systemPermanentDeleteProtection) {
        return {
          statusCode: 403,
          success: false,
          message: `The role "${roleData.name}" is permanently protected and cannot be deleted.`,
          __typename: "BaseResponse",
        };
      }

      const userCountKey = roleData.id;

      // Check user count for the role in Redis
      let userCountForRole = await getTotalUserCountByRoleIdFromRedis(
        userCountKey
      );

      if (userCountForRole === 0) {
        // On cache miss, count users with the role in database
        userCountForRole = await countUsersWithRole(userCountKey);
        await setTotalUserCountByRoleIdInRedis(userCountKey, userCountForRole);
      }

      // Prevent deletion if role is assigned to users
      if (userCountForRole > 0) {
        return {
          statusCode: 400,
          success: false,
          message: `The role "${
            roleData.name
          }" is protected and cannot be deleted. ${userCountForRole} ${
            userCountForRole > 1 ? "users are" : "user is"
          } assigned to this role`,
          __typename: "BaseResponse",
        };
      }

      // Restrict protected role deletion for non-Super Admin users
      if (isNotSuperAdmin && systemDeleteProtection) {
        return {
          statusCode: 403,
          success: false,
          message: `Only SUPER ADMIN can delete protected roles like "${name}"`,
          __typename: "BaseResponse",
        };
      }

      // Perform soft or hard deletion based on skipTrash
      if (skipTrash) {
        await hardDeleteRole(id);
        await clearRoleCache(id, name);
      } else {
        // Verify role is soft-deleted
        if (deletedAt) {
          return {
            statusCode: 400,
            success: false,
            message: `Role: ${roleData.name} already in the trash`,
            __typename: "BaseResponse",
          };
        }

        await softDeleteAndCache(id, name);
      }

      deletedRoles.push(name);
    }

    return {
      statusCode: 200,
      success: true,
      message: deletedRoles.length
        ? `${
            skipTrash ? "Role(s) permanently deleted" : "Role(s) moved to trash"
          } successfully: ${deletedRoles.join(", ")}`
        : "No roles deleted",
      __typename: "BaseResponse",
    };
  } catch (error: any) {
    console.error("Error deleting role:", error);

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
