import { Repository } from "typeorm";
import { Context } from "../../../context";
import { Permission } from "../../../entities/permission.entity";
import { Role } from "../../../entities/user-role.entity";
import { User } from "../../../entities/user.entity";
import {
  getSingleUserCacheKey,
  getSingleUserPermissionCacheKey,
  getSingleUserRoleCacheKey,
  getSingleUserRoleNameCacheKey,
  getUserRoleCountAssociateCacheKey,
} from "../../../helper/redis/session-keys";
import {
  BaseResponseOrError,
  MutationDeleteUserRoleArgs,
} from "../../../types";
import { idSchema } from "../../../utils/data-validation";

/**
 * Deletes a user role with validation and permission checks.
 *
 * Steps:
 * - Validates input using Zod
 * - Authenticates user and checks role delete permission
 * - Confirms the role exists and is not protected or in use
 * - Performs a soft delete on the role
 * - Clears related cache entries
 *
 * @param _ - Unused parent resolver argument
 * @param args - Contains the role ID to delete
 * @param context - GraphQL context with AppDataSource, Redis, and user info
 * @returns Promise<BaseResponseOrError> - Response status and message
 */
export const deleteUserRole = async (
  _: any,
  args: MutationDeleteUserRoleArgs,
  { AppDataSource, user, redis }: Context
): Promise<BaseResponseOrError> => {
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

    // Check Redis for cached user's data
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

    userPermissions = await getSession(
      getSingleUserPermissionCacheKey(userData.id)
    );

    if (!userPermissions) {
      // Cache miss: Fetch permissions from database, selecting only necessary fields
      userPermissions = await permissionRepository.find({
        where: { user: { id: user.id } },
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

      // Cache role data in Redis with configurable TTL(default 30 days of redis session because of the env)
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
      });
    }

    // Check for protected roles
    const protectedRoles = [
      "SUPER ADMIN",
      "ADMIN",
      "INVENTORY MANAGER",
      "CUSTOMER SUPPORT",
      "CUSTOMER",
    ];

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

      // Cache user count in Redis with configurable TTL(default 30 days of redis session because of the env)
      await setSession(
        getUserRoleCountAssociateCacheKey(role.id),
        userCount.toString()
      );
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

    // Clear cache in Redis with configurable
    await deleteSession(getSingleUserRoleCacheKey(role.id));
    await deleteSession(getUserRoleCountAssociateCacheKey(role.id));
    await deleteSession(getSingleUserRoleNameCacheKey(normalizedRoleKey));

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
