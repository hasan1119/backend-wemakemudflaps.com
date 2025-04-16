import { Repository } from "typeorm";
import { Context } from "../../../context";
import { Permission } from "../../../entities/permission.entity";
import { Role } from "../../../entities/user-role.entity";
import { User } from "../../../entities/user.entity";
import {
  getSingleUserCacheKey,
  getSingleUserPermissionCacheKey,
  getSingleUserRoleCacheKey,
} from "../../../helper/redis/session-keys";
import {
  BaseResponse,
  ErrorResponse,
  QueryGetRoleArgs,
  RoleResponse,
} from "../../../types";
import { idSchema } from "../../../utils/data-validation/auth/auth";

/**
 * Retrieves a single user role by ID with validation and permission checks.
 * - Validates input using Zod schema.
 * - Ensures the user is authenticated and has permission to view roles.
 * - Checks Redis cache for role data before querying the database.
 * - Returns the role data with combined firstName and lastName for createdBy, including the creator's role name.
 * @param _ - Unused GraphQL parent argument
 * @param args - Arguments for retrieving the role (id)
 * @param context - Application context containing AppDataSource, user, and redis
 * @returns Promise<RoleResponse | BaseResponse | ErrorResponse> - Result of the get operation
 */
export const getRole = async (
  _: any,
  args: QueryGetRoleArgs,
  { AppDataSource, user, redis }: Context
): Promise<RoleResponse | BaseResponse | ErrorResponse> => {
  const { id } = args;
  const { getSession, setSession } = redis;

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

    // Initialize repositories for Role and Permission entities
    const roleRepository: Repository<Role> = AppDataSource.getRepository(Role);
    const permissionRepository: Repository<Permission> =
      AppDataSource.getRepository(Permission);
    const userRepository: Repository<User> = AppDataSource.getRepository(User);

    // Check Redis for cached user's email
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

    // Check if the user has the "canRead" permission for roles
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

    // Check Redis for cached role data
    let role;

    role = await getSession(getSingleUserRoleCacheKey(id));

    if (!role) {
      // Cache miss: Fetch role from database with creator relation and creator's role
      role = await roleRepository.findOne({
        where: { id },
        relations: ["createdBy", "createdBy.role"],
        select: {
          id: true,
          name: true,
          description: true,
          createdAt: true,
          createdBy: {
            id: true,
            firstName: true,
            lastName: true,
            email: true,
            role: {
              name: true,
            },
          },
        },
      });

      if (!role) {
        return {
          statusCode: 404,
          success: false,
          message: "Role not found",
          __typename: "BaseResponse",
        };
      }
    }

    // Transform role for response to match RoleResponse expectations
    const responseRole = {
      id: role.id,
      name: role.name,
      description: role.description,
      createdAt: role.createdAt.toISOString(),
      createdBy: {
        id: role.createdBy.id,
        name: `${
          role.createdBy.firstName + " " + role.createdBy.lastName
        }`.trim(),
        email: role.createdBy.email,
        role: role.createdBy.role?.name,
      },
    };

    await setSession(getSingleUserRoleCacheKey(id), responseRole); // TTL: default 30 days per redis session env

    // Return the role data
    return {
      statusCode: 200,
      success: true,
      message: "Role retrieved successfully",
      role: responseRole,
      __typename: "RoleResponse",
    };
  } catch (error: any) {
    console.error("Error retrieving role:", error);
    return {
      statusCode: 500,
      success: false,
      message: error.message || "Internal server error",
      __typename: "BaseResponse",
    };
  }
};
