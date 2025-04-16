import { Repository } from "typeorm";
import { Context } from "../../../../context";
import { Permission } from "../../../../entities/permission.entity";
import { Role } from "../../../../entities/user-role.entity";
import { User } from "../../../../entities/user.entity";
import {
  getSingleUserCacheKey,
  getSingleUserPermissionCacheKey,
  getSingleUserRoleCacheKey,
} from "../../../../helper/redis/session-keys";
import {
  BaseResponse,
  ErrorResponse,
  MutationUpdateUserRoleArgs,
} from "../../../../types";
import { userRoleUpdateSchema } from "../../../../utils/data-validation/auth/auth";

/**
 * Allows an admin to update another user's role.
 *
 * Steps:
 * - Validates the input using a Zod schema
 * - Verifies if the requesting user is authenticated and has admin privileges
 * - Checks whether the role exists and is not already assigned to the target user
 * - Updates the target user's role in the database
 * - Invalidates user list caches to keep data fresh and update with the data
 *
 * @param _ - Unused GraphQL parent argument
 * @param args - Contains userId and newRoleId to be assigned
 * @param context - GraphQL context with AppDataSource, Redis, and user info
 * @returns Promise<BaseResponse | ErrorResponse> - Response status and message
 */
export const updateUserRole = async (
  _: any,
  args: MutationUpdateUserRoleArgs,
  { AppDataSource, user, redis }: Context
): Promise<BaseResponse | ErrorResponse> => {
  const { roleId, userId } = args;
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

    // Initialize repositories for Role, Permission, and User entities
    const roleRepository: Repository<Role> = AppDataSource.getRepository(Role);
    const permissionRepository: Repository<Permission> =
      AppDataSource.getRepository(Permission);
    const userRepository: Repository<User> = AppDataSource.getRepository(User);

    // Check Redis for cached user's id
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
        where: { user: { id: user.id }, name: "Role" },
      });

      // Cache permissions in Redis with configurable TTL(default 30 days of redis session because of the env)
      await setSession(
        getSingleUserPermissionCacheKey(userData.id),
        userPermissions
      );
    }

    // Check if the user has the "canUpdate" permission for roles
    const canUpdateUser = userPermissions.some(
      (permission) => permission.name === "User" && permission.canUpdate
    );

    if (!canUpdateUser) {
      return {
        statusCode: 403,
        success: false,
        message: "You do not have permission to update specific user's role",
        __typename: "BaseResponse",
      };
    }

    // Validate input data using Zod schema
    const validationResult = await userRoleUpdateSchema.safeParseAsync({
      userId,
      roleId,
    });

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

    // Get new role
    let newRole;
    newRole = await getSession(getSingleUserRoleCacheKey(roleId));

    if (!newRole) {
      // Cache miss: Fetch role from database
      const fetchedRole = await roleRepository.findOne({
        where: { id: roleId },
      });
      if (!fetchedRole) {
        return {
          statusCode: 404,
          success: false,
          message: `${newRole} does not exist`,
          __typename: "BaseResponse",
        };
      }

      newRole = {
        id: fetchedRole.id,
        name: fetchedRole.name,
        description: fetchedRole.description,
        createdAt: fetchedRole.createdAt,
        deletedAt: fetchedRole.deletedAt || null,
      };
    }

    // Get target user
    let targetUser;
    targetUser = await getSession(getSingleUserCacheKey(userId));

    if (!targetUser) {
      // Cache miss: Fetch user from database
      const fetchedUser = await userRepository.findOne({
        where: { id: userId },
        relations: ["role"],
      });

      if (!fetchedUser) {
        return {
          statusCode: 404,
          success: false,
          message: "Target user not found",
          __typename: "BaseResponse",
        };
      }

      targetUser = {
        id: fetchedUser.id,
        firstName: fetchedUser.firstName,
        lastName: fetchedUser.lastName,
        email: fetchedUser.email,
        role: fetchedUser.role?.name,
      };
    }

    // Compare role names
    if (targetUser.role === newRole.name) {
      return {
        statusCode: 400,
        success: false,
        message: "User already has the specified role",
        __typename: "BaseResponse",
      };
    }

    // Update role in DB
    await userRepository.update({ id: userId }, { role: newRole });

    // Update caches in Redis with configurable TTL(default 30 days of redis session because of the env)
    await setSession(getSingleUserCacheKey(userId), {
      id: targetUser.id,
      firstName: targetUser.firstName,
      lastName: targetUser.lastName,
      email: targetUser.email,
      role: newRole.name,
    });

    return {
      statusCode: 200,
      success: true,
      message: "User role updated successfully",
      __typename: "BaseResponse",
    };
  } catch (error: any) {
    console.error("Error updating role:", error);
    return {
      statusCode: 500,
      success: false,
      message: error.message || "Internal Server Error",
      __typename: "BaseResponse",
    };
  }
};
