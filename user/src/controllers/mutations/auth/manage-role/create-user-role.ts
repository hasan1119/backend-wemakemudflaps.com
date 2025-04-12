import { Repository } from "typeorm";
import { Context } from "../../../../context";
import { Permission } from "../../../../entities/permission.entity";
import { Role } from "../../../../entities/user-role.entity";
import {
  BaseResponse,
  ErrorResponse,
  MutationCreateUserRoleArgs,
} from "../../../../types";
import { userRoleSchema } from "../../../../utils/data-validation/auth/auth";

/**
 * Creates a new user role in the system after validating its name and ensuring no duplicate role name exists
 * @param _ - Unused GraphQL parent argument
 * @param args - Arguments for creating the role (role name and description)
 * @param context - Application context containing AppDataSource, user, and redis
 * @returns Promise<BaseResponse | ErrorResponse> - Result of the create operation
 */
export const createUserRole = async (
  _: any,
  args: MutationCreateUserRoleArgs,
  { AppDataSource, user, redis }: Context
): Promise<BaseResponse | ErrorResponse> => {
  const { getSession, setSession } = redis;
  const { name, description } = args;

  try {
    const roleRepository: Repository<Role> = AppDataSource.getRepository(Role);
    const permissionRepository: Repository<Permission> =
      AppDataSource.getRepository(Permission);

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

    // 🔴 Check Redis for cached user permissions
    const permissionCacheKey = `user-permissions-${user.id}-role`;
    let userPermissions: Permission[] | null = await getSession<Permission[]>(
      permissionCacheKey
    );

    if (!userPermissions) {
      // Cache miss: Fetch permissions from database
      userPermissions = await permissionRepository.find({
        where: { user: { id: user.id }, name: "Role" }, // TypeORM enum workaround
      });

      // Cache permissions in Redis (TTL: 30 days)
      await setSession(permissionCacheKey, userPermissions, 60 * 60 * 24 * 30);
    }

    // Check if the user has the "canCreate" permission for roles
    const canCreateRole = userPermissions.some(
      (permission) => permission.canCreate
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

    const normalizedRoleKey = name.trim().toLowerCase();
    // 🔴 Check Redis for role existence
    const roleCacheKey = `role-name-${normalizedRoleKey}`;
    const cachedRoleExists = await getSession<string>(roleCacheKey);

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
      // Cache the fact that this role exists (TTL: 30 days)
      await setSession(roleCacheKey, "exists", 60 * 60 * 24 * 30);
      return {
        statusCode: 400,
        success: false,
        message: "Role with this name already exists.",
        __typename: "BaseResponse",
      };
    }

    // Create the new role
    const role = roleRepository.create({
      name,
      description: description || null,
    });

    // Save the role to the database
    const savedRole = await roleRepository.save(role);

    // 🔴 Cache the new role data
    const roleDataCacheKey = `user-role-${savedRole.id}`;
    await setSession(roleDataCacheKey, savedRole, 60 * 60 * 24 * 30); // 30 days

    // 🔴 Cache the role name to prevent future duplicates
    await setSession(roleCacheKey, "exists", 60 * 60 * 24 * 30); // 30 days

    return {
      statusCode: 200,
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
