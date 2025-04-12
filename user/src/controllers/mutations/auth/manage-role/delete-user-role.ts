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
 * Deletes a user role from the system after verifying it's not associated with any users
 * @param _ - Unused GraphQL parent argument
 * @param args - Registration arguments (The ID of the role to delete)
 * @param context - Application context containing AppDataSource
 * @returns Promise<BaseResponse | ErrorResponse> - Result of the delete operation
 */
export const deleteUserRole = async (
  _: any,
  args: MutationDeleteUserRoleArgs,
  { AppDataSource, user, redis }: Context
): Promise<BaseResponse | ErrorResponse> => {
  const { getSession, setSession, deleteSession } = redis;
  const { id } = args;

  try {
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

    // 🔴 Check Redis for cached user permissions
    const permissionCacheKey = `user-permissions-${user.id}-role`;
    let userPermissions: Permission[] | null = await getSession<Permission[]>(
      permissionCacheKey
    );

    if (!userPermissions) {
      // Cache miss: Fetch permissions from database
      userPermissions = await permissionRepository.find({
        where: { user: { id: user.id }, name: "Role" },
      });

      // Cache permissions in Redis (TTL: 30 days)
      await setSession(permissionCacheKey, userPermissions, 60 * 60 * 24 * 30);
    }

    // Check if the user has the "canDelete" permission for roles
    const canDeleteRole = userPermissions.some(
      (permission) => permission.canDelete
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

    // 🔴 Check Redis for role existence
    const roleCacheKey = `user-role-${id}`;
    const cachedRoleExists = await getSession<string>(roleCacheKey);

    let role: Role | null = null;
    if (cachedRoleExists) {
      // Cache hit: Parse the cached role data
      role = JSON.parse(cachedRoleExists) as Role;
    } else {
      // Cache miss: Fetch role from database
      role = await roleRepository.findOne({ where: { id } });

      if (role) {
        // Cache role data (TTL: 30 days)
        await setSession(roleCacheKey, role, 60 * 60 * 24 * 30);
      }
    }

    if (!role) {
      return {
        statusCode: 404,
        success: false,
        message: "Role not found",
        __typename: "BaseResponse",
      };
    }

    // 🔴 Check Redis for cached user-role association count
    const userCountCacheKey = `role-users-${id}`;
    const cachedUserCount = await getSession<string>(userCountCacheKey);

    let userCount: number;
    if (cachedUserCount !== null) {
      // Cache hit: Use cached count
      userCount = parseInt(cachedUserCount, 10);
    } else {
      // Cache miss: Count users in database
      userCount = await userRepository.count({
        where: { role: { id } },
      });

      // Cache user count (TTL: 30 days)
      await setSession(
        userCountCacheKey,
        userCount.toString(),
        60 * 60 * 24 * 30
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

    // Safe to delete the role
    await roleRepository.remove(role);

    // 🔴 Invalidate related Redis caches
    const normalizedRoleKey = role.name.trim().toLowerCase();
    const roleNameCacheKey = `role-name-${normalizedRoleKey}`;
    await deleteSession(roleCacheKey); // Clear role data
    await deleteSession(userCountCacheKey); // Clear user count
    await deleteSession(roleNameCacheKey); // Clear role name from createUserRole

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
