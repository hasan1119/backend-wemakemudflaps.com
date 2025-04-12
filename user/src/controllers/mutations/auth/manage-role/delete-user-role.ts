import { Repository } from "typeorm";
import { Context } from "../../../../context";
import { Permission } from "../../../../entities/permission.entity";
import { Role } from "../../../../entities/user-role.entity";
import { User } from "../../../../entities/user.entity";
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
    // Initialize repositories for Role, User, and Permission entities
    const roleRepository: Repository<Role> = AppDataSource.getRepository(Role);
    const userRepository: Repository<User> = AppDataSource.getRepository(User);
    const permissionRepository: Repository<Permission> =
      AppDataSource.getRepository(Permission);

    // Validate input data using Zod schema
    const validationResult = await idSchema.safeParseAsync({
      id,
    });

    // Check if user is authenticated
    if (!user) {
      return {
        statusCode: 401,
        success: false,
        message: "You're not authenticated",
        __typename: "BaseResponse",
      };
    }

    // Check Redis for cached user permissions
    const permissionCacheKey = `user-permissions-${user.id}`;
    let userPermissions: Permission[] | null = null;

    userPermissions = await getSession<Permission[]>(permissionCacheKey);

    if (!userPermissions) {
      // Cache miss: Fetch permissions from database, selecting only necessary fields
      userPermissions = await permissionRepository.find({
        where: { user: { id: user.id }, name: "Role" },
        select: ["id", "canCreate", "canUpdate", "canDelete"],
      });

      // Cache permissions in Redis with configurable TTL
      const TTL = 2592000; // 30 days in seconds

      await setSession(permissionCacheKey, userPermissions, TTL);
    }

    // Check if the user has the "canDelete" permission for roles
    const canDeleteRole = userPermissions.some(
      (permission) => permission.name === "Role" && permission.canDelete
    );

    if (!canDeleteRole) {
      return {
        statusCode: 403,
        success: false,
        message: "You do not have permission to delete roles.",
        __typename: "BaseResponse",
      };
    }

    // If validation fails, return detailed error messages
    if (!validationResult.success) {
      const errorMessages = validationResult.error.errors.map((error) => ({
        field: error.path.join("."),
        message: error.message,
      }));

      return {
        statusCode: 400,
        success: false,
        message: "Validation failed.",
        errors: errorMessages,
        __typename: "ErrorResponse",
      };
    }

    // Check Redis for role existence
    const roleCacheKey = `user-role-${id}`;
    let role: Role | null = null;

    role = await getSession<Role>(roleCacheKey);

    if (!role) {
      // Cache miss: Fetch role from database
      role = await roleRepository.findOne({ where: { id } });

      if (!role) {
        return {
          statusCode: 404,
          success: false,
          message: "Role not found",
          __typename: "BaseResponse",
        };
      }

      // Cache role data
      const TTL = 2592000; // 30 days in seconds

      await setSession(roleCacheKey, role, TTL);
    }

    // Check Redis for cached user-role association count
    const userCountCacheKey = `role-users-${id}`;
    let userCount: number | null = null;

    const cachedUserCount = await getSession<string>(userCountCacheKey);
    userCount = cachedUserCount ? parseInt(cachedUserCount, 10) : null;

    if (userCount === null) {
      // Cache miss: Count users in database efficiently
      userCount = await userRepository.count({
        where: { role: { id } },
        select: [], // Optimize by not selecting fields
      });

      // Cache user count
      const TTL = 2592000; // 30 days in seconds

      await setSession(userCountCacheKey, userCount.toString(), TTL);
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
    const roleNameCacheKey = `role-name-${normalizedRoleKey}`;

    await deleteSession(roleCacheKey); // Clear role data
    await deleteSession(userCountCacheKey); // Clear user count
    await deleteSession(roleNameCacheKey); // Clear role name
    await deleteSession("roles-all"); // Invalidate role lists

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
