import { Repository } from "typeorm";
import { Context } from "../../../../context";
import {
  Permission,
  PermissionName,
} from "../../../../entities/permission.entity";
import { Role } from "../../../../entities/user-role.entity";
import { User } from "../../../../entities/user.entity";
import { getSingleUserCacheKey } from "../../../../helper/redis/session-keys";
import {
  BaseResponse,
  ErrorResponse,
  MutationUpdateUserPermissionArgs,
} from "../../../../types";
import { updateUserPermissionSchema } from "../../../../utils/data-validation";
import { getSingleUserPermissionCacheKey } from "./../../../../helper/redis/session-keys";

/**
 * Allows an authenticated user to change other users permission for crud.
 *
 * Steps:
 * - Validates input using Zod schema
 * - Ensures the user is authenticated
 * - Checks if the user has permission to update other users
 * - Updates the permission of the specified user in the database
 *
 * @param _ - Unused GraphQL parent argument
 * @param args - Arguments for update permission for crud (accessAll, userId, permissions)
 * @param context - GraphQL context with AppDataSource, Redis, and user info
 * @returns Promise<BaseResponse | ErrorResponse> - Response status and message
 */
export const updateUserPermission = async (
  _,
  args: MutationUpdateUserPermissionArgs,
  { AppDataSource, redis, user }: Context
): Promise<BaseResponse | ErrorResponse> => {
  const { userId, accessAll, permissions } = args.input;
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

    // Check if the user has the "canUpdate" permission for users
    const canUpdatePermission = userPermissions.some(
      (permission) => permission.name === "Permission" && permission.canUpdate
    );

    if (!canUpdatePermission) {
      return {
        statusCode: 403,
        success: false,
        message: "You do not have permission to update user permissions",
        __typename: "BaseResponse",
      };
    }

    // Validate input data using Zod schema
    const validationResult = await updateUserPermissionSchema.safeParseAsync({
      userId,
      accessAll,
      permissions,
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

    // Get target user
    let targetUser;
    targetUser = await getSession(getSingleUserCacheKey(userId));

    if (!targetUser) {
      // Cache miss: Fetch user from database
      const fetchedUser = await userRepository.findOne({
        where: { id: userId },
        relations: ["role"],
        select: ["id", "firstName", "lastName", "email", "role"],
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

      // Cache target user data in Redis with configurable TTL(default 30 days of redis session because of the env)
      await setSession(getSingleUserCacheKey(userId), targetUser);
    }

    // If the accessAll flag is true, then update the user permission for all permission true
    if (accessAll) {
      await permissionRepository.update(
        { user: { id: userId } },
        {
          description: "All permissions granted",
          canRead: true,
          canCreate: true,
          canUpdate: true,
          canDelete: true,
        }
      );

      // Re-fetch the updated permissions for caching
      const reFetchedPermissions = await permissionRepository.find({
        where: { user: { id: userId } },
      });

      // Cache updated permissions in Redis with configurable TTL(default 30 days of redis session because of the env)
      await setSession(
        getSingleUserPermissionCacheKey(userId),
        reFetchedPermissions
      );

      return {
        statusCode: 200,
        success: true,
        message: "User permissions updated successfully",
        __typename: "BaseResponse",
      };
    } else {
      // Get target user's permissions
      let targetUserPermissions;

      targetUserPermissions = await getSession(
        getSingleUserPermissionCacheKey(userId)
      );

      if (!targetUserPermissions) {
        // Cache miss: Fetch permission from database
        targetUserPermissions = await permissionRepository.find({
          where: { user: { id: userId } },
        });

        if (!targetUserPermissions) {
          return {
            statusCode: 404,
            success: false,
            message: "Target user permissions not found",
            __typename: "BaseResponse",
          };
        }
      }

      // Update user permissions based on provided permissions
      await Promise.all(
        permissions.map(async (permission) => {
          // Find existing permission for this user and name
          const existingPermission = targetUserPermissions.find(
            (userPermission) => userPermission.name === permission.name
          );

          // Prepare the updated values, keeping the existing values where fields are not provided
          const updatedPermission = {
            description:
              permission.description ?? existingPermission?.description,
            canRead: permission.canRead ?? existingPermission?.canRead,
            canCreate: permission.canCreate ?? existingPermission?.canCreate,
            canUpdate: permission.canUpdate ?? existingPermission?.canUpdate,
            canDelete: permission.canDelete ?? existingPermission?.canDelete,
          };

          await permissionRepository.update(
            {
              user: { id: userId },
              name: permission.name as PermissionName,
            },
            updatedPermission
          );
        })
      );

      // Re-fetch the updated permissions for caching
      const reFetchedPermissions = await permissionRepository.find({
        where: { user: { id: userId } },
      });

      // Cache updated permissions in Redis with configurable TTL(default 30 days of redis session because of the env)
      await setSession(
        getSingleUserPermissionCacheKey(userId),
        reFetchedPermissions
      );

      return {
        statusCode: 200,
        success: true,
        message: "User permissions updated successfully",
        __typename: "BaseResponse",
      };
    }
  } catch (error: any) {
    console.error("Update user permissions error:", error);
    return {
      statusCode: 500,
      success: false,
      message: "Failed to update user permissions",
      __typename: "BaseResponse",
    };
  }
};
