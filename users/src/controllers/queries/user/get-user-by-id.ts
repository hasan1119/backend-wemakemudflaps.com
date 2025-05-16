import { Repository } from "typeorm";
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
  QueryGetUserByIdArgs,
} from "../../../types";
import { idSchema } from "../../../utils/data-validation";
import { checkUserAuth } from "../../../utils/session-check/session-check";
import { GetUserByIdResponseOrError, UserSession } from "./../../../types";

/**
 * Retrieves a user's profile data by ID, including their role name and permissions.
 * - Validates input ID using Zod schema.
 * - Authenticates user and checks permission to read user data.
 * - Checks Redis cache for user data and permissions before querying the database.
 * - Fetches the user by ID, including role and permissions relations.
 * - Caches user and permissions data in Redis for future requests.
 * - Returns the user profile with role name and permissions or an error response.
 *
 * @param _ - Unused GraphQL parent argument
 * @param args - Arguments containing the user ID
 * @param context - GraphQL context with AppDataSource and user info
 * @returns Promise<GetUserByIDResponseOrError> - User details with role and permissions or error response
 */
export const getUserById = async (
  _: any,
  args: QueryGetUserByIdArgs,
  { AppDataSource, user }: Context
): Promise<GetUserByIdResponseOrError> => {
  const { id } = args;

  try {
    // Check user authentication
    const authResponse = checkUserAuth(user);
    if (authResponse) return authResponse;

    // Initialize repositories
    const userRepository: Repository<User> = AppDataSource.getRepository(User);
    const permissionRepository: Repository<Permission> =
      AppDataSource.getRepository(Permission);

    // Check Redis for cached authenticated user's permissions
    let userPermissions = await getUserPermissionsByUserIdFromRedis(user.id);

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
    }

    // Check if the user has "canRead" permission for User
    const canReadUser = userPermissions.some(
      (permission) => permission.name === "User" && permission.canRead
    );

    if (!canReadUser) {
      return {
        statusCode: 403,
        success: false,
        message: "You do not have permission to view user info",
        __typename: "BaseResponse",
      };
    }

    // Validate input ID
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

    // Check Redis for cached target user data
    let userData;

    userData = await getUserInfoByUserIdFromRedis(id);

    // Check Redis for cached user permissions
    let permissions;

    permissions = await getUserPermissionsByUserIdFromRedis(user.id);

    if (!userData) {
      // Cache miss: Fetch user from database
      const dbUser = await userRepository.findOne({
        where: { id },
        relations: ["role"],
        select: {
          id: true,
          firstName: true,
          lastName: true,
          email: true,
          gender: true,
          emailVerified: true,
          isAccountActivated: true,
          role: { name: true },
        },
      });

      if (!dbUser) {
        return {
          statusCode: 404,
          success: false,
          message: "User not found",
          __typename: "BaseResponse",
        };
      }

      userData = dbUser;

      const userSession: UserSession = {
        id: dbUser.id,
        firstName: dbUser.firstName || "",
        lastName: dbUser.lastName || "",
        email: dbUser.email || "",
        gender: dbUser.gender || "",
        role: dbUser.role?.name || "",
        emailVerified: dbUser.emailVerified || false,
        isAccountActivated: dbUser.isAccountActivated || false,
      };

      // Cache user in Redis
      await setUserInfoByUserIdInRedis(id, userSession);
    } else if (!permissions) {
      // Cache miss: Fetch permissions from database
      permissions = await permissionRepository.find({
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

      const cachedPermissions: CachedUserPermissionsInputs[] = permissions.map(
        (permission) => ({
          id: permission.id,
          name: permission.name,
          description: permission.description || "",
          canCreate: permission.canCreate,
          canRead: permission.canRead,
          canUpdate: permission.canUpdate,
          canDelete: permission.canDelete,
        })
      );

      permissions = cachedPermissions;

      // Cache permissions in Redis
      await setUserPermissionsByUserIdInRedis(id, cachedPermissions);
    }

    // Construct response user object matching User type
    const responseUser = {
      id: userData.id,
      firstName: userData.firstName || null,
      lastName: userData.lastName || null,
      email: userData.email || null,
      gender: userData.gender || null,
      role: userData.role || null,
      emailVerified: userData.emailVerified,
      isAccountActivated: userData.isAccountActivated,
      permissions: permissions.map((perm) => ({
        id: perm.id,
        name: perm.name,
        description: perm.description,
        canCreate: perm.canCreate,
        canRead: perm.canRead,
        canUpdate: perm.canUpdate,
        canDelete: perm.canDelete,
      })),
    };

    return {
      statusCode: 200,
      success: true,
      message: "User fetched successfully",
      user: responseUser,
      __typename: "UserResponse",
    };
  } catch (error: any) {
    console.error("Error fetching user by ID:", {
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
