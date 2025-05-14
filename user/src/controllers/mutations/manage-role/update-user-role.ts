import * as bcrypt from "bcryptjs";
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
  getUserInfoByEmailInRedis,
  getUserInfoByUserIdFromRedis,
  getUserPermissionsByUserIdFromRedis,
  setRoleInfoByRoleIdInRedis,
  setUserInfoByEmailInRedis,
  setUserInfoByUserIdInRedis,
  setUserPermissionsByUserIdInRedis,
} from "../../../helper/redis";
import {
  BaseResponseOrError,
  CachedUserPermissionsInputs,
  CachedUserSessionByEmailKeyInputs,
  MutationUpdateUserRoleArgs,
  UserSession,
} from "../../../types";
import CompareInfo from "../../../utils/bcrypt/compare-info";
import { userRoleUpdateSchema } from "../../../utils/data-validation";
import { CachedRoleInputs } from "./../../../types";

/**
 * Defines allowed permissions for each role
 */
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

    userData = await getUserInfoByEmailInRedis(user.email);

    if (!userData) {
      // Cache miss: Fetch user from database
      const dbUser = await userRepository.findOne({
        where: { id: user.id },
        relations: ["role"],
        select: {
          id: true,
          email: true,
          firstName: true,
          lastName: true,
          gender: true,
          emailVerified: true,
          isAccountActivated: true,
          password: true,
          role: { name: true },
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
        email: dbUser.email,
        firstName: dbUser.firstName,
        lastName: dbUser.lastName,
        role: dbUser.role.name,
        gender: dbUser.gender,
        password: dbUser.password,
        emailVerified: dbUser.emailVerified,
        isAccountActivated: dbUser.isAccountActivated,
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
      await setUserPermissionsByUserIdInRedis(userData.id, fullPermissions);
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
      const isPasswordValid = await bcrypt.compare(password, userData.password);
      if (!isPasswordValid) {
        return {
          statusCode: 403,
          success: false,
          message: "Invalid password",
          __typename: "BaseResponse",
        };
      }
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

      // Fetch user with password from database
      const dbUser = await userRepository.findOne({
        where: { id: user.id },
        select: { password: true },
      });

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
      });

      if (!dbRole) {
        return {
          statusCode: 404,
          success: false,
          message: `Role with ID ${roleId} not found`,
          __typename: "BaseResponse",
        };
      }

      const roleSession: CachedRoleInputs = {
        id: dbRole.id,
        name: dbRole.name,
        description: dbRole.description,
        createdAt: dbRole.createdAt.toISOString(),
        deletedAt: dbRole.deletedAt ? dbRole.deletedAt.toISOString() : null,
        createdBy: {
          id: (await dbRole.createdBy).id,
          name: `${(await dbRole.createdBy).firstName} ${
            (await dbRole.createdBy).lastName
          }`,
          role: (await dbRole.createdBy).role.name,
        },
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

    // Check Redis for cached target user's data
    let targetUser = await getUserInfoByUserIdFromRedis(userId);

    if (!targetUser) {
      // Cache miss: Fetch the target user from the database
      const dbUser = await userRepository.findOne({
        where: { id: userId },
        relations: ["role"],
      });

      if (!dbUser) {
        return {
          statusCode: 404,
          success: false,
          message: `User with ID ${userId} not found`,
          __typename: "BaseResponse",
        };
      }

      targetUser = {
        ...dbUser,
        role: dbUser.role.name,
      };
    }

    // Prevent self-role changes
    if (targetUser.id === user.id) {
      return {
        statusCode: 403,
        success: false,
        message: "You can't change your own role",
        __typename: "BaseResponse",
      };
    }

    // Prevent modifying SUPER ADMIN roles
    if (targetUser.role === "SUPER ADMIN") {
      return {
        statusCode: 403,
        success: false,
        message: "You are not allowed to modify a SUPER ADMIN role",
        __typename: "BaseResponse",
      };
    }

    // Update the user's role
    await userRepository.update(userId, { role: { id: roleId } });

    // Synchronize permissions only if the new role is defined in ROLE_PERMISSIONS
    const newRolePermissions = ROLE_PERMISSIONS[roleData.name];
    if (newRolePermissions) {
      // Remove existing permissions for the user
      await permissionRepository.delete({ user: { id: userId } });

      // Create new permissions based on ROLE_PERMISSIONS
      const permissionsToCreate: Partial<Permission>[] = [];
      const allPermissionNames = new Set([
        ...newRolePermissions.read,
        ...newRolePermissions.create,
        ...newRolePermissions.update,
        ...newRolePermissions.delete,
      ]);

      for (const name of allPermissionNames) {
        permissionsToCreate.push({
          name: name as PermissionName,
          description: `Permission for ${name}`,
          user: userRepository.findOneOrFail({ where: { id: userId } }),
          createdBy: userRepository.findOneOrFail({ where: { id: user.id } }),
          canCreate: newRolePermissions.create.includes(name),
          canRead: newRolePermissions.read.includes(name),
          canUpdate: newRolePermissions.update.includes(name),
          canDelete: newRolePermissions.delete.includes(name),
          createdAt: new Date(),
          deletedAt: null,
        });
      }

      // Insert new permissions
      await permissionRepository.save(permissionsToCreate);

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

      // Cache updated permissions in Redis
      await setUserPermissionsByUserIdInRedis(userId, cachedPermissions);
    }

    // Fetch the updated user with required relations
    const updatedUser = await userRepository.findOneOrFail({
      where: { id: userId },
      relations: ["role"],
    });

    const updatedUserSession: UserSession = {
      id: updatedUser.id,
      email: updatedUser.email,
      firstName: updatedUser.firstName,
      lastName: updatedUser.lastName,
      role: updatedUser.role.name,
      gender: updatedUser.gender,
      emailVerified: updatedUser.emailVerified,
      isAccountActivated: updatedUser.isAccountActivated,
    };

    // Cache updated user in Redis
    await setUserInfoByUserIdInRedis(userId, updatedUserSession);

    return {
      statusCode: 200,
      success: true,
      message: newRolePermissions
        ? "User role and permissions updated successfully. To see the changes user have to logout and then login again."
        : "User role updated successfully, permissions unchanged. To see the changes user have to logout and then login again.",
      __typename: "BaseResponse",
    };
  } catch (error: any) {
    console.error("Error updating user role:", error);
    return {
      statusCode: 500,
      success: false,
      message: error.message || "Internal server error",
      __typename: "BaseResponse",
    };
  }
};
