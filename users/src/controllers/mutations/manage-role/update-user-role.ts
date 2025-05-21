import { Repository } from "typeorm";
import { Context } from "../../../context";
import {
  Permission,
  PermissionName,
} from "../../../entities/permission.entity";
import { Role } from "../../../entities/user-role.entity";
import { User } from "../../../entities/user.entity";
import {
  getRoleInfoByRoleIdFromRedis,
  getTotalUserCountByRoleIdFromRedis,
  getUserInfoByEmailInRedis,
  getUserInfoByUserIdFromRedis,
  getUserPermissionsByUserIdFromRedis,
  setRoleInfoByRoleIdInRedis,
  setTotalUserCountByRoleIdInRedis,
  setUserInfoByUserIdInRedis,
  setUserPermissionsByUserIdInRedis,
} from "../../../helper/redis";
import {
  removeUserInfoByEmailFromRedis,
  removeUserTokenByUserIdFromRedis,
} from "../../../helper/redis/utils/user/user-session-manage";
import {
  BaseResponseOrError,
  CachedUserPermissionsInputs,
  CachedUserSessionByEmailKeyInputs,
  MutationUpdateUserRoleArgs,
  UserSession,
} from "../../../types";
import CompareInfo from "../../../utils/bcrypt/compare-info";
import { userRoleUpdateSchema } from "../../../utils/data-validation";
import { PermissionEnum } from "../../../utils/data-validation/permission/permission";
import { checkUserAuth } from "../../../utils/session-check/session-check";
import { setUserInfoByEmailInRedis } from "./../../../helper/redis/utils/user/user-session-manage";
import { CachedRoleInputs } from "./../../../types";

// Define allowed permissions
const ROLE_PERMISSIONS: {
  [key: string]: {
    read: PermissionName[];
    create: PermissionName[];
    update: PermissionName[];
    delete: PermissionName[];
  };
} = {
  CUSTOMER: {
    read: [
      "Brand",
      "Category",
      "Product",
      "Product Review",
      "Shipping Class",
      "Sub Category",
      "Tax Class",
      "Tax Status",
      "FAQ",
      "Pop Up Banner",
      "Privacy & Policy",
      "Terms & Conditions",
      "Order",
      "Notification",
    ],
    create: ["Order", "Notification"],
    update: ["Product Review", "Notification"],
    delete: ["Order", "Product Review", "Notification"],
  },
  "INVENTORY MANAGER": {
    read: [
      "Brand",
      "Category",
      "Product",
      "Product Review",
      "Shipping Class",
      "Sub Category",
      "Tax Class",
      "Tax Status",
    ],
    create: [
      "Brand",
      "Category",
      "Sub Category",
      "Product",
      "Tax Class",
      "Tax Status",
    ],
    update: [
      "Brand",
      "Category",
      "Sub Category",
      "Product",
      "Tax Class",
      "Tax Status",
    ],
    delete: [
      "Brand",
      "Category",
      "Sub Category",
      "Product",
      "Tax Class",
      "Tax Status",
    ],
  },
  ADMIN: {
    read: [
      "Brand",
      "Category",
      "Product",
      "Product Review",
      "Shipping Class",
      "Sub Category",
      "Tax Class",
      "Tax Status",
      "FAQ",
      "Pop Up Banner",
      "Privacy & Policy",
      "Terms & Conditions",
      "Order",
      "Notification",
      "User",
      "Permission",
      "Role",
    ],
    create: [
      "Brand",
      "Category",
      "Sub Category",
      "Product",
      "Tax Class",
      "Tax Status",
      "FAQ",
      "Pop Up Banner",
      "Privacy & Policy",
      "Terms & Conditions",
      "Order",
      "Notification",
      "User",
      "Permission",
      "Role",
    ],
    update: [
      "Brand",
      "Category",
      "Sub Category",
      "Product",
      "Tax Class",
      "Tax Status",
      "FAQ",
      "Pop Up Banner",
      "Privacy & Policy",
      "Terms & Conditions",
      "Order",
      "Notification",
      "User",
      "Permission",
      "Role",
    ],
    delete: [
      "Brand",
      "Category",
      "Sub Category",
      "Product",
      "Tax Class",
      "Tax Status",
      "FAQ",
      "Pop Up Banner",
      "Privacy & Policy",
      "Terms & Conditions",
      "Order",
      "Notification",
      "User",
      "Permission",
      "Role",
    ],
  },
};

/**
 * Updates an existing user's role with validation, permission checks, and permission synchronization for defined roles.
 * Updates the user count for old and new roles in Redis.
 *
 * Steps:
 * - Validates input using Zod schema
 * - Authenticates user and checks role update permission
 * - Requires password for non-SUPER ADMIN users and validates it
 * - Checks Redis for user and role data to optimize performance via caching
 * - Confirms the user and role exist and the role is not soft-deleted
 * - Prevents self-role changes and SUPER ADMIN role modifications
 * - Updates the user's role in the database
 * - Synchronizes user permissions if the new role is defined in ROLE_PERMISSIONS
 * - Updates role user counts in Redis (decrement old role, increment new role)
 * - Updates related cache entries
 *
 * @param _ - Unused parent resolver argument
 * @param args - Arguments for the role update input (roleId, userId, password)
 * @param context - GraphQL context with AppDataSource and user info
 * @returns Promise<BaseResponseOrError> - Response status and message
 */
export const updateUserRole = async (
  _: any,
  args: MutationUpdateUserRoleArgs,
  { AppDataSource, user }: Context
): Promise<BaseResponseOrError> => {
  const { roleId, userId, password } = args;

  try {
    // Check user authentication
    const authResponse = checkUserAuth(user);
    if (authResponse) return authResponse;

    // Initialize repositories for Role, User, and Permission entities
    const roleRepository: Repository<Role> = AppDataSource.getRepository(Role);
    const userRepository: Repository<User> = AppDataSource.getRepository(User);
    const permissionRepository: Repository<Permission> =
      AppDataSource.getRepository(Permission);

    // Check Redis for cached authenticated user's data
    let userData = await getUserInfoByEmailInRedis(user.email);

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
          role: { name: true },
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
    let userPermissions = await getUserPermissionsByUserIdFromRedis(user.id);

    if (!userPermissions) {
      // Cache miss: Fetch permissions from database
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
      await setUserPermissionsByUserIdInRedis(user.id, fullPermissions);
    }

    // Check if the user has the "canUpdate" permission for both User and Permission
    const canUpdateUser = userPermissions.some(
      (permission) => permission.name === "User" && permission.canUpdate
    );
    const canUpdatePermission = userPermissions.some(
      (permission) => permission.name === "Permission" && permission.canUpdate
    );
    const canUpdateRole = canUpdateUser && canUpdatePermission;

    if (!canUpdateRole) {
      return {
        statusCode: 403,
        success: false,
        message: "You do not have permission to update roles",
        __typename: "BaseResponse",
      };
    }

    // Validate input data using Zod schema
    const validationResult = await userRoleUpdateSchema.safeParseAsync({
      roleId,
      userId,
      password,
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

    // Check Redis for cached role's data
    let roleData = await getRoleInfoByRoleIdFromRedis(roleId);

    if (!roleData) {
      // Cache miss: Fetch role from database
      const dbRole = await roleRepository.findOne({
        where: { id: roleId },
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
            role: { name: true },
          },
        },
      });

      if (!dbRole) {
        return {
          statusCode: 404,
          success: false,
          message: `Role with ID ${roleId} not found`,
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
        createdBy: createdBy
          ? {
              id: createdBy.id,
              name: `${createdBy.firstName} ${createdBy.lastName}`,
              role: createdBy.role.name,
            }
          : null,
      };

      roleData = roleSession;

      // Cache role in Redis
      await setRoleInfoByRoleIdInRedis(roleData.id, roleSession);
    }

    // Check if the role is soft-deleted
    if (roleData.deletedAt) {
      return {
        statusCode: 400,
        success: false,
        message: `Role with ID ${roleId} is in the trash and cannot be assigned`,
        __typename: "BaseResponse",
      };
    }

    // Prevent assigning SUPER ADMIN role
    if (roleData.name === "SUPER ADMIN") {
      return {
        statusCode: 403,
        success: false,
        message: "Cannot assign SUPER ADMIN role to any user",
        __typename: "BaseResponse",
      };
    }

    // Check Redis for cached target user's data and role
    let targetUser = await getUserInfoByUserIdFromRedis(userId);
    let oldRoleId: string | null = null;

    if (!targetUser) {
      // Cache miss: Fetch the target user from the database
      const dbUser = await userRepository.findOne({
        where: { id: userId, deletedAt: null },
        relations: ["role"],
        select: {
          id: true,
          email: true,
          firstName: true,
          lastName: true,
          role: { id: true, name: true },
          gender: true,
          password: true,
          emailVerified: true,
          isAccountActivated: true,
        },
      });

      if (!dbUser) {
        return {
          statusCode: 404,
          success: false,
          message: `User with ID ${userId} not found or has been deleted`,
          __typename: "BaseResponse",
        };
      }

      targetUser = {
        id: dbUser.id,
        email: dbUser.email,
        firstName: dbUser.firstName,
        lastName: dbUser.lastName,
        role: dbUser.role.name,
        gender: dbUser.gender,
        emailVerified: dbUser.emailVerified,
        isAccountActivated: dbUser.isAccountActivated,
      };

      oldRoleId = dbUser.role.id;
    } else {
      // Fetch old role ID from database if not in Redis
      const dbUser = await userRepository.findOne({
        where: { id: userId, deletedAt: null },
        relations: ["role"],
        select: { role: { id: true } },
      });

      if (!dbUser) {
        return {
          statusCode: 404,
          success: false,
          message: `User with ID ${userId} not found or has been deleted`,
          __typename: "BaseResponse",
        };
      }

      if (dbUser && dbUser.role) {
        oldRoleId = dbUser.role.id;
      }
    }

    // Prevent self-role changes
    if (targetUser.id === user.id) {
      return {
        statusCode: 403,
        success: false,
        message: "You cannot change your own role",
        __typename: "BaseResponse",
      };
    }

    // Prevent modifying SUPER ADMIN roles
    if (targetUser.role === "SUPER ADMIN") {
      return {
        statusCode: 403,
        success: false,
        message: "Cannot change the role of a SUPER ADMIN",
        __typename: "BaseResponse",
      };
    }

    // Prevent modifying ADMIN roles except by SUPER ADMIN
    if (targetUser.role === "ADMIN" && userData.role !== "SUPER ADMIN") {
      return {
        statusCode: 403,
        success: false,
        message: "Only SUPER ADMIN can modify users with the ADMIN role",
        __typename: "BaseResponse",
      };
    }

    // Update the user's role
    await userRepository.update(userId, { role: { id: roleId } });

    // Synchronize permissions only if the new role is defined in ROLE_PERMISSIONS
    const newRolePermissions = ROLE_PERMISSIONS[roleData.name];
    if (newRolePermissions) {
      // Fetch target user and authenticated user entities
      const [targetUserEntity, authUserEntity] = await Promise.all([
        userRepository.findOne({
          where: { id: userId, deletedAt: null },
          select: { id: true },
        }),
        userRepository.findOne({
          where: { id: user.id, deletedAt: null },
          select: { id: true },
        }),
      ]);

      // Fetch existing permissions for the user
      const existingPermissions = await permissionRepository.find({
        where: { user: { id: userId } },
        relations: ["user", "createdBy"],
      });

      // Map existing permissions by name for quick lookup
      const permissionMap = new Map(
        existingPermissions.map((perm) => [perm.name, perm])
      );

      // Initialize permissions to upsert (update existing or create new)
      const permissionsToUpsert: Partial<Permission>[] = [];

      // Get all permission names from PermissionEnum.options
      const allPermissionNames = PermissionEnum.options as PermissionName[];

      // Handle permissions for the new role
      for (const name of allPermissionNames) {
        const existingPerm = permissionMap.get(name);
        const isRolePermission =
          newRolePermissions.read.includes(name) ||
          newRolePermissions.create.includes(name) ||
          newRolePermissions.update.includes(name) ||
          newRolePermissions.delete.includes(name);

        permissionsToUpsert.push({
          id: existingPerm?.id, // Preserve ID for updates
          name,
          description: `Access for ${name}`,
          user: existingPerm
            ? existingPerm.user
            : Promise.resolve(targetUserEntity),
          createdBy: existingPerm
            ? existingPerm.createdBy
            : Promise.resolve(authUserEntity),
          canCreate: isRolePermission
            ? newRolePermissions.create.includes(name)
            : false,
          canRead: isRolePermission
            ? newRolePermissions.read.includes(name)
            : false,
          canUpdate: isRolePermission
            ? newRolePermissions.update.includes(name)
            : false,
          canDelete: isRolePermission
            ? newRolePermissions.delete.includes(name)
            : false,
          createdAt: existingPerm?.createdAt, // Preserve createdAt
          deletedAt: existingPerm?.deletedAt, // Preserve deletedAt
        });
      }

      // Upsert permissions (update existing or insert new)
      if (permissionsToUpsert.length > 0) {
        await permissionRepository.save(permissionsToUpsert);
      }

      // Fetch updated permissions for caching
      const updatedPermissions = await permissionRepository.find({
        where: { user: { id: userId } },
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

      const cachedPermissions: CachedUserPermissionsInputs[] =
        updatedPermissions.map((permission) => ({
          id: permission.id,
          name: permission.name,
          description: permission.description,
          canCreate: permission.canCreate,
          canRead: permission.canRead,
          canUpdate: permission.canUpdate,
          canDelete: permission.canDelete,
        }));

      // Cache updated permissions and remove user token from Redis
      await Promise.all([
        setUserPermissionsByUserIdInRedis(userId, cachedPermissions),
        removeUserInfoByEmailFromRedis(userId),
        removeUserTokenByUserIdFromRedis(userId),
      ]);
    }

    // Fetch the updated user with required relations
    const updatedUser = await userRepository.findOneOrFail({
      where: { id: userId },
      relations: ["role"],
      select: {
        id: true,
        firstName: true,
        lastName: true,
        email: true,
        password: true,
        gender: true,
        emailVerified: true,
        isAccountActivated: true,
        tempUpdatedEmail: true,
        tempEmailVerified: true,
        role: { name: true },
      },
    });

    const updatedUserSession: UserSession = {
      id: updatedUser.id,
      firstName: updatedUser.firstName,
      lastName: updatedUser.lastName,
      email: updatedUser.email,
      gender: updatedUser.gender,
      role: updatedUser.role.name,
      emailVerified: updatedUser.emailVerified,
      isAccountActivated: updatedUser.isAccountActivated,
    };

    const userSessionByEmail: CachedUserSessionByEmailKeyInputs = {
      id: updatedUser.id,
      firstName: updatedUser.firstName,
      lastName: updatedUser.lastName,
      email: updatedUser.email,
      emailVerified: updatedUser.emailVerified,
      gender: updatedUser.gender,
      role: updatedUser.role.name,
      password: updatedUser.password,
      isAccountActivated: updatedUser.isAccountActivated,
      tempUpdatedEmail: updatedUser.tempUpdatedEmail,
      tempEmailVerified: updatedUser.tempEmailVerified,
    };

    // Update role user counts in Redis
    const roleCountUpdates: Promise<void>[] = [];

    if (oldRoleId && oldRoleId !== roleId) {
      // Decrement old role's user count
      const oldCount = await getTotalUserCountByRoleIdFromRedis(oldRoleId);
      if (oldCount > 0) {
        roleCountUpdates.push(
          setTotalUserCountByRoleIdInRedis(oldRoleId, oldCount - 1)
        );
      }
    }

    // Increment new role's user count
    const newCount = await getTotalUserCountByRoleIdFromRedis(roleId);
    roleCountUpdates.push(
      setTotalUserCountByRoleIdInRedis(roleId, newCount + 1)
    );

    // Cache updated user and role in Redis
    await Promise.all([
      ...roleCountUpdates,
      setUserInfoByUserIdInRedis(userId, updatedUserSession),
      setUserInfoByEmailInRedis(updatedUser.email, userSessionByEmail),
      removeUserTokenByUserIdFromRedis(userId),
    ]);

    return {
      statusCode: 200,
      success: true,
      message: newRolePermissions
        ? "User role and permissions updated successfully. User must log out and log in again to see changes."
        : "User role updated successfully, permissions unchanged. User must log out and log in again to see changes.",
      __typename: "BaseResponse",
    };
  } catch (error: any) {
    console.error("Error updating user role:", {
      message: error.message,
    });

    return {
      statusCode: 500,
      success: false,
      message: error.message || "Internal server error",
      __typename: "BaseResponse",
    };
  }
};
