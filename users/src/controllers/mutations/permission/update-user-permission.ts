import { Repository } from "typeorm";
import { Context } from "../../../context";
import {
  Permission,
  PermissionName,
} from "../../../entities/permission.entity";
import { User } from "../../../entities/user.entity";
import {
  getUserInfoByEmailInRedis,
  getUserInfoByUserIdFromRedis,
  getUserPermissionsByUserIdFromRedis,
  setUserInfoByEmailInRedis,
  setUserInfoByUserIdInRedis,
  setUserPermissionsByUserIdInRedis,
} from "../../../helper/redis";
import {
  BaseResponseOrError,
  CachedUserPermissionsInputs,
  CachedUserSessionByEmailKeyInputs,
  MutationUpdateUserPermissionArgs,
  UserSession,
} from "../../../types";
import CompareInfo from "../../../utils/bcrypt/compare-info";
import { updateUserPermissionSchema } from "../../../utils/data-validation";
import { PermissionEnum } from "../../../utils/data-validation/permission/permission";
import { checkUserAuth } from "../../../utils/session-check/session-check";

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
 * Updates the permissions of a specified user with validation and permission checks.
 *
 * Steps:
 * - Validates input using Zod schema
 * - Authenticates user and checks permission update authorization
 * - Requires password for non-SUPER ADMIN users and validates it
 * - Checks Redis for user and permission data to optimize performance
 * - Prevents changes to SUPER ADMIN permissions
 * - Prevents ADMIN from changing another ADMIN's permissions
 * - Allows SUPER ADMIN to change any permissions without password
 * - Updates permissions based on accessAll, deniedAll, or custom permissions
 * - Invalidates user session and updates Redis caches
 *
 * @param _ - Unused parent resolver argument
 * @param args - Arguments for permission update (userId, accessAll, deniedAll, permissions, password)
 * @param context - GraphQL context with AppDataSource and user info
 * @returns Promise<BaseResponseOrError> - Response status and message
 */
export const updateUserPermission = async (
  _: any,
  args: MutationUpdateUserPermissionArgs,
  { AppDataSource, user }: Context
): Promise<BaseResponseOrError> => {
  const { userId, accessAll, deniedAll, permissions, password } = args.input;

  try {
    // Check user authentication
    const authResponse = checkUserAuth(user);
    if (authResponse) return authResponse;

    // Initialize repositories
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

    // Check if the user has "canUpdate" permission for Permission
    const canUpdatePermission = userPermissions.some(
      (permission) => permission.name === "Permission" && permission.canUpdate
    );
    const canCreatePermission = userPermissions.some(
      (permission) => permission.name === "Permission" && permission.canCreate
    );

    const canUpdatePermissions = canUpdatePermission && canCreatePermission;

    if (!canUpdatePermissions) {
      return {
        statusCode: 403,
        success: false,
        message: "You do not have permission to update permissions",
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

    // Validate input data using Zod schema
    const validationResult = await updateUserPermissionSchema.safeParseAsync({
      userId,
      accessAll,
      deniedAll,
      permissions,
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

    // Check Redis for cached target user's data
    let targetUser = await getUserInfoByUserIdFromRedis(userId);

    if (!targetUser) {
      // Cache miss: Fetch the target user from the database
      const dbUser = await userRepository.findOne({
        where: { id: userId },
        relations: ["role"],
        select: {
          id: true,
          firstName: true,
          lastName: true,
          email: true,
          gender: true,
          role: {
            name: true,
          },
          emailVerified: true,
          isAccountActivated: true,
        },
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

      const userSession: UserSession = {
        id: dbUser.id,
        firstName: dbUser.firstName,
        lastName: dbUser.lastName,
        email: dbUser.email,
        gender: dbUser.gender,
        role: dbUser.role.name,
        emailVerified: dbUser.emailVerified,
        isAccountActivated: dbUser.isAccountActivated,
      };

      // Cache target user in Redis
      await setUserInfoByUserIdInRedis(userId, userSession);
    }

    // Prevent changes to SUPER ADMIN permissions
    if (targetUser.role === "SUPER ADMIN") {
      return {
        statusCode: 403,
        success: false,
        message: "Cannot modify permissions of a SUPER ADMIN",
        __typename: "BaseResponse",
      };
    }

    // Prevent ADMIN from changing another ADMIN's permissions
    if (userData.role === "ADMIN" && targetUser.role === "ADMIN") {
      return {
        statusCode: 403,
        success: false,
        message: "ADMIN cannot modify another ADMIN's permissions",
        __typename: "BaseResponse",
      };
    }

    // Prevent self permissions changes
    if (targetUser.id === user.id) {
      return {
        statusCode: 403,
        success: false,
        message: "You can't change your own permissions",
        __typename: "BaseResponse",
      };
    }

    // Remove existing permissions for the user
    await permissionRepository.delete({ user: { id: userId } });

    // Initialize permissions to create
    const permissionsToCreate: Partial<Permission>[] = [];

    // Handle permissions based on target user's role
    const isRestrictedRole =
      targetUser.role === "CUSTOMER" || targetUser.role === "INVENTORY MANAGER";
    const rolePerms = ROLE_PERMISSIONS[targetUser.role];

    if (validationResult.data.accessAll) {
      // For CUSTOMER and INVENTORY MANAGER, grant only ROLE_PERMISSIONS; others false
      if (isRestrictedRole && rolePerms) {
        const allPermissionNames = Object.values(
          PermissionEnum
        ) as PermissionName[];
        for (const name of allPermissionNames) {
          permissionsToCreate.push({
            name,
            description: `Access for ${name}`,
            user: userRepository.findOneOrFail({ where: { id: userId } }),
            createdBy: userRepository.findOneOrFail({
              where: { id: user.id },
            }),
            canCreate: rolePerms.create.includes(name),
            canRead: rolePerms.read.includes(name),
            canUpdate: rolePerms.update.includes(name),
            canDelete: rolePerms.delete.includes(name),
          });
        }
      } else {
        // For other rolled user, grant full permissions
        const allPermissionNames = Object.values(
          PermissionEnum
        ) as PermissionName[];
        for (const name of allPermissionNames) {
          permissionsToCreate.push({
            name,
            description: `Access for ${name}`,
            user: userRepository.findOneOrFail({ where: { id: userId } }),
            createdBy: userRepository.findOneOrFail({
              where: { id: user.id },
            }),
            canCreate: true,
            canRead: true,
            canUpdate: true,
            canDelete: true,
          });
        }
      }
    } else if (validationResult.data.deniedAll) {
      // Set all permissions to false for all rolled users
      const allPermissionNames = Object.values(
        PermissionEnum
      ) as PermissionName[];
      for (const name of allPermissionNames) {
        permissionsToCreate.push({
          name,
          description: `Access for ${name}`,
          user: userRepository.findOneOrFail({ where: { id: userId } }),
          createdBy: userRepository.findOneOrFail({
            where: { id: user.id },
          }),
          canCreate: false,
          canRead: false,
          canUpdate: false,
          canDelete: false,
        });
      }
    } else if (validationResult.data.permissions) {
      const allPermissionNames = Object.values(
        PermissionEnum
      ) as PermissionName[];
      const providedNames = new Set(
        validationResult.data.permissions.map((p) => p.name)
      );

      // Handle provided permissions
      for (const perm of validationResult.data.permissions) {
        if (isRestrictedRole && rolePerms) {
          // For restricted roles, only allow permissions defined in ROLE_PERMISSIONS
          if (
            rolePerms.read.includes(perm.name) ||
            rolePerms.create.includes(perm.name) ||
            rolePerms.update.includes(perm.name) ||
            rolePerms.delete.includes(perm.name)
          ) {
            permissionsToCreate.push({
              name: perm.name,
              description: perm.description || `Access for ${perm.name}`,
              user: userRepository.findOneOrFail({ where: { id: userId } }),
              createdBy: userRepository.findOneOrFail({
                where: { id: user.id },
              }),
              canCreate:
                rolePerms.create.includes(perm.name) &&
                (perm.canCreate ?? false),
              canRead:
                rolePerms.read.includes(perm.name) && (perm.canRead ?? false),
              canUpdate:
                rolePerms.update.includes(perm.name) &&
                (perm.canUpdate ?? false),
              canDelete:
                rolePerms.delete.includes(perm.name) &&
                (perm.canDelete ?? false),
            });
          }
        } else {
          // For non-restricted roles, apply permissions as provided
          permissionsToCreate.push({
            name: perm.name,
            description: perm.description || `Access for ${perm.name}`,
            user: userRepository.findOneOrFail({ where: { id: userId } }),
            createdBy: userRepository.findOneOrFail({
              where: { id: user.id },
            }),
            canCreate: perm.canCreate ?? false,
            canRead: perm.canRead ?? false,
            canUpdate: perm.canUpdate ?? false,
            canDelete: perm.canDelete ?? false,
          });
        }
      }

      // Add all missing permissions from PermissionEnum with all actions set to false
      for (const name of allPermissionNames) {
        if (!providedNames.has(name)) {
          permissionsToCreate.push({
            name,
            description: `Access for ${name}`,
            user: userRepository.findOneOrFail({ where: { id: userId } }),
            createdBy: userRepository.findOneOrFail({
              where: { id: user.id },
            }),
            canCreate: false,
            canRead: false,
            canUpdate: false,
            canDelete: false,
          });
        }
      }
    }

    // Insert new permissions (if any)
    if (permissionsToCreate.length > 0) {
      await permissionRepository.save(permissionsToCreate);
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

    // Cache updated permissions
    await setUserPermissionsByUserIdInRedis(userId, cachedPermissions);

    return {
      statusCode: 200,
      success: true,
      message: "User permissions updated successfully.",
      __typename: "BaseResponse",
    };
  } catch (error: any) {
    console.error("Error updating user permissions:", error);
    return {
      statusCode: 500,
      success: false,
      message: error.message || "Internal server error",
      __typename: "BaseResponse",
    };
  }
};
