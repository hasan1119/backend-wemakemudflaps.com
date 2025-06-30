import CONFIG from "../../../config/config";
import { Context } from "../../../context";
import {
  clearAllTaxStatusSearchCache,
  getTaxStatusInfoByIdFromRedis,
  setTaxStatusInfoByIdInRedis,
} from "../../../helper/redis";
import {
  BaseResponseOrError,
  MutationRestoreTaxStatusesArgs,
} from "../../../types";
import { idsSchema } from "../../../utils/data-validation";
import {
  checkUserAuth,
  checkUserPermission,
  getTaxStatusByIds,
  restoreTaxStatus,
} from "../../services";

/**
 * Handles the restoration of soft-deleted tax status.
 *
 * Workflow:
 * 1. Verifies user authentication and permission to restore tax status.
 * 2. Validates input tax status IDs using Zod schema.
 * 3. Attempts to retrieve tax status data from Redis.
 * 4. Fetches missing tax status data from the database if not found in Redis.
 * 5. Ensures all tax status are soft-deleted before restoration.
 * 6. Restores tax status in the database.
 * 7. Updates Redis cache with restored tax status data and sets value existence.
 * 8. Returns success response or error if validation, permission, or restoration fails.
 *
 * @param _ - Unused GraphQL resolver parent param.
 * @param args - Mutation args containing tax status IDs to restore.
 * @param context - GraphQL context with authenticated user.
 * @returns A promise resolving to BaseResponseOrError.
 */
export const restoreTaxStatuses = async (
  _: any,
  args: MutationRestoreTaxStatusesArgs,
  { user }: Context
): Promise<BaseResponseOrError> => {
  try {
    // Check authentication
    const authError = checkUserAuth(user);
    if (authError) return authError;

    // Check restore permission
    const hasPermission = await checkUserPermission({
      action: "canUpdate",
      entity: "tax status",
      user,
    });

    if (!hasPermission) {
      return {
        statusCode: 403,
        success: false,
        message: "You do not have permission to restore tax status(es)",
        __typename: "BaseResponse",
      };
    }

    // Validate input
    const validation = await idsSchema.safeParseAsync(args);
    if (!validation.success) {
      const errors = validation.error.errors.map((e) => ({
        field: e.path.join("."),
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

    const { ids } = validation.data;

    // Attempt Redis fetch
    const cachedTaxStatuses = await Promise.all(
      ids.map(getTaxStatusInfoByIdFromRedis)
    );

    const foundTaxStatuses: any[] = [];
    const missingIds: string[] = [];

    cachedTaxStatuses.forEach((taxStatus, index) => {
      if (taxStatus) foundTaxStatuses.push(taxStatus);
      else missingIds.push(ids[index]);
    });

    // Fetch missing tax statuses from the database
    if (missingIds.length > 0) {
      const dbTaxStatuses = await getTaxStatusByIds(missingIds);

      if (dbTaxStatuses.length !== missingIds.length) {
        const dbFoundIds = new Set(dbTaxStatuses.map((r) => r.id));
        const notFoundTaxStatuses = missingIds.filter(
          (id) => !dbFoundIds.has(id)
        );

        return {
          statusCode: 404,
          success: false,
          message: `Tax status with IDs: ${notFoundTaxStatuses.join(
            ", "
          )} not found`,
          __typename: "BaseResponse",
        };
      }

      foundTaxStatuses.push(...dbTaxStatuses);
    }

    // Check all tax status are soft-deleted
    const notDeleted = foundTaxStatuses.filter(
      (taxStatus) => !taxStatus.deletedAt
    );
    if (notDeleted.length > 0) {
      return {
        statusCode: 400,
        success: false,
        message: `Tax status with IDs ${notDeleted
          .map((r) => r.id)
          .join(", ")} are not in the trash`,
        __typename: "BaseResponse",
      };
    }

    // Restore tax status
    const restored = await restoreTaxStatus(ids);

    // Update Redis
    await Promise.all([
      ...restored.map((taxStatus) =>
        setTaxStatusInfoByIdInRedis(taxStatus.id, taxStatus)
      ),
      clearAllTaxStatusSearchCache(),
    ]);

    return {
      statusCode: 200,
      success: true,
      message: `Tax status(es) restored successfully`,
      __typename: "BaseResponse",
    };
  } catch (error: any) {
    console.error("Error restoring tax status:", error);
    return {
      statusCode: 500,
      success: false,
      message:
        CONFIG.NODE_ENV === "production"
          ? "Something went wrong, please try again."
          : error.message || "Internal server error",
      __typename: "BaseResponse",
    };
  }
};
