import { Not, Repository } from "typeorm";
import { Context } from "../../../../context";
import { Permission } from "../../../../entities/permission.entity";
import { Role } from "../../../../entities/user-role.entity";
import { User } from "../../../../entities/user.entity";
import {
  BaseResponse,
  ErrorResponse,
  MutationUpdateUserRoleInfoArgs,
} from "../../../../types";
import { userRoleSchema } from "../../../../utils/data-validation/auth/auth";

/**
 * Updates an existing user role with validation and permission checks.
 * - Validates input using Zod schema.
 * - Ensures the user is authenticated and has permission to update roles.
 * - Checks for duplicate role names, excluding the current role.
 * - Fetches the full User entity for createdBy to match the Role schema.
 * - Updates the role and caches, invalidating old caches as needed.
 * - Invalidates role list caches to keep data fresh.
 * @param _ - Unused GraphQL parent argument
 * @param args - Arguments for updating the role (id, name, description)
 * @param context - Application context containing AppDataSource, user, and redis
 * @returns Promise<BaseResponse | ErrorResponse> - Result of the update operation
 */
export const updateUserRoleInfo = async (
  _: any,
  args: MutationUpdateUserRoleInfoArgs,
  { AppDataSource, user, redis }: Context
): Promise<BaseResponse | ErrorResponse> => {
  const { id, name, description } = args;
  const { getSession, setSession, deleteSession } = redis;

  try {
    // Initialize repositories for Role, Permission, and User entities
    const roleRepository: Repository<Role> = AppDataSource.getRepository(Role);
    const permissionRepository: Repository<Permission> =
      AppDataSource.getRepository(Permission);
    const userRepository: Repository<User> = AppDataSource.getRepository(User);

    // Validate input data using Zod schema
    const validationResult = await userRoleSchema.safeParseAsync({
      id,
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

    // Check if the user has the "canUpdate" permission for roles
    const canUpdateRole = userPermissions.some(
      (permission) => permission.name === "Role" && permission.canUpdate
    );

    if (!canUpdateRole) {
      return {
        statusCode: 403,
        success: false,
        message: "You do not have permission to update role's info.",
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

    // Check Redis for role existence
    const roleCacheKey = `user-role-${id}`;
    let existingRole: Role | null = null;

    existingRole = await getSession<Role>(roleCacheKey);

    if (!existingRole) {
      // Cache miss: Fetch role from database
      existingRole = await roleRepository.findOne({
        where: { id },
      });

      if (!existingRole) {
        return {
          statusCode: 404,
          success: false,
          message: "Role not found.",
          __typename: "ErrorResponse",
        };
      }

      // Cache role data
      const TTL = 2592000; // 30 days in seconds

      await setSession(roleCacheKey, existingRole, TTL);
    }

    // Check for duplicate role name, excluding the current role
    const normalizedRoleKey = name.trim().toLowerCase();
    const roleNameCacheKey = `role-name-${normalizedRoleKey}`;
    let duplicateRole: Role | null = null;
    let cachedRoleNameExists: string | null = null;

    cachedRoleNameExists = await getSession<string>(roleNameCacheKey);

    if (
      cachedRoleNameExists === "exists" &&
      existingRole.name.toLowerCase() !== normalizedRoleKey
    ) {
      // Cache hit and name differs: Check database for duplicate
      duplicateRole = await roleRepository.findOne({
        where: { name, id: Not(id) },
      });
    } else if (!cachedRoleNameExists) {
      // Cache miss: Check database for duplicate
      duplicateRole = await roleRepository.findOne({
        where: { name, id: Not(id) },
      });

      if (duplicateRole) {
        // Cache duplicate name
        const TTL = 2592000; // 30 days in seconds

        await setSession(roleNameCacheKey, "exists", TTL);
      }
    }

    if (duplicateRole) {
      return {
        statusCode: 400,
        success: false,
        message: "Role with this name already exists.",
        __typename: "ErrorResponse",
      };
    }

    // Invalidate old role name cache if name changed
    const oldNormalizedRoleKey = existingRole.name.trim().toLowerCase();
    if (oldNormalizedRoleKey !== normalizedRoleKey) {
      const oldRoleNameCacheKey = `role-name-${oldNormalizedRoleKey}`;

      await deleteSession(oldRoleNameCacheKey);
    }

    // Update the role with the full User entity as createdBy
    existingRole.name = name;
    existingRole.description = description || null;
    existingRole.createdBy = creator; // Track who modified the role

    // Save the updated role to the database
    const updatedRole = await roleRepository.save(existingRole);

    // Update Redis caches
    const TTL = 2592000; // 30 days in seconds

    await setSession(roleCacheKey, updatedRole, TTL);
    await setSession(roleNameCacheKey, "exists", TTL);
    // Invalidate cached role lists
    await deleteSession("roles-all");

    return {
      statusCode: 200,
      success: true,
      message: "Role updated successfully",
      __typename: "BaseResponse",
    };
  } catch (error: any) {
    console.error("Error updating role:", error);
    return {
      statusCode: 500,
      success: false,
      message: error.message || "Internal server error",
      __typename: "ErrorResponse",
    };
  }
};
