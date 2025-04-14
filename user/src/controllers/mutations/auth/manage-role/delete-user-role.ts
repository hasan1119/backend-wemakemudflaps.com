import { Repository } from "typeorm";
import { Context } from "../../../../context";
import { Permission } from "../../../../entities/permission.entity";
import { Role } from "../../../../entities/user-role.entity";
import { User } from "../../../../entities/user.entity";
import {
  getSingleUserCacheKey,
  getSingleUserPermissionCacheKey,
  getSingleUserRoleCacheKey,
  getSingleUserRoleNameCacheKey,
  getUserRoleCountAssociateCacheKey,
} from "../../../../helper/redis/session-keys";
import {
  BaseResponse,
  ErrorResponse,
  MutationDeleteUserRoleArgs,
} from "../../../../types";
import { idSchema } from "../../../../utils/data-validation/auth/auth";

/**
 * Deletes a user role from the system with validation and permission checks.
 * - Validates input using Zod schema.
 * - Ensures the user is authenticated and has permission to delete roles.
 * - Verifies the role exists and has no associated users.
 * - Soft-deletes the role and clears related caches.
 * - Invalidates role list caches to keep data fresh.
 * @param _ - Unused GraphQL parent argument
 * @param args - Arguments for deleting the role (id)
 * @param context - Application context containing AppDataSource, user, and redis
 * @returns Promise<BaseResponse | ErrorResponse> - Result of the delete operation
 */
export const deleteUserRole = async (
  _: any,
  args: MutationDeleteUserRoleArgs,
  { AppDataSource, user, redis }: Context
): Promise<BaseResponse | ErrorResponse> => {
  const { id } = args;
  const { getSession, setSession, deleteSession } = redis;

  try {
    // Check if user is authenticated
    if (!user) {
      return {
        statusCode: 401,
        success: false,
        message: "You're not authenticated",
        __typename: "BaseResponse",
      };
    }

    // Initialize repositories for Role, User, and Permission entities
    const roleRepository: Repository<Role> = AppDataSource.getRepository(Role);
    const userRepository: Repository<User> = AppDataSource.getRepository(User);
    const permissionRepository: Repository<Permission> =
      AppDataSource.getRepository(Permission);

    // Check Redis for cached user's email
    let userData;

    userData = await getSession(getSingleUserCacheKey(user.id));

    if (!userData) {
      // Cache miss: Fetch user from database
      userData = await userRepository.findOne({
        where: { id: user.id },
      });

      if (!userData) {
        return {
          statusCode: 404,
          success: false,
          message: "Authenticated user not found in database",
          __typename: "BaseResponse",
        };
      }
    }

    // Check Redis for cached user permissions
    let userPermissions;

    userPermissions = await getSession<Permission[]>(
      getSingleUserPermissionCacheKey(userData.id)
    );

    if (!userPermissions) {
      // Cache miss: Fetch permissions from database, selecting only necessary fields
      userPermissions = await permissionRepository.find({
        where: { user: { id: user.id }, name: "Role" },
      });

      // Cache permissions in Redis with configurable TTL(default 30 days of redis session because of the env)
      await setSession(
        getSingleUserPermissionCacheKey(userData.id),
        userPermissions
      );
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
    const validationResult = await idSchema.safeParseAsync({
      id,
    });

    // If validation fails, return detailed error messages
    if (!validationResult.success) {
      const errorMessages = validationResult.error.errors.map((error) => ({
        field: error.path.join("."),
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

    // Check Redis for role existence
    let role;

    role = await getSession(getSingleUserRoleCacheKey(id));

    if (!role) {
      // Cache miss: Fetch role from database
      role = await roleRepository.findOne({
        where: { id },
        relations: ["createdBy", "createdBy.role"],
        select: {
          id: true,
          name: true,
          description: true,
          createdAt: true,
          createdBy: {
            id: true,
            firstName: true,
            lastName: true,
            email: true,
            role: {
              name: true,
            },
          },
        },
      });

      if (!role) {
        return {
          statusCode: 404,
          success: false,
          message: "Role not found",
          __typename: "BaseResponse",
        };
      }

      // Cache role data
      await setSession(getSingleUserRoleCacheKey(role.id), {
        id: role.id,
        name: role.name,
        description: role.description,
        createdAt: role.createdAt.toISOString(),
        createdBy: {
          id: userData.id,
          name: `${userData.firstName + " " + userData.lastName}`,
          email: userData.email,
          role: userData.role,
        },
      }); // TTL : default 30 days of redis session because of the env
    }

    // Check for protected roles
    const protectedRoles = ["SUPER ADMIN", "ADMIN", "CUSTOMER"];
    if (protectedRoles.includes(role.name)) {
      return {
        statusCode: 403,
        success: false,
        message: `The role "${role.name}" is protected and cannot be deleted`,
        __typename: "BaseResponse",
      };
    }

    // Check Redis for cached user-role association count
    let userCount: number | null = null;

    const cachedUserCount = await getSession<string>(
      getUserRoleCountAssociateCacheKey(role.id)
    );
    userCount = cachedUserCount ? parseInt(cachedUserCount, 10) : null;

    if (userCount === null) {
      // Cache miss: Count users in database efficiently
      userCount = await userRepository.count({
        where: { role: { id } },
        select: [], // Optimize by not selecting fields
      });

      // Cache user count
      await setSession(
        getUserRoleCountAssociateCacheKey(role.id),
        userCount.toString()
      ); // TTL : default 30 days of redis session because of the env
    }

    if (userCount > 0) {
      return {
        statusCode: 400,
        success: false,
        message: "Role is associated with existing users and cannot be deleted",
        __typename: "BaseResponse",
      };
    }

    // Soft-delete the role to respect the deletedAt column
    await roleRepository.softRemove(role);

    // Invalidate related Redis caches
    const normalizedRoleKey = role.name.trim().toLowerCase();

    await deleteSession(getSingleUserRoleCacheKey(role.id)); // Clear role data
    await deleteSession(getUserRoleCountAssociateCacheKey(role.id)); // Clear user count
    await deleteSession(getSingleUserRoleNameCacheKey(normalizedRoleKey)); // Clear role name

    return {
      statusCode: 200,
      success: true,
      message: "Role deleted successfully",
      __typename: "BaseResponse",
    };
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
