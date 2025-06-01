import { z } from "zod";
import CONFIG from "../../../config/config";
import { Context } from "../../../context";
import {
  getRolesCountFromRedis,
  getRolesFromRedis,
  getTotalUserCountByRoleIdFromRedis,
  setRolesCountInRedis,
  setRolesInRedis,
  setTotalUserCountByRoleIdInRedis,
} from "../../../helper/redis";
import { GetRolesResponseOrError, QueryGetAllRolesArgs } from "../../../types";
import {
  paginationSchema,
  rolesSortingSchema,
} from "../../../utils/data-validation";
import { mapPermissions } from "../../../utils/mapper";
import {
  checkUserAuth,
  checkUserPermission,
  countRolesWithSearch,
  paginateRoles,
} from "../../services";
import { userRepository } from "../../services/repositories/repositories";

// Combine pagination and sorting schemas for validation
const combinedSchema = z.intersection(paginationSchema, rolesSortingSchema);

// Map GraphQL input arguments to schema fields
const mapArgsToPagination = (args: QueryGetAllRolesArgs) => ({
  page: args.page,
  limit: args.limit,
  search: args.search,
  sortBy: args.sortBy || "createdAt",
  sortOrder: args.sortOrder || "desc",
});

/**
 * Handles fetching a paginated list of roles with optional search and sorting.
 *
 * Workflow:
 * 1. Verifies user authentication and checks read permission for roles.
 * 2. Validates input (page, limit, search, sortBy, sortOrder) using Zod schemas.
 * 3. Attempts to retrieve roles and total count from Redis for performance.
 * 4. On cache miss, fetches roles from the database with pagination, search, and sorting.
 * 5. Maps database roles to cached format, including creator details.
 * 6. Caches roles and total count in Redis, excluding user counts.
 * 7. Calculates total role count if not cached and stores it in Redis.
 * 8. Retrieves or calculates user count per role, caching results in Redis.
 * 9. Constructs response with role details, including permissions and user counts.
 * 10. Returns a success response or error if validation, permission, or retrieval fails.
 *
 * @param _ - Unused parent parameter for GraphQL resolver.
 * @param args - Input arguments containing page, limit, search, sortBy, and sortOrder.
 * @param context - GraphQL context containing AppDataSource and authenticated user information.
 * @returns A promise resolving to a GetRolesResponseOrError object containing status, message, roles, total count, and errors if applicable.
 */
export const getAllRoles = async (
  _: any,
  args: QueryGetAllRolesArgs,
  { AppDataSource, user }: Context
): Promise<GetRolesResponseOrError> => {
  try {
    // Verify user authentication
    const authResponse = checkUserAuth(user);
    if (authResponse) return authResponse;

    // Check if user has permission to view roles
    const canRead = await checkUserPermission({
      action: "canRead",
      entity: "role",
      user,
    });

    if (!canRead) {
      return {
        statusCode: 403,
        success: false,
        message: "You do not have permission to view roles info",
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

    // Attempt to retrieve cached roles and total count from Redis
    let rolesData;

    rolesData = await getRolesFromRedis(page, limit, search, sortBy, sortOrder);

    let total;

    total = await getRolesCountFromRedis(search, sortBy, sortOrder);

    if (!rolesData) {
      // On cache miss, fetch roles from database
      const { roles: dbRoles, total: queryTotal } = await paginateRoles({
        page,
        limit,
        search,
        sortBy,
        sortOrder,
      });

      total = queryTotal;

      // Map database roles to cached format
      rolesData = await Promise.all(
        dbRoles.map(async (role) => {
          const createdBy = await role.createdBy;

          return {
            id: role.id,
            name: role.name,
            description: role.description || "",
            defaultPermissions: await mapPermissions(role.defaultPermissions),
            systemDeleteProtection: role.systemDeleteProtection,
            systemUpdateProtection: role.systemUpdateProtection,
            systemPermanentDeleteProtection:
              role.systemPermanentDeleteProtection,
            systemPermanentUpdateProtection:
              role.systemPermanentUpdateProtection,
            createdBy: createdBy
              ? {
                  id: createdBy.id,
                  name: createdBy.firstName + " " + createdBy.lastName,
                  roles: createdBy.roles.map((role) => role.name),
                }
              : null,
            createdAt: role.createdAt.toISOString(),
            deletedAt: role.deletedAt ? role.deletedAt.toISOString() : null,
          };
        })
      );

      // Cache roles and total count in Redis
      await Promise.all([
        setRolesInRedis(page, limit, search, sortBy, sortOrder, rolesData),
        setRolesCountInRedis(search, sortBy, sortOrder, total),
      ]);
    }

    // Calculate total role count if not cached
    if (total === 0) {
      total = await countRolesWithSearch(search);

      // Cache total count in Redis
      await setRolesCountInRedis(search, sortBy, sortOrder, total);
    }

    // Calculate user count for each role
    const responseRoles = await Promise.all(
      rolesData.map(async (role) => {
        let assignedUserCount;

        // Attempt to retrieve user count from Redis
        assignedUserCount = await getTotalUserCountByRoleIdFromRedis(role.id);

        if (assignedUserCount === 0) {
          // On cache miss, fetch user count from database
          assignedUserCount = await userRepository.count({
            where: { roles: { id: role.id }, deletedAt: null },
          });

          // Cache user count in Redis
          await setTotalUserCountByRoleIdInRedis(role.id, assignedUserCount);
        }

        return {
          id: role.id,
          name: role.name,
          description: role.description,
          defaultPermissions: await mapPermissions(role.defaultPermissions),
          assignedUserCount,
          systemDeleteProtection: role.systemDeleteProtection,
          systemUpdateProtection: role.systemUpdateProtection,
          systemPermanentDeleteProtection: role.systemPermanentDeleteProtection,
          systemPermanentUpdateProtection: role.systemPermanentUpdateProtection,
          createdBy: role.createdBy,
          createdAt: role.createdAt,
          deletedAt: role.deletedAt,
        };
      })
    );

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
      message: `${
        CONFIG.NODE_ENV === "production"
          ? "Something went wrong, please try again."
          : error.message || "Internal server error"
      }`,
      __typename: "BaseResponse",
    };
  }
};
