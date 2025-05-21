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
 * - Updates existing permissions or creates new ones based on accessAll, deniedAll, or custom permissions
 * - Preserves user, createdBy, createdAt, and deletedAt for existing permissions
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

    // Check if the user has "canUpdate" and "canCreate" permission for Permission
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

    // Fetch authenticated user and target user entities
    const [authUserEntity, targetUserEntity] = await Promise.all([
      userRepository.findOne({ where: { id: user.id } }),
      userRepository.findOne({
        where: { id: userId, deletedAt: null },
        relations: ["role"],
      }),
    ]);

    if (!authUserEntity) {
      return {
        statusCode: 404,
        success: false,
        message: "Authenticated user not found",
        __typename: "BaseResponse",
      };
    }

    if (!targetUserEntity) {
      return {
        statusCode: 404,
        success: false,
        message: `User with ID ${userId} not found or has been deleted`,
        __typename: "BaseResponse",
      };
    }

    // Cache target user in Redis if not already cached
    if (!(await getUserInfoByUserIdFromRedis(userId))) {
      const userSession: UserSession = {
        id: targetUserEntity.id,
        firstName: targetUserEntity.firstName,
        lastName: targetUserEntity.lastName,
        email: targetUserEntity.email,
        gender: targetUserEntity.gender,
        role: targetUserEntity.role.name,
        emailVerified: targetUserEntity.emailVerified,
        isAccountActivated: targetUserEntity.isAccountActivated,
      };
      await setUserInfoByUserIdInRedis(userId, userSession);
    }

    // Prevent changes to SUPER ADMIN permissions
    if (targetUserEntity.role.name === "SUPER ADMIN") {
      return {
        statusCode: 403,
        success: false,
        message: "Cannot modify permissions of a SUPER ADMIN",
        __typename: "BaseResponse",
      };
    }

    // Prevent ADMIN from changing another ADMIN's permissions
    if (userData.role === "ADMIN" && targetUserEntity.role.name === "ADMIN") {
      return {
        statusCode: 403,
        success: false,
        message: "ADMIN cannot modify another ADMIN's permissions",
        __typename: "BaseResponse",
      };
    }

    // Prevent self permissions changes
    if (targetUserEntity.id === user.id) {
      return {
        statusCode: 403,
        success: false,
        message: "You can't change your own permissions",
        __typename: "BaseResponse",
      };
    }

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

    // Handle permissions based on target user's role
    const isRestrictedRole =
      targetUserEntity.role.name === "CUSTOMER" ||
      targetUserEntity.role.name === "INVENTORY MANAGER";
    const rolePerms = ROLE_PERMISSIONS[targetUserEntity.role.name];

    // Get permission names directly from PermissionEnum.options
    const allPermissionNames = PermissionEnum.options as PermissionName[];

    if (validationResult.data.accessAll) {
      // For CUSTOMER and INVENTORY MANAGER, grant only ROLE_PERMISSIONS; others false
      if (isRestrictedRole && rolePerms) {
        for (const name of allPermissionNames) {
          const existingPerm = permissionMap.get(name);
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
            canCreate: rolePerms.create.includes(name),
            canRead: rolePerms.read.includes(name),
            canUpdate: rolePerms.update.includes(name),
            canDelete: rolePerms.delete.includes(name),
            createdAt: existingPerm?.createdAt, // Preserve createdAt
            deletedAt: existingPerm?.deletedAt, // Preserve deletedAt
          });
        }
      } else {
        // For other roles, grant full permissions
        for (const name of allPermissionNames) {
          const existingPerm = permissionMap.get(name);
          permissionsToUpsert.push({
            id: existingPerm?.id,
            name,
            description: `Access for ${name}`,
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
            createdAt: existingPerm?.createdAt,
            deletedAt: existingPerm?.deletedAt,
          });
        }
      }
    } else if (validationResult.data.deniedAll) {
      // Set all permissions to false for all roles
      for (const name of allPermissionNames) {
        const existingPerm = permissionMap.get(name);
        permissionsToUpsert.push({
          id: existingPerm?.id,
          name,
          description: `Access for ${name}`,
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
          createdAt: existingPerm?.createdAt,
          deletedAt: existingPerm?.deletedAt,
        });
      }
    } else if (validationResult.data.permissions) {
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
            const existingPerm = permissionMap.get(perm.name);
            permissionsToUpsert.push({
              id: existingPerm?.id,
              name: perm.name,
              description: perm.description || `Access for ${perm.name}`,
              user: existingPerm
                ? existingPerm.user
                : Promise.resolve(targetUserEntity),
              createdBy: existingPerm
                ? existingPerm.createdBy
                : Promise.resolve(authUserEntity),
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
              createdAt: existingPerm?.createdAt,
              deletedAt: existingPerm?.deletedAt,
            });
          }
        } else {
          // For non-restricted roles, apply permissions as provided
          const existingPerm = permissionMap.get(perm.name);
          permissionsToUpsert.push({
            id: existingPerm?.id,
            name: perm.name,
            description: perm.description || `Access for ${perm.name}`,
            user: existingPerm
              ? existingPerm.user
              : Promise.resolve(targetUserEntity),
            createdBy: existingPerm
              ? existingPerm.createdBy
              : Promise.resolve(authUserEntity),
            canCreate: perm.canCreate ?? false,
            canRead: perm.canRead ?? false,
            canUpdate: perm.canUpdate ?? false,
            canDelete: perm.canDelete ?? false,
            createdAt: existingPerm?.createdAt,
            deletedAt: existingPerm?.deletedAt,
          });
        }
      }

      // Add all missing permissions from PermissionEnum with all actions set to false
      for (const name of allPermissionNames) {
        if (!providedNames.has(name)) {
          const existingPerm = permissionMap.get(name);
          permissionsToUpsert.push({
            id: existingPerm?.id,
            name,
            description: `Access for ${name}`,
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
            createdAt: existingPerm?.createdAt,
            deletedAt: existingPerm?.deletedAt,
          });
        }
      }
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

    // Cache updated permissions
    await setUserPermissionsByUserIdInRedis(userId, cachedPermissions);

    return {
      statusCode: 200,
      success: true,
      message: "User permissions updated successfully",
      __typename: "BaseResponse",
    };
  } catch (error: any) {
    console.error("Error updating user permissions:", {
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
