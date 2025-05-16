import { In, Repository } from "typeorm";
import { Context } from "../../../context";
import { Permission } from "../../../entities/permission.entity";
import { Role } from "../../../entities/user-role.entity";
import { User } from "../../../entities/user.entity";
import {
  getUserInfoByUserIdFromRedis,
  getUserPermissionsByUserIdFromRedis,
  removeRoleInfoByRoleIdFromRedis,
  removeRoleInfoByRoleNameFromRedis,
  removeRoleNameExistFromRedis,
  removeTotalUserCountByRoleIdFromRedis,
  setUserInfoByUserIdInRedis,
  setUserPermissionsByUserIdInRedis,
} from "../../../helper/redis";
import {
  BaseResponseOrError,
  CachedUserPermissionsInputs,
  MutationDeleteUserRoleFromTrashArgs,
  UserSession,
} from "../../../types";
import { idsSchema } from "../../../utils/data-validation";
import { checkUserAuth } from "../../../utils/session-check/session-check";

/**
 * Permanently deletes a soft-deleted user role from the trash with validation and permission checks.
 *
 * Steps:
 * - Validates input using Zod schema
 * - Authenticates user and checks role deletion permission
 * - Checks Redis for role data to optimize performance via caching
 * - Confirms the role exists and is soft-deleted
 * - Permanently deletes the role from the database
 * - Clears related cache entries
 *
 * @param _ - Unused parent resolver argument
 * @param args - Arguments for the role delete input (ids)
 * @param context - GraphQL context with AppDataSource and user info
 * @returns Promise<BaseResponseOrError> - Response status and message
 */
export const deleteUserRoleFromTrash = async (
  _: any,
  args: MutationDeleteUserRoleFromTrashArgs,
  { AppDataSource, user }: Context
): Promise<BaseResponseOrError> => {
  const { ids } = args;

  try {
    // Check user authentication
    const authResponse = checkUserAuth(user);
    if (authResponse) return authResponse;

    // Initialize repositories for Role, User, and Permission entities
    const roleRepository: Repository<Role> = AppDataSource.getRepository(Role);
    const userRepository: Repository<User> = AppDataSource.getRepository(User);
    const permissionRepository: Repository<Permission> =
      AppDataSource.getRepository(Permission);

    // Check Redis for cached user's data
    let userData;

    userData = await getUserInfoByUserIdFromRedis(user.id);

    if (!userData) {
      // Cache miss: Fetch user from database
      const dbUser = await userRepository.findOne({
        where: { id: user.id },
        relations: ["role"],
        select: {
          id: true,
          email: true,
          firstName: true,
          lastName: true,
          gender: true,
          emailVerified: true,
          isAccountActivated: true,
          role: {
            name: true,
          },
        },
      });

      if (!dbUser) {
        return {
          statusCode: 404,
          success: false,
          message: "Authenticated user not found in database",
          __typename: "ErrorResponse",
        };
      }

      const userSession: UserSession = {
        id: dbUser.id,
        email: dbUser.email,
        firstName: dbUser.firstName,
        lastName: dbUser.lastName,
        role: dbUser.role.name,
        gender: dbUser.gender,
        emailVerified: dbUser.emailVerified,
        isAccountActivated: dbUser.isAccountActivated,
      };

      userData = userSession;

      // Cache user in Redis
      await setUserInfoByUserIdInRedis(user.email, userSession);
    }

    // Check Redis for cached user permissions
    let userPermissions = await getUserPermissionsByUserIdFromRedis(user.id);

    if (!userPermissions) {
      // Cache miss: Fetch permissions from database, selecting only necessary fields
      userPermissions = await permissionRepository.find({
        where: { user: { id: user.id } },
        select: {
          id: true,
          name: true,
          description: true,
          canCreate: true,
          canRead: true,
          canUpdate: true,
          canDelete: true,
        },
      });

      const fullPermissions: CachedUserPermissionsInputs[] =
        userPermissions.map((permission) => ({
          id: permission.id,
          name: permission.name,
          description: permission.description,
          canCreate: permission.canCreate,
          canRead: permission.canRead,
          canUpdate: permission.canUpdate,
          canDelete: permission.canDelete,
        }));

      // Cache permissions in Redis
      await setUserPermissionsByUserIdInRedis(userData.id, fullPermissions);
    }

    // Check if the user has the "canDelete" permission for roles
    const canDeleteRole = userPermissions.some(
      (permission) => permission.name === "Role" && permission.canDelete
    );

    if (!canDeleteRole) {
      return {
        statusCode: 403,
        success: false,
        message: "You do not have permission to delete roles",
        __typename: "BaseResponse",
      };
    }

    // Validate input data using Zod schema
    const idsResult = await idsSchema.safeParseAsync({ ids });

    // If validation fails, return detailed error messages with field names
    if (!idsResult.success) {
      const errors = idsResult.error.errors.map((e) => ({
        field: e.path.join("."),
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

    // Password validation for non-SUPER ADMIN users
    if (userData.role !== "SUPER ADMIN") {
      return {
        statusCode: 400,
        success: false,
        message: "Only SUPER ADMIN can permanently delete a user role.",
        __typename: "BaseResponse",
      };
    }

    // Fetch roles to ensure they exist and are soft-deleted
    const roles = await roleRepository.find({
      where: { id: In(ids) },
      select: { id: true, name: true, deletedAt: true },
    });

    if (roles.length !== ids.length) {
      const foundIds = new Set(roles.map((role) => role.id));
      const missingIds = ids.filter((id) => !foundIds.has(id));
      return {
        statusCode: 404,
        success: false,
        message: `Roles with IDs ${missingIds.join(", ")} not found`,
        __typename: "BaseResponse",
      };
    }

    // Check if all roles are soft-deleted
    const nonDeletedRoles = roles.filter((role) => !role.deletedAt);
    if (nonDeletedRoles.length > 0) {
      const nonDeletedIds = nonDeletedRoles.map((role) => role.id);
      return {
        statusCode: 400,
        success: false,
        message: `Roles with IDs ${nonDeletedIds.join(
          ", "
        )} are not in the trash`,
        __typename: "BaseResponse",
      };
    }

    // Check if any users are assigned to the roles
    const userCount = await userRepository.count({
      where: { role: { id: In(ids) } },
    });

    if (userCount > 0) {
      return {
        statusCode: 400,
        success: false,
        message: "Cannot delete roles with assigned users",
        __typename: "BaseResponse",
      };
    }

    // Permanently delete roles
    await roleRepository.delete({ id: In(ids) });

    // Clear Redis cache for all deleted roles
    const cacheUpdates: Promise<void>[] = [];
    for (const role of roles) {
      cacheUpdates.push(
        removeRoleInfoByRoleIdFromRedis(role.id),
        removeRoleInfoByRoleNameFromRedis(role.name),
        removeRoleNameExistFromRedis(role.name),
        removeTotalUserCountByRoleIdFromRedis(role.id)
      );
    }

    await Promise.all(cacheUpdates);

    return {
      statusCode: 200,
      success: true,
      message: `Role(s)  permanently deleted from trash`,
      __typename: "BaseResponse",
    };
  } catch (error: any) {
    console.error("Error deleting role from trash:", error);

    return {
      statusCode: 500,
      success: false,
      message: error.message || "Internal server error",
      __typename: "BaseResponse",
    };
  }
};
