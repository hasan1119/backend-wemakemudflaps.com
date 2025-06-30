import { ILike } from "typeorm";
import { z } from "zod";
import CONFIG from "../../../config/config";
import { Context } from "../../../context";
import {
  getUsersCountFromRedis,
  getUsersFromRedis,
  setUsersCountInRedis,
  setUsersInRedis,
} from "../../../helper/redis";
import {
  GetUsersResponseOrError,
  PermissionName,
  QueryGetAllUsersArgs,
} from "../../../types";
import {
  paginationSchema,
  usersSortingSchema,
} from "../../../utils/data-validation";
import {
  checkUserAuth,
  checkUserPermission,
  getPaginatedUsers,
} from "../../services";
import { userRepository } from "../../services/repositories/repositories";

// Combine pagination and sorting schemas for validation
const combinedSchema = z.intersection(paginationSchema, usersSortingSchema);

// Map GraphQL input arguments to schema fields
const mapArgsToPagination = (args: QueryGetAllUsersArgs) => ({
  page: args.page,
  limit: args.limit,
  search: args.search,
  sortBy: args.sortBy || "createdAt",
  sortOrder: args.sortOrder || "desc",
});

/**
 * Handles fetching a paginated list of users with optional search and sorting.
 *
 * Workflow:
 * 1. Verifies user authentication and checks read permission for users.
 * 2. Validates input (page, limit, search, sortBy, sortOrder) using Zod schemas.
 * 3. Attempts to retrieve users and total count from Redis for performance.
 * 4. On cache miss, fetches users from the database with pagination, search, and sorting.
 * 5. Maps database users to cached format, including roles and permissions.
 * 6. Caches users and total count in Redis.
 * 7. Calculates total user count if not cached, using search conditions, and stores it in Redis.
 * 8. Maps cached users to response format with role and permission details.
 * 9. Returns a success response with user list and total count or an error if validation, permission, or retrieval fails.
 *
 * @param _ - Unused parent parameter for GraphQL resolver.
 * @param args - Input arguments containing page, limit, search, sortBy, and sortOrder.
 * @param context - GraphQL context containing authenticated user information.
 * @returns A promise resolving to a GetUsersResponseOrError object containing status, message, users, total count, and errors if applicable.
 */
export const getAllUsers = async (
  _: any,
  args: QueryGetAllUsersArgs,
  { user }: Context
): Promise<GetUsersResponseOrError> => {
  try {
    // Verify user authentication
    const authResponse = checkUserAuth(user);
    if (authResponse) return authResponse;

    // Check if user has permission to view users
    const canRead = await checkUserPermission({
      action: "canRead",
      entity: "user",
      user,
    });

    if (!canRead) {
      return {
        statusCode: 403,
        success: false,
        message: "You do not have permission to view users",
        __typename: "BaseResponse",
      };
    }

    // Map and validate input arguments
    const mappedArgs = mapArgsToPagination(args);
    const validationResult = await combinedSchema.safeParseAsync(mappedArgs);

    // Return detailed validation errors if input is invalid
    if (!validationResult.success) {
      const errorMessages = validationResult.error.errors.map((error) => ({
        field: error.path.join("."), // Join path array to string for field identification
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

    const { page, limit, search, sortBy, sortOrder } = mappedArgs;

    // Attempt to retrieve cached users and total count from Redis
    // Use 'any' type for usersData to allow mapped objects with a reduced set of fields
    let usersData: any = await getUsersFromRedis(
      page,
      limit,
      search,
      sortBy,
      sortOrder
    );

    let total;

    total = await getUsersCountFromRedis(search, sortBy, sortOrder);

    if (!usersData) {
      // On cache miss, fetch users from database
      const { users, queryTotal } = await getPaginatedUsers({
        page,
        limit,
        search,
        sortBy,
        sortOrder: sortOrder as "asc" | "desc",
      });

      total = queryTotal;

      // Map database users to cached format
      usersData = users.map((user) => ({
        id: user.id,
        firstName: user.firstName,
        lastName: user.lastName,
        email: user.email,
        emailVerified: user.emailVerified,
        gender: user.gender,
        avatar: user.avatar,
        roles: user.roles.map((role) => role.name.toUpperCase()),
        isAccountActivated: user.isAccountActivated,
        permissions: user.permissions.map((permission) => ({
          id: permission.id,
          name: permission.name as PermissionName,
          description: permission.description,
          canCreate: permission.canCreate,
          canRead: permission.canRead,
          canUpdate: permission.canUpdate,
          canDelete: permission.canDelete,
        })),
        canUpdatePermissions: user.canUpdatePermissions,
        canUpdateRole: user.canUpdateRole,
        createdAt: user.createdAt.toISOString(),
        deletedAt: user.deletedAt ? user.deletedAt.toISOString() : null,
      }));

      // Cache users and total count in Redis
      await Promise.all([
        setUsersInRedis(page, limit, search, sortBy, sortOrder, usersData),
        setUsersCountInRedis(search, sortBy, sortOrder, total),
      ]);
    }

    // Calculate total user count if not cached
    if (total === 0) {
      const where: any[] = [{ deletedAt: null }];
      if (search) {
        const searchTerm = `%${search.trim()}%`;
        where.push(
          { firstName: ILike(searchTerm), deletedAt: null },
          { lastName: ILike(searchTerm), deletedAt: null },
          { email: ILike(searchTerm), deletedAt: null },
          { roles: { name: ILike(searchTerm) }, deletedAt: null }
        );
      }

      // Fetch total count from database
      total = await userRepository.count({ where });

      // Cache total count in Redis
      await setUsersCountInRedis(search, sortBy, sortOrder, total);
    }

    // Map cached users to response format
    const responseUsers = usersData.map((user) => ({
      id: user.id,
      avatar: user.avatar,
      firstName: user.firstName,
      lastName: user.lastName,
      email: user.email,
      emailVerified: user.emailVerified,
      gender: user.gender,
      roles: user.roles.map((role) => role.toUpperCase()),
      isAccountActivated: user.isAccountActivated,
      permissions: user.permissions.map((permission) => ({
        id: permission.id,
        name: permission.name,
        description: permission.description,
        canCreate: permission.canCreate,
        canRead: permission.canRead,
        canUpdate: permission.canUpdate,
        canDelete: permission.canDelete,
      })),
      canUpdatePermissions: user.canUpdatePermissions,
      canUpdateRole: user.canUpdateRole,
      createdAt: user.createdAt,
      deletedAt: user.deletedAt,
    }));

    return {
      statusCode: 200,
      success: true,
      message: "User(s) fetched successfully",
      users: responseUsers,
      total,
      __typename: "UsersResponse",
    };
  } catch (error: any) {
    console.error("Error fetching users:", {
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
