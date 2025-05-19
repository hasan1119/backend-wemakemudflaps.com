import { IsNull, Repository } from "typeorm";
import { Context } from "../../../context";
import { Permission } from "../../../entities/permission.entity";
import { User } from "../../../entities/user.entity";
import {
  getUserInfoByUserIdFromRedis,
  getUserPermissionsByUserIdFromRedis,
  setUserInfoByUserIdInRedis,
  setUserPermissionsByUserIdInRedis,
} from "../../../helper/redis";
import {
  CachedUserPermissionsInputs,
  GetPermissionsResponseOrError,
  QueryGetAllPermissionsByUserIdArgs,
  UserSession,
} from "../../../types";
import { idSchema } from "../../../utils/data-validation";
import { checkUserAuth } from "../../../utils/session-check/session-check";

/**
 * Fetches all permissions for a specific user by their ID.
 * - Validates input using idSchema (Zod).
 * - Authenticates user and checks read permission for Permission.
 * - Checks Redis cache for permissions data before querying the database.
 * - Fetches permissions for the specified user.
 * - Caches permissions in Redis for common queries.
 * - Returns a PermissionsResponse with permissions or an error response.
 *
 * @param _ - Unused GraphQL parent argument
 * @param args - Arguments containing the user ID
 * @param context - GraphQL context with AppDataSource and user info
 * @returns Promise<GetPermissionsResponseOrError> - List of permissions or error response
 */
export const getAllPermissionsByUserId = async (
  _: any,
  args: QueryGetAllPermissionsByUserIdArgs,
  { AppDataSource, user }: Context
): Promise<GetPermissionsResponseOrError> => {
  const { id } = args;

  try {
    // Check user authentication
    const authResponse = checkUserAuth(user);
    if (authResponse) return authResponse;

    // Initialize repositories
    const userRepository: Repository<User> = AppDataSource.getRepository(User);
    const permissionRepository: Repository<Permission> =
      AppDataSource.getRepository(Permission);

    // Check Redis for cached user data
    let userData;

    userData = await getUserInfoByUserIdFromRedis(user.id);

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
          gender: true,
          role: { id: true, name: true },
          emailVerified: true,
          isAccountActivated: true,
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

      const userSession: UserSession = {
        id: dbUser.id,
        email: dbUser.email,
        firstName: dbUser.firstName || "",
        lastName: dbUser.lastName || "",
        role: dbUser.role.name,
        gender: dbUser.gender || "",
        emailVerified: dbUser.emailVerified || false,
        isAccountActivated: dbUser.isAccountActivated || false,
      };

      userData = userSession;

      // Cache user in Redis
      await setUserInfoByUserIdInRedis(user.id, userSession);
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
      userPermissions = cachedPermissions;
    }

    // Check if the user has "canRead" permission for Permission
    const canReadPermission = userPermissions.some(
      (permission) => permission.name === "Permission" && permission.canRead
    );

    if (!canReadPermission) {
      return {
        statusCode: 403,
        success: false,
        message: "You do not have permission to view permissions",
        __typename: "BaseResponse",
      };
    }

    // Validate input
    const validationResult = await idSchema.safeParseAsync(id);

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

    // Verify user exists
    const targetUser = await userRepository.findOne({
      where: { id, deletedAt: IsNull() },
      select: { id: true },
    });

    if (!targetUser) {
      return {
        statusCode: 404,
        success: false,
        message: "User not found or has been deleted",
        __typename: "ErrorResponse",
      };
    }

    // Check Redis for cached permissions
    let permissionsData = await getUserPermissionsByUserIdFromRedis(id);

    if (!permissionsData) {
      // Cache miss: Fetch permissions from database
      const permissions = await permissionRepository.find({
        where: { user: { id } },
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

      permissionsData = permissions.map((permission) => ({
        id: permission.id,
        name: permission.name,
        description: permission.description,
        canCreate: permission.canCreate,
        canRead: permission.canRead,
        canUpdate: permission.canUpdate,
        canDelete: permission.canDelete,
      }));

      // Cache permissions in Redis
      await setUserPermissionsByUserIdInRedis(id, permissionsData);
    }

    const responseData = permissionsData.map((permission) => ({
      id: permission.id,
      name: permission.name,
      description: permission.description || "",
      canCreate: permission.canCreate,
      canRead: permission.canRead,
      canUpdate: permission.canUpdate,
      canDelete: permission.canDelete,
    }));

    // Return PermissionsResponse
    return {
      statusCode: 200,
      success: true,
      message: "Permissions fetched successfully",
      permissions: responseData,
      __typename: "PermissionsResponse",
    };
  } catch (error: any) {
    console.error("Error fetching permissions:", {
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
