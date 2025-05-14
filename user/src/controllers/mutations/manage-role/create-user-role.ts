import { Repository } from "typeorm";
import { Context } from "../../../context";
import { Permission } from "../../../entities/permission.entity";
import { Role } from "../../../entities/user-role.entity";
import { User } from "../../../entities/user.entity";
import {
  getRoleNameExistFromRedis,
  getUserInfoByUserIdFromRedis,
  getUserPermissionsByUserIdFromRedis,
  setRoleInfoByRoleIdInRedis,
  setRoleNameExistInRedis,
  setUserInfoByUserIdInRedis,
  setUserPermissionsByUserIdInRedis,
} from "../../../helper/redis";
import {
  BaseResponseOrError,
  CachedRoleInputs,
  CachedUserPermissionsInputs,
  MutationCreateUserRoleArgs,
  UserSession,
} from "../../../types";
import { userRoleSchema } from "../../../utils/data-validation";

/**
 * Creates a new user role in the system.
 *
 * Steps:
 * - Validates input using Zod schema
 * - Authenticates user and checks role creation permission
 * - Checks Redis for role data to optimize performance via caching
 * - Prevents duplicate role creation using Redis and DB checks
 * - Saves role to the database with audit information
 * - Caches created role and updates role name existence in Redis for future request
 *
 * @param _ - Unused GraphQL parent argument
 * @param args - Arguments for role creation input (name, description)
 * @param context - GraphQL context with AppDataSource, Redis, and user info
 * @returns Promise<BaseResponseOrError> - Response status and message
 */
export const createUserRole = async (
  _: any,
  args: MutationCreateUserRoleArgs,
  { AppDataSource, user }: Context
): Promise<BaseResponseOrError> => {
  const { name, description } = args;

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
        ...dbUser,
        role: dbUser.role.name,
      };

      const userSession: UserSession = {
        id: userData.id,
        email: userData.email,
        firstName: userData.firstName,
        lastName: userData.lastName,
        role: userData.role.name,
        gender: userData.gender,
        emailVerified: userData.emailVerified,
        isAccountActivated: userData.isAccountActivated,
      };

      // Cache user in Redis
      await setUserInfoByUserIdInRedis(user.id, userSession);
    }

    // Check Redis for cached user permissions
    let userPermissions;

    userPermissions = await getUserPermissionsByUserIdFromRedis(user.id);

    if (!userPermissions) {
      // Cache miss: Fetch permissions from database, selecting only necessary fields
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

    // Check if the user has the "canCreate" permission for roles
    const canCreateRole = userPermissions.some(
      (permission) => permission.name === "Role" && permission.canCreate
    );

    if (!canCreateRole) {
      return {
        statusCode: 403,
        success: false,
        message: "You do not have permission to create roles",
        __typename: "BaseResponse",
      };
    }

    // Validate input data using Zod schema
    const validationResult = await userRoleSchema.safeParseAsync({
      name,
      description,
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

    // Check Redis for cached role
    let cachedRoleExists;

    cachedRoleExists = await getRoleNameExistFromRedis(name);

    if (cachedRoleExists) {
      return {
        statusCode: 400,
        success: false,
        message: "Role with this name already exists",
        __typename: "BaseResponse",
      };
    }

    // Double-check role existence in database to avoid race conditions
    const existingRole = await roleRepository.findOne({ where: { name } });

    if (existingRole) {
      // Cache the fact that this role exists in Redis
      await setRoleNameExistInRedis(name);

      return {
        statusCode: 400,
        success: false,
        message: "Role with this name already exists",
        __typename: "BaseResponse",
      };
    }

    // Create the new role with the full User entity as createdBy
    const role = roleRepository.create({
      name,
      description: description || null,
      createdBy: userData,
    });

    // Save the role to the database
    const savedRole = await roleRepository.save(role);

    // Initiate the empty variable for the user role
    let roleName;

    if (typeof userData.role !== "string") {
      roleName = userData.role.name; // Safe update
    } else {
      roleName = userData.role; // Direct assignment
    }

    // Create a new session for user role
    const roleSession: CachedRoleInputs = {
      id: savedRole.id,
      name: savedRole.name,
      description: savedRole.description,
      createdBy: {
        id: userData.id,
        name: userData.firstName + " " + userData.lastName,
        role: roleName,
      },
      createdAt: savedRole.createdAt.toISOString(),
      deletedAt: savedRole.deletedAt ? savedRole.deletedAt.toISOString() : null,
    };

    // Cache newly user role & name existence in Redis
    await Promise.all([
      await setRoleInfoByRoleIdInRedis(savedRole.id, roleSession),
      await setRoleNameExistInRedis(savedRole.name),
    ]);

    return {
      statusCode: 201,
      success: true,
      message: "Role created successfully",
      __typename: "BaseResponse",
    };
  } catch (error: any) {
    console.error("Error creating role:", error);

    return {
      statusCode: 500,
      success: false,
      message: error.message || "Internal server error",
      __typename: "BaseResponse",
    };
  }
};
