import { ILike, Repository } from "typeorm";
import { z } from "zod";
import { Context } from "../../../context";
import { Permission } from "../../../entities/permission.entity";
import { User } from "../../../entities/user.entity";
import {
  getUserInfoByUserIdFromRedis,
  getUserPermissionsByUserIdFromRedis,
  getUsersCountFromRedis,
  getUsersFromRedis,
  setUserInfoByUserIdInRedis,
  setUserPermissionsByUserIdInRedis,
  setUsersCountInRedis,
  setUsersInRedis,
} from "../../../helper/redis";
import {
  CachedUserPermissionsInputs,
  GetUsersResponseOrError,
  QueryGetAllUsersArgs,
  UserSession,
} from "../../../types";
import {
  paginationSchema,
  usersSortingSchema,
} from "../../../utils/data-validation";
import { checkUserAuth } from "../../../utils/session-check/session-check";

// Combine pagination and sorting schemas
const combinedSchema = z.intersection(paginationSchema, usersSortingSchema);

// Map GraphQL args to combined schema fields
const mapArgsToPagination = (args: QueryGetAllUsersArgs) => ({
  page: args.page,
  limit: args.limit,
  search: args.search,
  sortBy: args.sortBy || "createdAt",
  sortOrder: args.sortOrder || "desc",
});

/**
 * Fetches a paginated list of users with optional search and sorting.
 * - Validates input using combined paginationSchema and usersSortingSchema (Zod).
 * - Restricts sortBy to id, firstName, lastName, email, emailVerified, gender, role, isAccountActivated, createdAt, deletedAt.
 * - Authenticates user and checks read permission for User.
 * - Checks Redis cache for user data before querying the database.
 * - Fetches non-deleted users with pagination, search (on firstName, lastName, email, role.name), and sorting.
 * - Caches user data in Redis for common queries.
 * - Returns a UsersResponse with user details or an error response.
 *
 * @param _ - Unused GraphQL parent argument
 * @param args - Arguments containing page, limit, search, sortBy, sortOrder
 * @param context - GraphQL context with AppDataSource and user info
 * @returns Promise<GetUsersResponseOrError> - List of users or error response
 */
export const getAllUsers = async (
  _: any,
  args: QueryGetAllUsersArgs,
  { AppDataSource, user }: Context
): Promise<GetUsersResponseOrError> => {
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
      userPermissions = cachedPermissions;
    }

    // Check if the user has "canRead" permission for User
    const canReadUser = userPermissions.some(
      (permission) => permission.name === "User" && permission.canRead
    );

    if (!canReadUser) {
      return {
        statusCode: 403,
        success: false,
        message: "You do not have permission to view users",
        __typename: "BaseResponse",
      };
    }

    // Map and validate input
    const mappedArgs = mapArgsToPagination(args);
    const validationResult = await combinedSchema.safeParseAsync(mappedArgs);

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

    const { page, limit, search, sortBy, sortOrder } = mappedArgs;

    // Check Redis for cached users and total count
    let usersData = await getUsersFromRedis(
      page,
      limit,
      search,
      sortBy,
      sortOrder
    );

    let total;

    total = await getUsersCountFromRedis(search, sortBy, sortOrder);

    if (!usersData) {
      // Cache miss: Fetch users from database
      const skip = (page - 1) * limit;
      const where: any[] = [{ deletedAt: null }];

      if (search) {
        const searchTerm = `%${search.trim()}%`;
        where.push(
          { firstName: ILike(searchTerm), deletedAt: null },
          { lastName: ILike(searchTerm), deletedAt: null },
          { email: ILike(searchTerm), deletedAt: null },
          { role: { name: ILike(searchTerm) }, deletedAt: null }
        );
      }

      const order: any = {};
      if (sortBy === "role") {
        order["role"] = { name: sortOrder.toUpperCase() };
      } else {
        order[sortBy] = sortOrder.toUpperCase();
      }

      const [users, queryTotal] = await userRepository.findAndCount({
        where,
        relations: ["role", "permissions"],
        select: {
          id: true,
          firstName: true,
          lastName: true,
          email: true,
          emailVerified: true,
          gender: true,
          role: { name: true },
          isAccountActivated: true,
          permissions: {
            id: true,
            name: true,
            description: true,
            canCreate: true,
            canRead: true,
            canUpdate: true,
            canDelete: true,
          },
          createdAt: true,
          deletedAt: true,
        },
        order,
        skip,
        take: limit,
      });

      total = queryTotal;

      // Map users to CachedUserInputs
      usersData = users.map((user) => ({
        id: user.id,
        firstName: user.firstName,
        lastName: user.lastName,
        email: user.email,
        emailVerified: user.emailVerified,
        gender: user.gender,
        role: user.role.name,
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
        createdAt: user.createdAt.toISOString(),
        deletedAt: user.deletedAt ? user.deletedAt.toISOString() : null,
      }));

      // Cache users and users count in Redis
      await Promise.all([
        setUsersInRedis(page, limit, search, sortBy, sortOrder, usersData),
        setUsersCountInRedis(search, sortBy, sortOrder, total),
      ]);
    }

    // Calculate total if not cached
    if (total === 0) {
      const where: any[] = [{ deletedAt: null }];
      if (search) {
        const searchTerm = `%${search.trim()}%`;
        where.push(
          { firstName: ILike(searchTerm), deletedAt: null },
          { lastName: ILike(searchTerm), deletedAt: null },
          { email: ILike(searchTerm), deletedAt: null },
          { role: { name: ILike(searchTerm) }, deletedAt: null }
        );
      }

      total = await userRepository.count({ where });

      // Cache users count in Redis
      await setUsersCountInRedis(search, sortBy, sortOrder, total);
    }

    // Map cached users to User response
    const responseUsers = usersData.map((user) => ({
      id: user.id,
      firstName: user.firstName,
      lastName: user.lastName,
      email: user.email,
      emailVerified: user.emailVerified,
      gender: user.gender,
      role: user.role,
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
      createdAt: user.createdAt,
      deletedAt: user.deletedAt,
    }));

    // Return UsersResponse
    return {
      statusCode: 200,
      success: true,
      message: "Users fetched successfully",
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
      message: error.message || "Internal server error",
      __typename: "BaseResponse",
    };
  }
};
