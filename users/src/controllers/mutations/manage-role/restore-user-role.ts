import CONFIG from "../../../config/config";
import { Context } from "../../../context";
import {
  getRoleInfoByRoleIdFromRedis,
  setRoleInfoByRoleIdInRedis,
  setRoleInfoByRoleNameInRedis,
} from "../../../helper/redis";
import {
  BaseResponseOrError,
  MutationRestoreUserRoleArgs,
} from "../../../types";
import { idsSchema } from "../../../utils/data-validation";
import {
  checkUserAuth,
  checkUserPermission,
  getRolesByIds,
  restoreRole,
} from "../../services";

/**
 * Handles the restoration of soft-deleted user roles from the trash.
 *
 * Workflow:
 * 1. Verifies user authentication and permission to restore roles.
 * 2. Validates input role IDs using Zod schema.
 * 3. Attempts to retrieve role data from Redis for performance optimization.
 * 4. Fetches missing role data from the database if not found in Redis.
 * 5. Ensures all specified roles are soft-deleted before restoration.
 * 6. Restores roles by clearing their deletedAt timestamp in the database.
 * 7. Updates Redis cache with restored role data.
 * 8. Returns a success response or error if validation, permission, or restoration fails.
 *
 * @param _ - Unused parent parameter for GraphQL resolver.
 * @param args - Input arguments containing the IDs of roles to restore.
 * @param context - GraphQL context containing authenticated user information.
 * @returns A promise resolving to a BaseResponseOrError object containing status, message, and errors if applicable.
 */
export const restoreUserRole = async (
  _: any,
  args: MutationRestoreUserRoleArgs,
  { user }: Context
): Promise<BaseResponseOrError> => {
  try {
    // Verify user authentication
    const authResponse = checkUserAuth(user);
    if (authResponse) return authResponse;

    // Check if user has permission to restore roles
    const canUpdate = await checkUserPermission({
      action: "canUpdate",
      entity: "role",
      user,
    });

    if (!canUpdate) {
      return {
        statusCode: 403,
        success: false,
        message: "You do not have permission to restore user role info",
        __typename: "BaseResponse",
      };
    }

    // Validate input role IDs with Zod schema
    const validationResult = await idsSchema.safeParseAsync(args);

    if (!validationResult.success) {
      const errors = validationResult.error.errors.map((e) => ({
        field: e.path.join("."), // Join path array to string for field identification
        message: e.message,
      }));

      return {
        statusCode: 400,
        success: false,
        message: "Validation failed",
        errors,
        __typename: "ErrorResponse",
      };
    }

    const { ids } = validationResult.data;

    // Attempt to retrieve role data from Redis
    const cachedRoles = await Promise.all(
      ids.map(getRoleInfoByRoleIdFromRedis)
    );

    const foundRoles: any[] = [];
    const missingIds: string[] = [];

    cachedRoles.forEach((role, index) => {
      if (role) {
        foundRoles.push(role);
      } else {
        missingIds.push(ids[index]);
      }
    });

    // Fetch missing roles from the database
    if (missingIds.length > 0) {
      const dbRoles = await getRolesByIds(missingIds);
      if (dbRoles.length !== missingIds.length) {
        const dbFoundIds = new Set(dbRoles.map((r) => r.id));
        const notFoundRoles = missingIds
          .filter((id) => !dbFoundIds.has(id))
          .map((id) => id);

        const notFoundNames = notFoundRoles.map((id) => {
          const role = dbRoles.find((r) => r.id === id);
          return role ? role.name : '"Unknown Role"';
        });

        return {
          statusCode: 404,
          success: false,
          message: `Roles with IDs ${notFoundNames.join(", ")} not found`,
          __typename: "BaseResponse",
        };
      }
      foundRoles.push(...dbRoles);
    }

    // Verify all roles are soft-deleted
    const nonDeleted = foundRoles.filter((role) => !role.deletedAt);
    if (nonDeleted.length > 0) {
      return {
        statusCode: 400,
        success: false,
        message: `Roles with IDs ${nonDeleted
          .map((r) => r.id)
          .join(", ")} are not in the trash`,
        __typename: "BaseResponse",
      };
    }

    // Restore soft-deleted roles
    const restoredRoles = await restoreRole(ids);

    // Update Redis cache with restored role data
    await Promise.all(
      restoredRoles.map((role) =>
        Promise.all([
          setRoleInfoByRoleIdInRedis(role.id, role),
          setRoleInfoByRoleNameInRedis(role.name, role),
        ])
      )
    );

    return {
      statusCode: 200,
      success: true,
      message: `Role(s) restored successfully`,
      __typename: "BaseResponse",
    };
  } catch (error: any) {
    console.error("Error restoring role:", error);

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
