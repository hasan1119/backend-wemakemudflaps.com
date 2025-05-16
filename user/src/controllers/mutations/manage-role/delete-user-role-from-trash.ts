import { Repository } from "typeorm";
import { Context } from "../../../context";
import { Permission } from "../../../entities/permission.entity";
import { Role } from "../../../entities/user-role.entity";
import { User } from "../../../entities/user.entity";
import {
  getRoleInfoByRoleIdFromRedis,
  getUserInfoByUserIdFromRedis,
  getUserPermissionsByUserIdFromRedis,
  removeRoleInfoByRoleIdFromRedis,
  removeRoleInfoByRoleNameFromRedis,
  removeRoleNameExistFromRedis,
  removeTotalUserCountByRoleIdFromRedis,
  setUserInfoByEmailInRedis,
  setUserPermissionsByUserIdInRedis,
} from "../../../helper/redis";
import {
  BaseResponseOrError,
  CachedUserPermissionsInputs,
  CachedUserSessionByEmailKeyInputs,
  MutationDeleteUserRoleFromTrashArgs,
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
      });

      if (!dbUser) {
        return {
          statusCode: 404,
          success: false,
          message: "Authenticated user not found in database",
          __typename: "ErrorResponse",
        };
      }

      const userSessionByEmail: CachedUserSessionByEmailKeyInputs = {
        id: dbUser.id,
        email: dbUser.email,
        firstName: dbUser.firstName,
        lastName: dbUser.lastName,
        role: dbUser.role.name,
        gender: dbUser.gender,
        password: dbUser.password,
        emailVerified: dbUser.emailVerified,
        isAccountActivated: dbUser.isAccountActivated,
      };

      userData = userSessionByEmail;

      // Cache user in Redis
      await setUserInfoByEmailInRedis(user.email, userSessionByEmail);
    }

    // Check Redis for cached user permissions
    let userPermissions = await getUserPermissionsByUserIdFromRedis(user.id);

    if (!userPermissions) {
      // Cache miss: Fetch permissions from database, selecting only necessary fields
      userPermissions = await permissionRepository.find({
        where: { user: { id: user.id } },
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

    for (const id of ids) {
      // Check Redis for cached role's data
      let roleData;

      roleData = await getRoleInfoByRoleIdFromRedis(id);

      if (!roleData) {
        // Cache miss: Fetch role from database
        const dbRole = await roleRepository.findOne({
          where: { id },
        });

        if (!dbRole) {
          return {
            statusCode: 404,
            success: false,
            message: `Role with ID ${id} not found`,
            __typename: "BaseResponse",
          };
        }

        roleData = dbRole;

        // Check if the role is soft-deleted
        if (!roleData.deletedAt) {
          return {
            statusCode: 400,
            success: false,
            message: `Role with ID ${id} is not in the trash`,
            __typename: "BaseResponse",
          };
        }

        // Permanently delete the role
        await roleRepository.delete(id);

        // Clear cache in Redis
        await Promise.all([
          removeRoleInfoByRoleIdFromRedis(roleData.id),
          removeRoleInfoByRoleNameFromRedis(roleData.name),
          removeRoleNameExistFromRedis(roleData.name),
          removeTotalUserCountByRoleIdFromRedis(roleData.id),
        ]);
      }

      return {
        statusCode: 200,
        success: true,
        message: "Role(s) permanently deleted from trash successfully",
        __typename: "BaseResponse",
      };
    }
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
