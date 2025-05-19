import { Repository } from "typeorm";
import { Context } from "../../../context";
import { Permission } from "../../../entities/permission.entity";
import { Role } from "../../../entities/user-role.entity";
import { User } from "../../../entities/user.entity";
import {
  getRoleInfoByRoleIdFromRedis,
  getTotalUserCountByRoleIdFromRedis,
  getUserInfoByEmailInRedis,
  getUserPermissionsByUserIdFromRedis,
  removeRoleInfoByRoleIdFromRedis,
  removeRoleInfoByRoleNameFromRedis,
  removeRoleNameExistFromRedis,
  setRoleInfoByRoleIdInRedis,
  setRoleNameExistInRedis,
  setTotalUserCountByRoleIdInRedis,
  setUserInfoByEmailInRedis,
  setUserPermissionsByUserIdInRedis,
} from "../../../helper/redis";
import {
  removeTotalUserCountByRoleIdFromRedis,
  setRoleInfoByRoleNameInRedis,
} from "../../../helper/redis/utils/role/role-session-manage";
import {
  BaseResponseOrError,
  CachedUserPermissionsInputs,
  CachedUserSessionByEmailKeyInputs,
  MutationDeleteUserRoleArgs,
} from "../../../types";
import CompareInfo from "../../../utils/bcrypt/compare-info";
import { idsSchema, skipTrashSchema } from "../../../utils/data-validation";
import { checkUserAuth } from "../../../utils/session-check/session-check";
import { CachedRoleInputs } from "./../../../types";

/**
 * Deletes a user roles with validation and permission checks.
 *
 * Steps:
 * - Validates input using Zod schema
 * - Authenticates user and checks role creation permission
 * - Checks Redis for roles data to optimize performance via caching
 * - Confirms the roles are exists and is not protected or in use
 * - Performs a soft delete/permanently delete on the role depending on the skipTrash
 * - Clears related cache entries
 *
 * @param _ - Unused parent resolver argument
 * @param args - Arguments for the roles delete input (ids, skipTrash)
 * @param context - GraphQL context with AppDataSource and user info
 * @returns Promise<BaseResponseOrError> - Response status and message
 */
export const deleteUserRole = async (
  _: any,
  args: MutationDeleteUserRoleArgs,
  { AppDataSource, user }: Context
): Promise<BaseResponseOrError> => {
  const { ids, skipTrash, password } = args;

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

    userData = await getUserInfoByEmailInRedis(user.email);

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
          emailVerified: true,
          gender: true,
          role: {
            name: true,
          },
          password: true,
          isAccountActivated: true,
          tempUpdatedEmail: true,
          tempEmailVerified: true,
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

      const userSessionByEmail: CachedUserSessionByEmailKeyInputs = {
        id: dbUser.id,
        firstName: dbUser.firstName,
        lastName: dbUser.lastName,
        email: dbUser.email,
        emailVerified: dbUser.emailVerified,
        gender: dbUser.gender,
        role: dbUser.role.name,
        password: dbUser.password,
        isAccountActivated: dbUser.isAccountActivated,
        tempUpdatedEmail: dbUser.tempUpdatedEmail,
        tempEmailVerified: dbUser.tempEmailVerified,
      };

      userData = userSessionByEmail;

      // Cache user in Redis
      await setUserInfoByEmailInRedis(user.email, userSessionByEmail);
    }

    // Check Redis for cached user permissions
    let userPermissions;

    userPermissions = await getUserPermissionsByUserIdFromRedis(userData.id);

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
        message: "You do not have permission to delete role(s)",
        __typename: "BaseResponse",
      };
    }

    // Validate input data using Zod schema
    const [idsResult, skipTrashResult] = await Promise.all([
      idsSchema.safeParseAsync({ ids }),
      skipTrashSchema.safeParseAsync({ skipTrash }),
    ]);

    if (!idsResult.success || !skipTrashResult.success) {
      const errors = [
        ...(idsResult.error?.errors || []),
        ...(skipTrashResult.error?.errors || []),
      ].map((e) => ({
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
      if (!password) {
        return {
          statusCode: 400,
          success: false,
          message: "Password is required for non-SUPER ADMIN users",
          __typename: "BaseResponse",
        };
      }

      // Verify password
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

    if (userData.role !== "SUPER ADMIN" && skipTrash) {
      return {
        statusCode: 400,
        success: false,
        message:
          "Only SUPER ADMIN can permanently delete a user role. Please remove the skip to trash.",
        __typename: "BaseResponse",
      };
    }

    // Check for protected roles
    const protectedRoles = [
      "SUPER ADMIN",
      "ADMIN",
      "INVENTORY MANAGER",
      "CUSTOMER SUPPORT",
      "CUSTOMER",
    ];

    for (const id of ids) {
      // Check Redis for cached role's data
      let roleData = await getRoleInfoByRoleIdFromRedis(id);

      if (!roleData) {
        // Cache miss: Fetch role from database
        const dbRole = await roleRepository.findOne({
          where: { id },
          relations: ["createdBy", "createdBy.role"],
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
              role: {
                name: true,
              },
            },
          },
        });

        if (!dbRole) {
          return {
            statusCode: 404,
            success: false,
            message: `Role with ID ${id} not found`,
            __typename: "BaseResponse",
          };
        }

        const createdBy = await dbRole.createdBy;

        const roleSession: CachedRoleInputs = {
          id: dbRole.id,
          name: dbRole.name,
          description: dbRole.description,
          createdAt: dbRole.createdAt.toISOString(),
          deletedAt: dbRole.deletedAt ? dbRole.deletedAt.toISOString() : null,
          createdBy: {
            id: createdBy.id,
            name: createdBy.firstName + " " + createdBy.lastName,
            role: createdBy.role.name,
          },
        };

        roleData = roleSession;

        // Cache user role & name existence in Redis
        await Promise.all([
          setRoleInfoByRoleIdInRedis(roleData.id, roleSession),
          setRoleNameExistInRedis(roleData.name),
        ]);
      }

      if (protectedRoles.includes(roleData.name)) {
        return {
          statusCode: 403,
          success: false,
          message: `The role "${roleData.name}" is protected and cannot be deleted`,
          __typename: "BaseResponse",
        };
      }

      // Check Redis for cached user permissions
      let userCountForRole;

      // Check Redis for the user count with this role
      userCountForRole = await getTotalUserCountByRoleIdFromRedis(roleData.id);

      if (userCountForRole === 0) {
        // Cache miss: Count users in database efficiently
        userCountForRole = await userRepository.count({
          where: { role: { id: roleData.id } },
        });

        // Cache user count with this role in Redis
        await setTotalUserCountByRoleIdInRedis(roleData.id, userCountForRole);
      }

      if (userCountForRole) {
        return {
          statusCode: 400,
          success: false,
          message:
            "Role is associated with existing users and cannot be deleted",
          __typename: "BaseResponse",
        };
      }

      if (skipTrash) {
        // Delete the record permanently
        await roleRepository.delete(id);

        // Clear cache in Redis with configurable
        await Promise.all([
          removeRoleInfoByRoleIdFromRedis(roleData.id),
          removeRoleInfoByRoleNameFromRedis(roleData.name),
          removeRoleNameExistFromRedis(roleData.name),
          removeTotalUserCountByRoleIdFromRedis(roleData.id),
        ]);
      } else {
        // Mark the role as soft-deleted by setting deletedAt timestamp manually
        await roleRepository.update(id, { deletedAt: new Date() });

        // Fetch the updated role with required relations
        const softDeletedRole = await roleRepository.findOneOrFail({
          where: { id },
          relations: ["createdBy", "createdBy.role"],
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
              role: {
                name: true,
              },
            },
          },
        });

        const createdBy = await softDeletedRole.createdBy;

        const roleSession: CachedRoleInputs = {
          id: softDeletedRole.id,
          name: softDeletedRole.name,
          description: softDeletedRole.description,
          createdAt: softDeletedRole.createdAt.toISOString(),
          deletedAt: softDeletedRole.deletedAt?.toISOString(),
          createdBy: {
            id: createdBy.id,
            name: createdBy.firstName + " " + createdBy.lastName,
            role: createdBy.role.name,
          },
        };

        // Cache newly soft-deleted role
        await Promise.all([
          setRoleInfoByRoleIdInRedis(id, roleSession),
          setRoleInfoByRoleNameInRedis(id, roleSession),
        ]);
      }

      return {
        statusCode: 200,
        success: true,
        message: `${
          skipTrash
            ? "Role(s) permanently deleted successfully"
            : "Role(s) moved to trash successfully"
        }`,
        __typename: "BaseResponse",
      };
    }
  } catch (error: any) {
    console.error("Error deleting role:", error);

    return {
      statusCode: 500,
      success: false,
      message: error.message || "Internal server error",
      __typename: "BaseResponse",
    };
  }
};
