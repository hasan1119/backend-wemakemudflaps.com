import CONFIG from "../../../config/config";
import { Context } from "../../../context";
import {
  clearAllTaxClassCountCache,
  clearAllTaxClassSearchCache,
  getTaxClassInfoByIdFromRedis,
  setTaxClassInfoByIdInRedis,
} from "../../../helper/redis";
import {
  BaseResponseOrError,
  MutationRestoreTaxClassesArgs,
} from "../../../types";
import { idsSchema } from "../../../utils/data-validation";
import {
  checkUserAuth,
  checkUserPermission,
  getTaxClassByIds,
  restoreTaxClass,
} from "../../services";

/**
 * Handles the restoration of soft-deleted tax classes.
 *
 * Workflow:
 * 1. Verifies user authentication and permission to restore tax classes.
 * 2. Validates input tax class IDs using Zod schema.
 * 3. Attempts to retrieve tax class data from Redis.
 * 4. Fetches missing tax class data from the database if not found in Redis.
 * 5. Ensures all tax classes are soft-deleted before restoration.
 * 6. Restores tax classes in the database.
 * 7. Updates Redis cache with restored tax class data and sets value existence.
 * 8. Returns success response or error if validation, permission, or restoration fails.
 *
 * @param _ - Unused GraphQL resolver parent param.
 * @param args - Mutation args containing tax class IDs to restore.
 * @param context - GraphQL context with authenticated user.
 * @returns A promise resolving to BaseResponseOrError.
 */
export const restoreTaxClasses = async (
  _: any,
  args: MutationRestoreTaxClassesArgs,
  { user }: Context
): Promise<BaseResponseOrError> => {
  try {
    // Check authentication
    const authError = checkUserAuth(user);
    if (authError) return authError;

    // Check restore permission
    const hasPermission = await checkUserPermission({
      action: "canUpdate",
      entity: "tax class",
      user,
    });

    if (!hasPermission) {
      return {
        statusCode: 403,
        success: false,
        message: "You do not have permission to restore tax class(es)",
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
    const cachedTaxClasses = await Promise.all(
      ids.map(getTaxClassInfoByIdFromRedis)
    );

    const foundTaxClasses: any[] = [];
    const missingIds: string[] = [];

    cachedTaxClasses.forEach((taxClass, index) => {
      if (taxClass) foundTaxClasses.push(taxClass);
      else missingIds.push(ids[index]);
    });

    // Fetch missing tax classes from the database
    if (missingIds.length > 0) {
      const dbTaxClasses = await getTaxClassByIds(missingIds);

      if (dbTaxClasses.length !== missingIds.length) {
        const dbFoundIds = new Set(dbTaxClasses.map((r) => r.id));
        const notFoundTaxClasses = missingIds.filter(
          (id) => !dbFoundIds.has(id)
        );

        return {
          statusCode: 404,
          success: false,
          message: `Tax class with IDs: ${notFoundTaxClasses.join(
            ", "
          )} not found`,
          __typename: "BaseResponse",
        };
      }

      foundTaxClasses.push(...dbTaxClasses);
    }

    // Check all tax classes are soft-deleted
    const notDeleted = foundTaxClasses.filter(
      (taxClass) => !taxClass.deletedAt
    );
    if (notDeleted.length > 0) {
      return {
        statusCode: 400,
        success: false,
        message: `Tax class with IDs ${notDeleted
          .map((r) => r.id)
          .join(", ")} are not in the trash`,
        __typename: "BaseResponse",
      };
    }

    // Restore tax classes
    const restored = await restoreTaxClass(ids);

    // Update Redis
    await Promise.all([
      ...restored.map((taxClass) =>
        setTaxClassInfoByIdInRedis(taxClass.id, taxClass)
      ),
      clearAllTaxClassSearchCache(),
      clearAllTaxClassCountCache(),
    ]);

    return {
      statusCode: 200,
      success: true,
      message: `Tax class(es) restored successfully`,
      __typename: "BaseResponse",
    };
  } catch (error: any) {
    console.error("Error restoring tax class:", error);
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
