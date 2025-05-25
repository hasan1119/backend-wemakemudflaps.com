import { Repository } from "typeorm";
import CONFIG from "../../../config/config";
import { Context } from "../../../context";
import { Permission } from "../../../entities/permission.entity";
import { User } from "../../../entities/user.entity";
import {
  getUserInfoByUserIdFromRedis,
  getUserPermissionsByUserIdFromRedis,
  setUserInfoByUserIdInRedis,
  setUserPermissionsByUserIdInRedis,
} from "../../../helper/redis";
import { GetPermissionsResponseOrError, UserSession } from "../../../types";
import { checkUserAuth } from "../../session-check/session-check";

/**
 * Fetches the permissions of the authenticated user.
 * - Authenticates user and checks read permission for Permission.
 * - Checks Redis cache for permissions data before querying the database.
 * - Fetches permissions for the authenticated user.
 * - Caches permissions in Redis for common queries.
 * - Returns a PermissionsResponse with permissions or an error response.
 *
 * @param _ - Unused GraphQL parent argument
 * @param __ - Unused GraphQL args (no arguments needed)
 * @param context - GraphQL context with AppDataSource and user info
 * @returns Promise<GetPermissionsResponseOrError> - List of permissions or error response
 */
export const getOwnPermissions = async (
  _: any,
  __: any,
  { AppDataSource, user }: Context
): Promise<GetPermissionsResponseOrError> => {
  try {
    // Check user authentication
    const authResponse = checkUserAuth(user);
    if (authResponse) return authResponse;

    // Initialize repositories
    const userRepository: Repository<User> = AppDataSource.getRepository(User);
    const permissionRepository: Repository<Permission> =
      AppDataSource.getRepository(Permission);

    // Check Redis for cached user data
    let userData = await getUserInfoByUserIdFromRedis(user.id);

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
        firstName: dbUser.firstName,
        lastName: dbUser.lastName,
        role: dbUser.role.name,
        gender: dbUser.gender,
        emailVerified: dbUser.emailVerified,
        isAccountActivated: dbUser.isAccountActivated,
      };

      userData = userSession;

      // Cache user in Redis
      await setUserInfoByUserIdInRedis(user.id, userSession);
    }

    // Check Redis for cached user permissions
    let permissionsData = await getUserPermissionsByUserIdFromRedis(user.id);

    if (!permissionsData) {
      // Cache miss: Fetch permissions from database
      const permissions = await permissionRepository.find({
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
      await setUserPermissionsByUserIdInRedis(user.id, permissionsData);
    }

    // Map permissions to response
    const responsePermissions = permissionsData.map((permission) => ({
      id: permission.id,
      name: permission.name,
      description: permission.description,
      canCreate: permission.canCreate,
      canRead: permission.canRead,
      canUpdate: permission.canUpdate,
      canDelete: permission.canDelete,
    }));

    // Return PermissionsResponse
    return {
      statusCode: 200,
      success: true,
      message: "Own permissions fetched successfully",
      permissions: responsePermissions,
      __typename: "PermissionsResponse",
    };
  } catch (error: any) {
    console.error("Error fetching own permissions:", {
      message: error.message,
    });

    return {
      statusCode: 500,
      success: false,
      message: `${
        CONFIG.NODE_ENV === "production"
          ? "Something went wrong, please try again."
          : error.message || "Internal server error"
      }`,
      __typename: "BaseResponse",
    };
  }
};
