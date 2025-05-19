import { Like, Repository } from "typeorm";
import { z } from "zod";
import { Context } from "../../../context";
import { Permission } from "../../../entities/permission.entity";
import { Role } from "../../../entities/user-role.entity";
import { User } from "../../../entities/user.entity";
import {
  getRolesCountFromRedis,
  getRolesFromRedis,
  getTotalUserCountByRoleIdFromRedis,
  getUserInfoByUserIdFromRedis,
  getUserPermissionsByUserIdFromRedis,
  setRolesCountInRedis,
  setRolesInRedis,
  setTotalUserCountByRoleIdInRedis,
  setUserInfoByUserIdInRedis,
  setUserPermissionsByUserIdInRedis,
} from "../../../helper/redis";
import {
  CachedRoleInputs,
  CachedUserPermissionsInputs,
  GetRolesResponseOrError,
  QueryGetAllRolesArgs,
  UserSession,
} from "../../../types";
import {
  paginationSchema,
  rolesSortingSchema,
} from "../../../utils/data-validation";
import { checkUserAuth } from "../../../utils/session-check/session-check";

// Combine pagination and sorting schemas
const combinedSchema = z.intersection(paginationSchema, rolesSortingSchema);

// Map GraphQL args to combined schema fields
const mapArgsToPagination = (args: QueryGetAllRolesArgs) => ({
  page: args.page,
  limit: args.limit,
  search: args.search,
  sortBy: args.sortBy || "createdAt",
  sortOrder: args.sortOrder || "desc",
});

/**
 * Fetches a paginated list of roles with optional search and sorting.
 * - Validates input using combined paginationSchema and rolesSortingSchema (Zod).
 * - Restricts sortBy to id, name, description, createdAt, deletedAt.
 * - Authenticates user and checks read permission for Role.
 * - Checks Redis cache for role data and totalUserCount before querying the database.
 * - Fetches non-deleted roles with pagination, search (on name, description), and sorting.
 * - Calculates totalUserCount per role dynamically, caching in Redis.
 * - Caches role data in Redis for common queries (excluding totalUserCount).
 * - Returns a RolesResponse with role details or an error response.
 *
 * @param _ - Unused GraphQL parent argument
 * @param args - Arguments containing page, limit, search, sortBy, sortOrder
 * @param context - GraphQL context with AppDataSource and user info
 * @returns Promise<GetRolesResponseOrError> - List of roles or error response
 */
export const getAllRoles = async (
  _: any,
  args: QueryGetAllRolesArgs,
  { AppDataSource, user }: Context
): Promise<GetRolesResponseOrError> => {
  try {
    // Check user authentication
    const authResponse = checkUserAuth(user);
    if (authResponse) return authResponse;

    // Initialize repositories
    const roleRepository: Repository<Role> = AppDataSource.getRepository(Role);
    const permissionRepository: Repository<Permission> =
      AppDataSource.getRepository(Permission);
    const userRepository: Repository<User> = AppDataSource.getRepository(User);

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
          role: { name: true },
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

    // Check if the user has "canRead" permission for Role
    const canReadRole = userPermissions.some(
      (permission) => permission.name === "Role" && permission.canRead
    );

    if (!canReadRole) {
      return {
        statusCode: 403,
        success: false,
        message: "You do not have permission to view roles",
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

    // Check Redis for cached roles and total count
    let rolesData;

    rolesData = await getRolesFromRedis(page, limit, search, sortBy, sortOrder);

    let total;

    total = await getRolesCountFromRedis(search, sortBy, sortOrder);

    if (!rolesData) {
      // Cache miss: Fetch roles from database
      const skip = (page - 1) * limit;
      const where: any = { deletedAt: null };

      if (search) {
        const searchTerm = `%${search.toUpperCase().trim()}%`;
        const descSearchTerm = `%${search.toLowerCase().trim()}%`;
        where[Symbol.for("or")] = [
          { name: Like(searchTerm) },
          { description: Like(descSearchTerm) },
        ];
      }

      const [dbRoles, queryTotal] = await roleRepository.findAndCount({
        where,
        relations: ["createdBy", "createdBy.role"],
        select: {
          id: true,
          name: true,
          description: true,
          createdAt: true,
          deletedAt: true,
          createdBy: {
            id: true,
            firstName: true,
            lastName: true,
            role: { name: true },
          },
        },
        order: { [sortBy]: sortOrder.toUpperCase() },
        skip,
        take: limit,
      });

      total = queryTotal;

      // Map roles to CachedRoleInputs
      rolesData = await Promise.all(
        dbRoles.map(async (role) => {
          const createdBy = await role.createdBy;

          return {
            id: role.id,
            name: role.name,
            description: role.description || "",
            createdAt: role.createdAt.toISOString(),
            deletedAt: role.deletedAt ? role.deletedAt.toISOString() : null,
            createdBy: createdBy
              ? {
                  id: createdBy.id,
                  name: createdBy.firstName + " " + createdBy.lastName,
                  role: createdBy.role.name,
                }
              : null,
          };
        })
      );

      const cachedRoleInputs: CachedRoleInputs[] = rolesData;

      // Cache roles and roles count in Redis (without totalUserCount)
      await Promise.all([
        setRolesInRedis(
          page,
          limit,
          search,
          sortBy,
          sortOrder,
          cachedRoleInputs
        ),
        setRolesCountInRedis(search, sortBy, sortOrder, total),
      ]);
    }

    // Calculate total if not cached
    if (total === 0) {
      const where: any = { deletedAt: null };
      if (search) {
        const searchTerm = `%${search.toUpperCase().trim()}%`;
        const descSearchTerm = `%${search.toLowerCase().trim()}%`;
        where[Symbol.for("or")] = [
          { name: Like(searchTerm) },
          { description: Like(descSearchTerm) },
        ];
      }

      total = await roleRepository.count({ where });

      // Cache total roles count in Redis
      await setRolesCountInRedis(search, sortBy, sortOrder, total);
    }

    // Calculate totalUserCount for each role, using Redis cache when available
    const responseRoles = await Promise.all(
      rolesData.map(async (role) => {
        let totalUserCount;

        totalUserCount = await getTotalUserCountByRoleIdFromRedis(role.id);

        if (totalUserCount === 0) {
          // Cache miss: Fetch count from database
          totalUserCount = await userRepository.count({
            where: { role: { id: role.id }, deletedAt: null },
          });

          // Cache count in Redis
          await setTotalUserCountByRoleIdInRedis(role.id, totalUserCount);
        }

        return {
          id: role.id,
          name: role.name,
          description: role.description,
          totalUserCount,
          createdBy: role.createdBy,
          createdAt: role.createdAt,
          deletedAt: role.deletedAt,
        };
      })
    );

    // Return RolesResponse
    return {
      statusCode: 200,
      success: true,
      message: "Roles fetched successfully",
      roles: responseRoles,
      total,
      __typename: "RolesResponse",
    };
  } catch (error: any) {
    console.error("Error fetching roles:", {
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
