import { In, Repository } from "typeorm";
import { Context } from "../../../context";
import { Permission } from "../../../entities/permission.entity";
import { Role } from "../../../entities/user-role.entity";
import { User } from "../../../entities/user.entity";
import {
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
        where: { id: user.id, deletedAt: null },
        relations: ["role"],
        select: {
          id: true,
          firstName: true,
          lastName: true,
          email: true,
          gender: true,
          role: {
            name: true,
          },
          emailVerified: true,
          isAccountActivated: true,
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

      userData = {
        ...dbUser,
        role: dbUser.role.name,
      };

      const userSession: UserSession = {
        id: userData.id,
        firstName: userData.firstName,
        lastName: userData.lastName,
        email: userData.email,
        gender: userData.gender,
        role: userData.role.name,
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

    // Fetch roles to ensure they exist and are soft-deleted
    const roles = await roleRepository.find({
      where: { id: In(ids) },
      select: {
        id: true,
        name: true,
        description: true,
        createdAt: true,
        deletedAt: true,
        createdBy: {
          id: true,
          firstName: true,
          lastName: true,
          role: { name: true },
        },
      },
      relations: ["createdBy"],
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

    // Restore roles by clearing deletedAt
    await roleRepository.update({ id: In(ids) }, { deletedAt: null });

    // Update Redis cache for all restored roles
    const cacheUpdates: Promise<void>[] = [];

    for (const role of roles) {
      const createdBy = await role.createdBy;

      const roleSession: CachedRoleInputs = {
        id: role.id,
        name: role.name,
        description: role.description,
        createdAt: role.createdAt.toISOString(),
        deletedAt: "",
        createdBy: createdBy
          ? {
              id: createdBy.id,
              name: createdBy.firstName + " " + createdBy.lastName,
              role: createdBy.role.name,
            }
          : null,
      };

      cacheUpdates.push(setRoleInfoByRoleIdInRedis(role.id, roleSession));
    }

    await Promise.all(cacheUpdates);

    return {
      statusCode: 200,
      success: true,
      message: `Role(s) restored successfully`,
      __typename: "BaseResponse",
    };
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
