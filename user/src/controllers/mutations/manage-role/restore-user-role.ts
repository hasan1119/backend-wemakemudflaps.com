import { Repository } from "typeorm";
import { Context } from "../../../context";
import { Permission } from "../../../entities/permission.entity";
import { Role } from "../../../entities/user-role.entity";
import { User } from "../../../entities/user.entity";
import {
  getRoleInfoByRoleIdFromRedis,
  getUserInfoByUserIdFromRedis,
  getUserPermissionsByUserIdFromRedis,
  setRoleInfoByRoleIdInRedis,
  setUserInfoByUserIdInRedis,
  setUserPermissionsByUserIdInRedis,
} from "../../../helper/redis";
import {
  BaseResponseOrError,
  CachedRoleInputs,
  CachedUserPermissionsInputs,
  MutationRestoreUserRoleArgs,
  UserSession,
} from "../../../types";
import { idsSchema } from "../../../utils/data-validation";
import { checkUserAuth } from "../../../utils/session-check/session-check";

/**
 * Restores a soft-deleted user role from the trash with validation and permission checks.
 *
 * Steps:
 * - Validates input using Zod schema
 * - Authenticates user and checks role restoration permission
 * - Checks Redis for role data to optimize performance via caching
 * - Confirms the role exists and is soft-deleted
 * - Restores the role by clearing the deletedAt timestamp
 * - Updates related cache entries
 *
 * @param _ - Unused parent resolver argument
 * @param args - Arguments for the role restore input (ids)
 * @param context - GraphQL context with AppDataSource and user info
 * @returns Promise<BaseResponseOrError> - Response status and message
 */
export const restoreUserRole = async (
  _: any,
  args: MutationRestoreUserRoleArgs,
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

      userData = {
        ...dbUser,
        role: dbUser.role.name,
      };

      const userSession: UserSession = {
        id: userData.id,
        email: userData.email,
        firstName: userData.firstName,
        lastName: userData.lastName,
        role: userData.role.name,
        gender: userData.gender,
        emailVerified: userData.emailVerified,
        isAccountActivated: userData.isAccountActivated,
      };

      // Cache user in Redis
      await setUserInfoByUserIdInRedis(user.id, userSession);
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

    // Check if the user has the "canUpdate" permission for roles (assuming restore is an update operation)
    const canRestoreRole = userPermissions.some(
      (permission) => permission.name === "Role" && permission.canUpdate
    );

    if (!canRestoreRole) {
      return {
        statusCode: 403,
        success: false,
        message: "You do not have permission to restore roles",
        __typename: "BaseResponse",
      };
    }

    // Validate input data using Zod schema
    const idsResult = await idsSchema.safeParseAsync({ ids });

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

        // Check if the role is soft-deleted
        if (!roleData.deletedAt) {
          return {
            statusCode: 400,
            success: false,
            message: `Role with ID ${id} is not in the trash`,
            __typename: "BaseResponse",
          };
        }

        roleData = dbRole;

        // Restore the role by clearing deletedAt
        await roleRepository.update(id, { deletedAt: null });

        // Fetch the updated role with required relations
        const restoredRole = await roleRepository.findOneOrFail({
          where: { id },
          relations: ["CreatedBy"],
        });

        const createdBy = await roleData.createdBy;

        const roleSession: CachedRoleInputs = {
          id: restoredRole.id,
          name: restoredRole.name,
          description: restoredRole.description,
          createdAt: restoredRole.createdAt.toISOString(),
          deletedAt: null,
          createdBy: createdBy
            ? {
                id: createdBy.id,
                name: createdBy.firstName + " " + createdBy.lastName,
                role: createdBy.role.name,
              }
            : null,
        };

        // Update cache with restored role
        await setRoleInfoByRoleIdInRedis(id, roleSession);
      }

      return {
        statusCode: 200,
        success: true,
        message: "Role(s) restored successfully",
        __typename: "BaseResponse",
      };
    }
  } catch (error: any) {
    console.error("Error restoring role:", error);

    return {
      statusCode: 500,
      success: false,
      message: error.message || "Internal server error",
      __typename: "BaseResponse",
    };
  }
};
