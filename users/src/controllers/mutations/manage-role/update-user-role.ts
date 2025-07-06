import CONFIG from "../../../config/config";
import { Context } from "../../../context";
import {
  clearAllUserSearchCache,
  getRoleInfoByRoleIdFromRedis,
  getRoleInfoByRoleNameFromRedis,
  getTotalUserCountByRoleIdFromRedis,
  getUserInfoByEmailFromRedis,
  getUserInfoByUserIdFromRedis,
  removeUserRolesInfoFromRedis,
  setRoleInfoByRoleIdInRedis,
  setRoleInfoByRoleNameInRedis,
  setTotalUserCountByRoleIdInRedis,
  setUserInfoByUserIdInRedis,
} from "../../../helper/redis";
import {
  BaseResponseOrError,
  MutationUpdateUserRoleArgs,
} from "../../../types";
import CompareInfo from "../../../utils/bcrypt/compare-info";
import { userRoleUpdateSchema } from "../../../utils/data-validation";
import {
  mapRoleToResponse,
  mapUserToResponseById,
} from "../../../utils/mapper";
import {
  checkUserAuth,
  checkUserPermission,
  countUsersWithRole,
  findRolesByNames,
  getRolesByIds,
  getUserById,
  getUserLoginInfoByUserId,
  updateUser,
} from "../../services";
import { deleteUserLoginInfoByUserId } from "../../services/user/delete-user.service";
import {
  removeUserTokenInfoByUserSessionIdFromRedis,
  setUserInfoByEmailInRedis,
} from "./../../../helper/redis";

/**
 * Handles updating a user's roles with validation, permission checks, and cache management.
 *
 * Workflow:
 * 1. Verifies user authentication and retrieves user data from Redis.
 * 2. Checks permission to update user roles.
 * 3. Validates input (roleAddIds, roleRemoveIds, userId, password) using Zod schema.
 * 4. For non-Super Admin users, verifies provided password.
 * 5. Ensures no overlapping role IDs in add and remove lists.
 * 6. Retrieves target user data from Redis or database.
 * 7. Prevents self-role changes, protected role updates, and modifications to users with shared roles.
 * 8. Fetches roles to add/remove from Redis or database, ensuring they exist and are not soft-deleted.
 * 9. Prevents assignment of SUPER ADMIN role and ensures at least one role remains.
 * 10. Updates user roles in the database and adjusts role user counts in Redis.
 * 11. Clears and updates user and role cache in Redis, enforcing re-login for changes.
 * 12. Returns a success response or error if validation, permission, or update fails.
 *
 * @param _ - Unused parent parameter for GraphQL resolver.
 * @param args - Input arguments containing role IDs to add/remove, user ID, and optional password.
 * @param context - GraphQL context containing authenticated user information.
 * @returns A promise resolving to a BaseResponseOrError object containing status, message, and errors if applicable.
 */
export const updateUserRole = async (
  _: any,
  args: MutationUpdateUserRoleArgs,
  { user }: Context
): Promise<BaseResponseOrError> => {
  try {
    // Verify user authentication
    const authResponse = checkUserAuth(user);
    if (authResponse) return authResponse;

    // Attempt to retrieve cached user data from Redis
    let userData;

    userData = await getUserInfoByEmailFromRedis(user.email);

    // Check if user has permission to update user roles
    const canUpdate = await checkUserPermission({
      action: "canUpdate",
      entity: "user",
      user,
    });

    if (!canUpdate) {
      return {
        statusCode: 403,
        success: false,
        message: "You do not have permission to update any user's role",
        __typename: "BaseResponse",
      };
    }

    // Validate input data with Zod schema
    const validationResult = await userRoleUpdateSchema.safeParseAsync(args);

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
      roleAddIds,
      roleRemoveIds = [],
      userId,
      password,
    } = validationResult.data;

    // Check for overlapping role IDs in add and remove arrays
    const overlappingRoleIds = roleAddIds.filter((id) =>
      roleRemoveIds.includes(id)
    );
    if (overlappingRoleIds.length > 0) {
      return {
        statusCode: 400,
        success: false,
        message: `Role IDs cannot be both added and removed simultaneously: ${overlappingRoleIds.join(
          ", "
        )}`,
        __typename: "BaseResponse",
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
    // Retrieve target user data
    let targetUser;

    targetUser = await getUserInfoByUserIdFromRedis(userId);

    if (!targetUser) {
      // On cache miss, fetch user data from database
      targetUser = await getUserById(userId);
      if (!targetUser) {
        return {
          statusCode: 404,
          success: false,
          message: `User with ID ${userId} not found or has been deleted`,
          __typename: "BaseResponse",
        };
      }

      targetUser = await mapUserToResponseById(targetUser);

      await setUserInfoByUserIdInRedis(userId, targetUser);
    }

    // Prevent self-role changes
    if (targetUser.id === user.id) {
      return {
        statusCode: 403,
        success: false,
        message: "You cannot change your own role",
        __typename: "BaseResponse",
      };
    }

    // Prevent updates to protected user roles for non-Super Admin
    if (isNotSuperAdmin && !targetUser.canUpdateRole) {
      return {
        statusCode: 403,
        success: false,
        message: `You can't update this user's role. Their role is protected by the system.`,
        __typename: "BaseResponse",
      };
    }
    // Prevent modifications to users with shared roles
    const userRoleIds = new Set(user.roles.map((r) => r.id));
    const hasCommonRoles = targetUser.roles.some((r) => userRoleIds.has(r.id));

    if (hasCommonRoles) {
      return {
        statusCode: 403,
        success: false,
        message: "You cannot modify a user who shares the same role(s) as you",
        __typename: "BaseResponse",
      };
    }

    /**
     * Helper: Fetch roles by IDs with Redis cache fallback to DB
     * Returns roles and list of missing role IDs (if any)
     */
    const fetchRolesByIdsWithCache = async (roleIds: string[]) => {
      const rolesFromCache = await Promise.all(
        roleIds.map((id) => getRoleInfoByRoleIdFromRedis(id))
      );

      const missingIds: string[] = [];
      const result: any[] = [];

      for (let i = 0; i < roleIds.length; i++) {
        const cachedRole = rolesFromCache[i];

        if (cachedRole) {
          if (!cachedRole.deletedAt) {
            result.push(cachedRole);
          } else {
            // Soft-deleted role in cache
            missingIds.push(roleIds[i]);
          }
        } else {
          missingIds.push(roleIds[i]);
        }
      }

      if (missingIds.length > 0) {
        const dbRoles = await getRolesByIds(missingIds);

        // Filter out soft-deleted roles
        const validDbRoles = dbRoles.filter((role) => !role.deletedAt);

        // Cache valid roles
        await Promise.all(
          validDbRoles.map((role) => setRoleInfoByRoleIdInRedis(role.id, role))
        );

        result.push(...validDbRoles.map((role) => mapRoleToResponse(role)));

        // Determine still missing role IDs after DB fetch or soft-deleted
        const foundIds = new Set(validDbRoles.map((r) => r.id));
        const stillMissing = missingIds.filter((id) => !foundIds.has(id));

        if (stillMissing.length > 0) {
          return { roles: result, missing: stillMissing };
        }
      }

      return { roles: result, missing: [] };
    };

    // Fetch roles to add and remove
    const [rolesToAdd, rolesToRemove] = await Promise.all([
      fetchRolesByIdsWithCache(roleAddIds),
      fetchRolesByIdsWithCache(roleRemoveIds),
    ]);

    // Check for missing roles
    if (rolesToAdd.missing.length > 0) {
      return {
        statusCode: 404,
        success: false,
        message: `Role(s) with ID(s) ${rolesToAdd.missing.join(
          ", "
        )} not found`,
        __typename: "BaseResponse",
      };
    }

    if (rolesToRemove.missing.length > 0) {
      return {
        statusCode: 404,
        success: false,
        message: `Role(s) with ID(s) ${rolesToRemove.missing.join(
          ", "
        )} not found`,
        __typename: "BaseResponse",
      };
    }

    // Prevent assignment of SUPER ADMIN role
    for (const role of rolesToAdd.roles) {
      if (role.name === "SUPER ADMIN") {
        return {
          statusCode: 403,
          success: false,
          message: "Cannot assign SUPER ADMIN role to any user",
          __typename: "BaseResponse",
        };
      }

      // Prevent assignment of soft-deleted roles
      if (role.deletedAt) {
        return {
          statusCode: 400,
          success: false,
          message: `Role ${role.name} is in the trash and cannot be assigned`,
          __typename: "BaseResponse",
        };
      }
    }

    // Retrieve existing user roles
    let existingRole;

    existingRole = await Promise.all(
      targetUser.roles.map(async (role) => {
        const roleInfo = await getRoleInfoByRoleNameFromRedis(role.name);
        return roleInfo ?? null; // If not found, return null
      })
    );

    // Fetch missing roles from database
    const missingRoleNames = targetUser.roles.filter(
      (_, index) => existingRole[index] === null
    );

    if (missingRoleNames.length > 0) {
      const dbRoles = await findRolesByNames(missingRoleNames);

      // Merge found roles into existingRole
      existingRole = existingRole.map(
        (roleInfo, index) =>
          roleInfo ??
          dbRoles.find((dbRole) => dbRole.name === targetUser.roles[index])
      );

      // Cache found roles in Redis
      await Promise.all(
        dbRoles.map((dbRole) =>
          setRoleInfoByRoleNameInRedis(dbRole.name, dbRole)
        )
      );
    }

    // Filter out null roles and remove createdBy from existing roles
    const existingRoles = existingRole
      .filter((role) => role !== null)
      .map(({ createdBy, ...rest }) => rest);

    // Extract role IDs from roles to remove
    const roleIdsToRemove = rolesToRemove.roles.map((role) => role.id);

    // Filter out roles to be removed
    const filteredRoles = existingRoles.filter(
      (role) => !roleIdsToRemove.includes(role.id)
    );

    // Add new roles, ensuring no duplicates by ID
    const rolesToAddWithoutCreatedBy = rolesToAdd.roles.map(
      ({ createdBy, ...rest }) => rest
    );
    const combinedRoles = [
      ...filteredRoles,
      ...rolesToAddWithoutCreatedBy.filter(
        (role) => !filteredRoles.some((existing) => existing.id === role.id)
      ),
    ];

    // Extract role names for updateUser
    const combinedRoleNames = combinedRoles.map((role) => role.name);

    // Ensure the user has at least one role
    if (combinedRoleNames.length === 0) {
      return {
        statusCode: 400,
        success: false,
        message: "A user must have at least one role assigned",
        __typename: "BaseResponse",
      };
    }

    // Remove fields that should not be updated or saved back
    delete targetUser.permissions;
    delete targetUser.createdAt;
    delete targetUser.deletedAt;

    // Update user roles in the database
    const updatedUser = await updateUser({
      ...targetUser,
      roles: combinedRoles,
    });

    // Determine actual roles added and removed
    const existingRoleIds = new Set(existingRoles.map((role) => role.id));
    const newRoleIds = new Set(combinedRoles.map((role) => role.id));

    // Roles that were added (in newRoleIds but not in existingRoleIds)
    const actuallyAddedRoleIds = [...newRoleIds].filter(
      (id) => !existingRoleIds.has(id)
    );

    // Roles that were removed (in existingRoleIds but not in newRoleIds)
    const actuallyRemovedRoleIds = [...existingRoleIds].filter(
      (id) => !newRoleIds.has(id)
    );

    // Update user role counts in Redis for actually added roles
    for (const roleId of actuallyAddedRoleIds) {
      const role = combinedRoles.find((r) => r.id === roleId);
      if (role) {
        let count = await getTotalUserCountByRoleIdFromRedis(role.id);
        if (!count || count < 0) {
          count = await countUsersWithRole(role.id);
        } else {
          count += 1;
        }
        await setTotalUserCountByRoleIdInRedis(role.id, count);
      }
    }

    // Update user role counts in Redis for actually removed roles
    for (const roleId of actuallyRemovedRoleIds) {
      const role = existingRoles.find((r) => r.id === roleId);
      if (role) {
        let count = await getTotalUserCountByRoleIdFromRedis(role.id);
        if (!count || count <= 0) {
          count = await countUsersWithRole(role.id);
        } else {
          count = Math.max(0, count - 1);
        }
        await setTotalUserCountByRoleIdInRedis(role.id, count);
      }
    }

    const userLoginInfo = await getUserLoginInfoByUserId(updatedUser.id);

    await deleteUserLoginInfoByUserId(updatedUser.id);

    // Refresh Redis user data
    await Promise.all([
      setUserInfoByUserIdInRedis(updatedUser.id, updatedUser),
      setUserInfoByEmailInRedis(updatedUser.email, updatedUser),
      removeUserRolesInfoFromRedis(updatedUser.id),
      ...userLoginInfo.map((login) =>
        removeUserTokenInfoByUserSessionIdFromRedis(login.id)
      ),
      clearAllUserSearchCache(),
    ]);

    return {
      statusCode: 200,
      success: true,
      message:
        "User role updated successfully. To see the changes user must have to login again.",
      __typename: "BaseResponse",
    };
  } catch (error: any) {
    console.error("Error updating user role:", {
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
