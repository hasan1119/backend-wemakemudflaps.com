import { Repository } from "typeorm";
import { Context } from "../../../context";
import { Permission } from "../../../entities/permission.entity";
import { Role } from "../../../entities/user-role.entity";
import { User } from "../../../entities/user.entity";
import {
  getRoleInfoByRoleIdFromRedis,
  getUserInfoByEmailInRedis,
  getUserPermissionsByUserIdFromRedis,
  removeUserTokenByUserIdFromRedis,
  setRoleInfoByRoleIdInRedis,
  setUserInfoByEmailInRedis,
  setUserPermissionsByUserIdInRedis,
} from "../../../helper/redis";
import {
  BaseResponseOrError,
  CachedUserPermissionsInputs,
  CachedUserSessionByEmailKeyInputs,
  MutationUpdateUserRoleInfoArgs,
} from "../../../types";
import CompareInfo from "../../../utils/bcrypt/compare-info";
import { userRoleSchema } from "../../../utils/data-validation";
import { checkUserAuth } from "../../../utils/session-check/session-check";
import { CachedRoleInputs } from "./../../../types";

/**
 * Updates an existing user role's information with validation and permission checks.
 *
 * Steps:
 * - Validates input using Zod schema
 * - Authenticates user and checks role update permission
 * - Requires password for non-SUPER ADMIN users and validates it
 * - Checks Redis for user and role data to optimize performance via caching
 * - Confirms the role exists, is not soft-deleted, and is not protected
 * - Updates the role's name and description in the database
 * - Updates related cache entries
 *
 * @param _ - Unused parent resolver argument
 * @param args - Arguments for the role update input (id, name, description, password)
 * @param context - GraphQL context with AppDataSource and user info
 * @returns Promise<BaseResponseOrError> - Response status and message
 */
export const updateUserRoleInfo = async (
  _: any,
  args: MutationUpdateUserRoleInfoArgs,
  { AppDataSource, user }: Context
): Promise<BaseResponseOrError> => {
  const { id, name, description, password } = args;

  try {
    // Check user authentication
    const authResponse = checkUserAuth(user);
    if (authResponse) return authResponse;

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
    let userPermissions;

    userPermissions = await getUserPermissionsByUserIdFromRedis(user.id);

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

    // Check if the user has the "canUpdate" permission for Role
    const canUpdateRole = userPermissions.some(
      (permission) => permission.name === "Role" && permission.canUpdate
    );

    if (!canUpdateRole) {
      return {
        statusCode: 403,
        success: false,
        message: "You do not have permission to update roles",
        __typename: "BaseResponse",
      };
    }

    // Validate input data using Zod schema
    const validationResult = await userRoleSchema.safeParseAsync({
      id,
      name,
      description,
      password,
    });

    // If validation fails, return detailed error messages with field names
    if (!validationResult.success) {
      const errors = validationResult.error.errors.map((e) => ({
        field: e.path.join("."),
        message: e.message,
      }));

      return {
        statusCode: 400,
        success: false,
        message: "Validation failed",
        errors,
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
    let roleData = await getRoleInfoByRoleIdFromRedis(id);

    if (!roleData) {
      // Cache miss: Fetch role from database
      const dbRole = await roleRepository.findOne({
        where: { id },
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
            role: {
              name: true,
            },
          },
        },
      });

      if (!dbRole) {
        return {
          statusCode: 404,
          success: false,
          message: `Role with ID ${id} not found`,
          __typename: "BaseResponse",
        };
      }

      const createdBy = await dbRole.createdBy;

      const roleSession: CachedRoleInputs = {
        id: dbRole.id,
        name: dbRole.name,
        description: dbRole.description,
        createdAt: dbRole.createdAt.toISOString(),
        deletedAt: null,
        createdBy: createdBy
          ? {
              id: createdBy.id,
              name: createdBy.firstName + " " + createdBy.lastName,
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
        message: `Role with ID ${id} is in the trash and cannot be updated`,
        __typename: "BaseResponse",
      };
    }

    // Check for protected roles
    const protectedRoles = [
      "SUPER ADMIN",
      "ADMIN",
      "INVENTORY MANAGER",
      "CUSTOMER SUPPORT",
      "CUSTOMER",
    ];

    if (protectedRoles.includes(roleData.name)) {
      return {
        statusCode: 403,
        success: false,
        message: `The role "${roleData.name}" is protected and cannot be updated`,
        __typename: "BaseResponse",
      };
    }

    // Update the role's information
    await roleRepository.update(id, {
      name: validationResult.data.name,
      description: validationResult.data.description,
    });

    // Update Redis cache for the role
    const updatedRole = await roleRepository.findOneOrFail({
      where: { id },
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
          role: {
            name: true,
          },
        },
      },
    });

    const createdBy = await updatedRole.createdBy;

    const updatedRoleSession: CachedRoleInputs = {
      id: updatedRole.id,
      name: updatedRole.name,
      description: updatedRole.description,
      createdAt: updatedRole.createdAt.toISOString(),
      deletedAt: updatedRole.deletedAt
        ? updatedRole.deletedAt.toISOString()
        : null,
      createdBy: createdBy
        ? {
            id: createdBy.id,
            name: createdBy.firstName + " " + createdBy.lastName,
            role: createdBy.role.name,
          }
        : null,
    };

    // Fetch users with this role to invalidate their tokens
    const users = await userRepository.find({
      where: { role: { id }, deletedAt: null },
      select: { id: true },
    });

    // Cache updated role and remove user tokens concurrently
    await Promise.all([
      ...users.map((user) => removeUserTokenByUserIdFromRedis(user.id)),
      setRoleInfoByRoleIdInRedis(id, updatedRoleSession),
    ]);

    return {
      statusCode: 200,
      success: true,
      message: "User role information updated successfully",
      __typename: "BaseResponse",
    };
  } catch (error: any) {
    console.error("Error updating user role info:", error);

    return {
      statusCode: 500,
      success: false,
      message: error.message || "Internal server error",
      __typename: "BaseResponse",
    };
  }
};
