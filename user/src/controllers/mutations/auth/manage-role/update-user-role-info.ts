import { Not, Repository } from "typeorm";
import { Context } from "../../../../context";
import { Permission } from "../../../../entities/permission.entity";
import { Role } from "../../../../entities/user-role.entity";
import {
  BaseResponse,
  ErrorResponse,
  MutationUpdateUserRoleInfoArgs,
} from "../../../../types";
import { userRoleSchema } from "../../../../utils/data-validation/auth/auth";

/**
 * Update an existing user role in the system after validating its name and ensuring no duplicate role name exists.
 * @param _ - Unused GraphQL parent argument
 * @param args - Arguments for updating the role (role name and description)
 * @param context - Application context containing AppDataSource
 * @returns Promise<BaseResponse | ErrorResponse> - Result of the update operation
 */
export const updateUserRoleInfo = async (
  _: any,
  args: MutationUpdateUserRoleInfoArgs,
  { AppDataSource, user, redis }: Context
): Promise<BaseResponse | ErrorResponse> => {
  const { getSession, setSession, deleteSession } = redis;
  const { id, name, description } = args;

  try {
    const roleRepository: Repository<Role> = AppDataSource.getRepository(Role);
    const permissionRepository: Repository<Permission> =
      AppDataSource.getRepository(Permission);

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

    // 🔴 Check Redis for cached user permissions
    const permissionCacheKey = `user-permissions-${user.id}-role`;
    let userPermissions: Permission[] | null = await getSession<Permission[]>(
      permissionCacheKey
    );

    if (!userPermissions) {
      // Cache miss: Fetch permissions from database
      userPermissions = await permissionRepository.find({
        where: { user: { id: user.id }, name: "Role" },
      });

      // Cache permissions in Redis (TTL: 30 days)
      await setSession(permissionCacheKey, userPermissions, 60 * 60 * 24 * 30);
    }

    // Check if the user has the "canUpdate" permission for roles
    const canUpdateRole = userPermissions.some(
      (permission) => permission.canUpdate
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

    // 🔴 Check Redis for role existence
    const roleCacheKey = `user-role-${id}`;
    let existingRole: Role | null = await getSession<Role>(roleCacheKey);

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

      // Cache role data (TTL: 30 days)
      await setSession(roleCacheKey, existingRole, 60 * 60 * 24 * 30);
    }

    // 🔴 Check Redis for duplicate role name
    const normalizedRoleKey = name.trim().toLowerCase();
    const roleNameCacheKey = `role-name-${normalizedRoleKey}`;
    const cachedRoleNameExists = await getSession<string>(roleNameCacheKey);

    let duplicateRole: Role | null = null;
    if (
      cachedRoleNameExists === "exists" &&
      existingRole.name.toLowerCase() !== normalizedRoleKey
    ) {
      // Cache hit and name differs: Assume duplicate unless database says otherwise
      duplicateRole = await roleRepository.findOne({
        where: { name, id: Not(id) },
      });
    } else if (!cachedRoleNameExists) {
      // Cache miss: Check database for duplicate
      duplicateRole = await roleRepository.findOne({
        where: { name, id: Not(id) },
      });

      if (duplicateRole) {
        // Cache duplicate name (TTL: 30 days)
        await setSession(roleNameCacheKey, "exists", 60 * 60 * 24 * 30);
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

    // 🔴 Invalidate old role name cache if name changed
    const oldNormalizedRoleKey = existingRole.name.trim().toLowerCase();
    if (oldNormalizedRoleKey !== normalizedRoleKey) {
      const oldRoleNameCacheKey = `role-name-${oldNormalizedRoleKey}`;
      await deleteSession(oldRoleNameCacheKey); // Allow old name to be reused
    }

    // Update the role
    existingRole.name = name;
    existingRole.description = description || null;

    // Save the updated role to the database
    const updatedRole = await roleRepository.save(existingRole);

    // 🔴 Update Redis caches
    await setSession(roleCacheKey, updatedRole, 60 * 60 * 24 * 30); // Update role data
    await setSession(roleNameCacheKey, "exists", 60 * 60 * 24 * 30); // Cache new role name

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
