import CONFIG from "../../../config/config";
import { Context } from "../../../context";
import { Permission } from "../../../entities";
import {
  clearAllUserSearchCache,
  getUserInfoByEmailFromRedis,
  setUserInfoByEmailInRedis,
  setUserInfoByUserIdInRedis,
  setUserPermissionsByUserIdInRedis,
} from "../../../helper/redis";
import {
  BaseResponseOrError,
  MutationUpdateUserPermissionArgs,
} from "../../../types";
import CompareInfo from "../../../utils/bcrypt/compare-info";
import {
  PermissionName,
  PERMISSIONS,
  updateUserPermissionSchema,
} from "../../../utils/data-validation";
import {
  checkUserAuth,
  checkUserPermission,
  deleteUserSpecificPermission,
  getPermissionsByUserId,
  getUserById,
  updateUserSpecificPermission,
} from "../../services";

/**
 * Handles updating a user's permissions with validation and permission checks.
 *
 * Workflow:
 * 1. Verifies user authentication and retrieves user data from Redis.
 * 2. Checks permission to update user permissions.
 * 3. Validates input (userId, accessAll, deniedAll, permissions, password) using Zod schema.
 * 4. For non-Super Admin users, verifies provided password.
 * 5. Retrieves authenticated and target user entities from the database.
 * 6. Prevents permission changes for SUPER ADMIN, self, shared-role users, or system-protected users.
 * 7. Fetches existing user permissions for reference.
 * 8. Constructs new permission set based on accessAll, deniedAll, or custom permissions input.
 * 9. Deletes existing user-specific permissions and applies new ones.
 * 10. Updates Redis caches with new user and permission data.
 * 11. Returns a success response or error if validation, permission, or update fails.
 *
 * @param _ - Unused parent parameter for GraphQL resolver.
 * @param args - Input arguments containing user ID, permission settings, and optional password.
 * @param context - GraphQL context containing authenticated user information.
 * @returns A promise resolving to a BaseResponseOrError object containing status, message, and errors if applicable.
 */
export const updateUserPermission = async (
  _: any,
  args: MutationUpdateUserPermissionArgs,
  { user }: Context
): Promise<BaseResponseOrError> => {
  try {
    // Verify user authentication
    const authResponse = checkUserAuth(user);
    if (authResponse) return authResponse;

    // Attempt to retrieve cached user data from Redis
    let userData;

    userData = await getUserInfoByEmailFromRedis(user.email);

    // Check if user has permission to update permissions
    const canUpdate = await checkUserPermission({
      action: "canUpdate",
      entity: "permission",
      user,
    });

    if (!canUpdate) {
      return {
        statusCode: 403,
        success: false,
        message: "You do not have permission to update any user permission",
        __typename: "BaseResponse",
      };
    }

    // Validate input data with Zod schema
    const validationResult = await updateUserPermissionSchema.safeParseAsync(
      args.input
    );

    if (!validationResult.success) {
      const errorMessages = validationResult.error.errors.map((error) => ({
        field: error.path.join("."), // Join path array to string for field identification
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

    const { userId, accessAll, deniedAll, permissions, password } =
      validationResult.data;

    const isNotSuperAdmin = !user.roles
      .map((role) => role.name)
      .includes("SUPER ADMIN");

    // Validate password for non-Super Admin users
    if (isNotSuperAdmin) {
      if (!password) {
        return {
          statusCode: 400,
          success: false,
          message: "Password is required for non-SUPER ADMIN users",
          __typename: "BaseResponse",
        };
      }

      // Verify provided password
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

    // Fetch authenticated and target user entities
    const [authUserEntity, targetUserEntity] = await Promise.all([
      getUserById(user.id),
      getUserById(userId),
    ]);

    if (!targetUserEntity) {
      return {
        statusCode: 404,
        success: false,
        message: `User with ID ${userId} not found, or it may have been deleted or moved to the trash.`,
        __typename: "BaseResponse",
      };
    }

    // Check for system update protections
    if (isNotSuperAdmin && !targetUserEntity.canUpdatePermissions) {
      return {
        statusCode: 403,
        success: false,
        message: `Permission update is restricted for ${
          targetUserEntity.firstName + " " + targetUserEntity.lastName
        }`,
        __typename: "BaseResponse",
      };
    }

    // Prevent changes to SUPER ADMIN permissions
    if (
      targetUserEntity.roles.some((role: any) => role.name === "SUPER ADMIN")
    ) {
      return {
        statusCode: 403,
        success: false,
        message: "Cannot modify permissions of a SUPER ADMIN",
        __typename: "BaseResponse",
      };
    }

    // Prevent permission changes for users with shared roles
    const currentUserRoleIds = new Set(userData.roles.map((r) => r.id));
    const hasCommonRoles = targetUserEntity.roles.some((r) =>
      currentUserRoleIds.has(r.id)
    );

    if (hasCommonRoles) {
      return {
        statusCode: 403,
        success: false,
        message: "You cannot modify a user who shares the same role(s) as you",
        __typename: "BaseResponse",
      };
    }

    // Prevent self-permission changes
    if (targetUserEntity.id === user.id) {
      return {
        statusCode: 403,
        success: false,
        message: "You can't change your own permissions",
        __typename: "BaseResponse",
      };
    }

    // Fetch existing user permissions
    const existingPermissions = await getPermissionsByUserId(userId);

    // Map existing permissions for quick lookup
    const permissionMap = new Map(
      existingPermissions.map((perm) => [perm.name, perm])
    );

    // Initialize permissions to upsert
    const permissionsToUpsert: Permission[] = [];

    // Get all permission names
    const allPermissionNames = PERMISSIONS as PermissionName[];

    // Apply accessAll permissions
    if (accessAll) {
      for (const name of allPermissionNames) {
        const existingPerm = permissionMap.get(name);
        permissionsToUpsert.push({
          id: existingPerm?.id ?? "",
          name,
          description: `${name} permission for ${targetUserEntity.firstName} ${targetUserEntity.lastName}`,
          user: existingPerm
            ? existingPerm.user
            : Promise.resolve(targetUserEntity),
          createdBy: existingPerm
            ? existingPerm.createdBy
            : Promise.resolve(authUserEntity),
          canCreate: true,
          canRead: true,
          canUpdate: true,
          canDelete: true,
          createdAt: existingPerm?.createdAt ?? new Date(),
          deletedAt: existingPerm?.deletedAt ?? null,
        });
      }
    }
    // Apply deniedAll permissions
    else if (deniedAll) {
      for (const name of allPermissionNames) {
        const existingPerm = permissionMap.get(name);
        permissionsToUpsert.push({
          id: existingPerm?.id ?? "",
          name,
          description: `${name} permission for ${targetUserEntity.firstName} ${targetUserEntity.lastName}`,
          user: existingPerm
            ? existingPerm.user
            : Promise.resolve(targetUserEntity),
          createdBy: existingPerm
            ? existingPerm.createdBy
            : Promise.resolve(authUserEntity),
          canCreate: false,
          canRead: false,
          canUpdate: false,
          canDelete: false,
          createdAt: existingPerm?.createdAt ?? new Date(),
          deletedAt: existingPerm?.deletedAt ?? null,
        });
      }
    }
    // Apply custom permissions
    else if (permissions.length > 0) {
      for (const perm of permissions) {
        permissionsToUpsert.push({
          id: permissionMap.get(perm.name as PermissionName)?.id ?? "",
          name: perm.name as PermissionName,
          description:
            perm.description ||
            `${perm.name} permission for ${targetUserEntity.firstName} ${targetUserEntity.lastName}`,
          user: Promise.resolve(targetUserEntity),
          createdBy: Promise.resolve(authUserEntity),
          canCreate: perm.canCreate ?? false,
          canRead: perm.canRead ?? false,
          canUpdate: perm.canUpdate ?? false,
          canDelete: perm.canDelete ?? false,
          createdAt:
            permissionMap.get(perm.name as PermissionName)?.createdAt ??
            new Date(),
          deletedAt:
            permissionMap.get(perm.name as PermissionName)?.deletedAt ?? null,
        });
      }
    }

    // Delete existing user-specific permissions
    await deleteUserSpecificPermission(targetUserEntity.id);

    // Always call updateUserSpecificPermission (even if list is empty)
    const updateUserWithPermission = await updateUserSpecificPermission(
      targetUserEntity,
      permissionsToUpsert
    );

    // Cache updated user and permission data in Redis
    await Promise.all([
      setUserPermissionsByUserIdInRedis(
        targetUserEntity.id,
        updateUserWithPermission
      ),
      setUserInfoByEmailInRedis(targetUserEntity.id, updateUserWithPermission),
      setUserInfoByUserIdInRedis(targetUserEntity.id, updateUserWithPermission),
      clearAllUserSearchCache(),
    ]);

    return {
      statusCode: 200,
      success: true,
      message: "User's personalized permissions updated successfully",
      __typename: "BaseResponse",
    };
  } catch (error: any) {
    console.error("Error updating user permissions:", {
      message: error.message,
    });

    return {
      statusCode: 500,
      success: false,
      message: `${
        CONFIG.NODE_ENV === "production"
          ? "Something went wrong, please try again."
          : error.message || "Internal server error"
      }`,
      __typename: "BaseResponse",
    };
  }
};
