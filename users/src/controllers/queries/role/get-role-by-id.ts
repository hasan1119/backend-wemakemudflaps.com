import { Repository } from "typeorm";
import { Context } from "../../../context";
import { Permission } from "../../../entities/permission.entity";
import { Role } from "../../../entities/user-role.entity";
import { User } from "../../../entities/user.entity";
import {
  getRoleInfoByRoleIdFromRedis,
  getUserInfoByUserIdFromRedis,
  getUserPermissionsByUserIdFromRedis,
  setRoleInfoByRoleIdInRedis,
  setUserInfoByUserIdInRedis,
  setUserPermissionsByUserIdInRedis,
} from "../../../helper/redis";
import {
  CachedRoleInputs,
  CachedUserPermissionsInputs,
  GetRoleByIdResponseOrError,
  QueryGetRoleArgs,
} from "../../../types";
import { idSchema } from "../../../utils/data-validation";
import { checkUserAuth } from "../../../utils/session-check/session-check";

/**
 * Retrieves a single user role by ID with validation and permission checks.
 *
 * Steps:
 * - Validates input using Zod schema
 * - Authenticates user and checks role view permission
 * - Checks Redis cache for role data before querying the database
 * - Returns the role data with combined firstName and lastName for createdBy, including the creator's role name
 *
 * @param _ - Unused GraphQL parent argument
 * @param args - Arguments for retrieving the role (id)
 * @param context - Application context containing AppDataSource and user
 * @returns Promise<GetRoleByIdResponseOrError> - Result of the get operation
 */
export const getRoleById = async (
  _: any,
  args: QueryGetRoleArgs,
  { AppDataSource, user }: Context
): Promise<GetRoleByIdResponseOrError> => {
  const { id } = args;

  try {
    // Check user authentication
    const authResponse = checkUserAuth(user);
    if (authResponse) return authResponse;

    // Initialize repositories
    const roleRepository: Repository<Role> = AppDataSource.getRepository(Role);
    const permissionRepository: Repository<Permission> =
      AppDataSource.getRepository(Permission);
    const userRepository: Repository<User> = AppDataSource.getRepository(User);

    // Check Redis for cached user data
    let userData;

    userData = await getUserInfoByUserIdFromRedis(user.id);

    if (!userData) {
      // Cache miss: Fetch user from database
      const dbUser = await userRepository.findOne({
        where: { id: user.id },
        relations: ["role"],
      });

      if (!dbUser) {
        return {
          statusCode: 404,
          success: false,
          message: "Authenticated user not found in database",
          __typename: "ErrorResponse",
        };
      }

      userData = {
        id: dbUser.id,
        email: dbUser.email,
        firstName: dbUser.firstName,
        lastName: dbUser.lastName,
        role: dbUser.role.name,
        gender: dbUser.gender,
        emailVerified: dbUser.emailVerified,
        isAccountActivated: dbUser.isAccountActivated,
      };

      // Cache user in Redis
      await setUserInfoByUserIdInRedis(user.id, userData);
    }

    // Check Redis for cached user permissions
    let userPermissions;

    userPermissions = await getUserPermissionsByUserIdFromRedis(user.id);

    if (!userPermissions) {
      // Cache miss: Fetch permissions from database
      userPermissions = await permissionRepository.find({
        where: { user: { id: user.id } },
      });

      const cachedPermissions: CachedUserPermissionsInputs[] =
        userPermissions.map((permission) => ({
          id: permission.id,
          name: permission.name,
          description: permission.description || "",
          canCreate: permission.canCreate,
          canRead: permission.canRead,
          canUpdate: permission.canUpdate,
          canDelete: permission.canDelete,
        }));

      // Cache permissions in Redis
      await setUserPermissionsByUserIdInRedis(user.id, cachedPermissions);
    }

    // Check if the user has "canRead" permission for Role
    const canReadRole = userPermissions.some(
      (permission) => permission.name === "Role" && permission.canRead
    );

    if (!canReadRole) {
      return {
        statusCode: 403,
        success: false,
        message: "You do not have permission to view role info",
        __typename: "BaseResponse",
      };
    }

    // Validate input data using Zod schema
    const validationResult = await idSchema.safeParseAsync({ id });

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

    // Check Redis for cached role data
    let roleData = await getRoleInfoByRoleIdFromRedis(id);

    if (!roleData) {
      // Cache miss: Fetch role from database
      const dbRole = await roleRepository.findOne({
        where: { id },
      });

      if (!dbRole) {
        return {
          statusCode: 404,
          success: false,
          message: "Role not found",
          __typename: "BaseResponse",
        };
      }

      // Resolve lazy-loaded createdBy
      const createdBy = await dbRole.createdBy;

      // Create role data for response and caching
      roleData = {
        id: dbRole.id,
        name: dbRole.name,
        description: dbRole.description || null,
        createdAt: dbRole.createdAt.toISOString(),
        deletedAt: dbRole.deletedAt ? dbRole.deletedAt.toISOString() : null,
        createdBy: createdBy
          ? {
              id: createdBy.id,
              name: createdBy.firstName + " " + createdBy.lastName,
              role: createdBy.role.name,
            }
          : null,
      };

      // Create a new session for user role
      const cachedRole: CachedRoleInputs = {
        id: roleData.id,
        name: roleData.name,
        description: roleData.description || "",
        createdAt: roleData.createdAt ? roleData.createdAt : null,
        deletedAt: roleData.deletedAt ? roleData.deletedAt : null,
        createdBy: roleData.createdBy || null,
      };

      // Cache user role info in Redis
      await setRoleInfoByRoleIdInRedis(id, cachedRole);
    }

    return {
      statusCode: 200,
      success: true,
      message: "Role retrieved successfully",
      role: {
        id: roleData.id,
        name: roleData.name,
        description: roleData.description,
        createdAt: roleData.createdAt,
        deletedAt: roleData.deletedAt,
        createdBy: roleData.createdBy,
      },
      __typename: "RoleResponse",
    };
  } catch (error: any) {
    console.error("Error retrieving role:", {
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
