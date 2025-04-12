import { Repository } from "typeorm";
import { Context } from "../../../../context";
import { Permission } from "../../../../entities/permission.entity";
import { Role } from "../../../../entities/user-role.entity";
import { User } from "../../../../entities/user.entity";
import {
  BaseResponse,
  ErrorResponse,
  MutationCreateUserRoleArgs,
} from "../../../../types";
import { userRoleSchema } from "../../../../utils/data-validation/auth/auth";

/**
 * Creates a new user role in the system with validation and permission checks.
 * - Validates input using Zod schema.
 * - Ensures the user is authenticated and has permission to create roles.
 * - Checks for duplicate role names using Redis and database.
 * - Fetches the full User entity for createdBy to match the Role schema.
 * - Creates and saves the role, caching the result.
 * - Invalidates role list caches to keep data fresh.
 * @param _ - Unused GraphQL parent argument
 * @param args - Arguments for creating the role (name, description)
 * @param context - Application context containing AppDataSource, user, and redis
 * @returns Promise<BaseResponse | ErrorResponse> - Result of the create operation
 */
export const createUserRole = async (
  _: any,
  args: MutationCreateUserRoleArgs,
  { AppDataSource, user, redis }: Context
): Promise<BaseResponse | ErrorResponse> => {
  const { name, description } = args;
  const { getSession, setSession, deleteSession } = redis;

  try {
    // Initialize repositories for Role, Permission, and User entities
    const roleRepository: Repository<Role> = AppDataSource.getRepository(Role);
    const permissionRepository: Repository<Permission> =
      AppDataSource.getRepository(Permission);
    const userRepository: Repository<User> = AppDataSource.getRepository(User);

    // Validate input data using Zod schema
    const validationResult = await userRoleSchema.safeParseAsync({
      name,
      description,
    });

    // Check if user is authenticated
    if (!user) {
      return {
        statusCode: 401,
        success: false,
        message: "You're not authenticated",
        __typename: "BaseResponse",
      };
    }

    // Fetch the full User entity for createdBy
    const creator = await userRepository.findOne({ where: { id: user.id } });
    if (!creator) {
      return {
        statusCode: 404,
        success: false,
        message: "Authenticated user not found in database",
        __typename: "BaseResponse",
      };
    }

    // Check Redis for cached user permissions
    const permissionCacheKey = `user-permissions-${user.id}`;
    let userPermissions: Permission[] | null = null;

    userPermissions = await getSession<Permission[]>(permissionCacheKey);

    if (!userPermissions) {
      // Cache miss: Fetch permissions from database, selecting only necessary fields
      userPermissions = await permissionRepository.find({
        where: { user: { id: user.id }, name: "Role" },
        select: ["id", "canCreate", "canUpdate", "canDelete"],
      });

      // Cache permissions in Redis with configurable TTL
      const TTL = 2592000; // 30 days in seconds

      await setSession(permissionCacheKey, userPermissions, TTL);
    }

    // Check if the user has the "canCreate" permission for roles
    const canCreateRole = userPermissions.some(
      (permission) => permission.name === "Role" && permission.canCreate
    );

    if (!canCreateRole) {
      return {
        statusCode: 403,
        success: false,
        message: "You do not have permission to create roles.",
        __typename: "BaseResponse",
      };
    }

    // If validation fails, return detailed error messages
    if (!validationResult.success) {
      const errorMessages = validationResult.error.errors.map((error) => ({
        field: error.path.join("."),
        message: error.message,
      }));

      return {
        statusCode: 400,
        success: false,
        message: "Validation failed.",
        errors: errorMessages,
        __typename: "ErrorResponse",
      };
    }

    // Normalize role name for case-insensitive comparison
    const normalizedRoleKey = name.trim().toLowerCase();

    // Check Redis for role name existence
    const roleNameCacheKey = `role-name-${normalizedRoleKey}`;
    let cachedRoleExists: string | null = null;

    cachedRoleExists = await getSession<string>(roleNameCacheKey);

    if (cachedRoleExists === "exists") {
      return {
        statusCode: 400,
        success: false,
        message: "Role with this name already exists.",
        __typename: "BaseResponse",
      };
    }

    // Double-check role existence in database to avoid race conditions
    const existingRole = await roleRepository.findOne({ where: { name } });

    if (existingRole) {
      // Cache the fact that this role exists
      const TTL = 2592000; // 30 days in seconds

      await setSession(roleNameCacheKey, "exists", TTL);

      return {
        statusCode: 400,
        success: false,
        message: "Role with this name already exists.",
        __typename: "BaseResponse",
      };
    }

    // Create the new role with the full User entity as createdBy
    const role = roleRepository.create({
      name,
      description: description || null,
      createdBy: creator,
    });

    // Save the role to the database
    const savedRole = await roleRepository.save(role);

    // Cache the new role data and name existence
    const roleDataCacheKey = `user-role-${savedRole.id}`;
    const TTL = 2592000; // 30 days in seconds

    await setSession(roleDataCacheKey, savedRole, TTL);
    await setSession(roleNameCacheKey, "exists", TTL);
    // Invalidate cached role lists to ensure freshness
    await deleteSession("roles-all");

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
