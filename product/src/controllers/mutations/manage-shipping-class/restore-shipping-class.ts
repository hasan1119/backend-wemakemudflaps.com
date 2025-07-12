import CONFIG from "../../../config/config";
import { Context } from "../../../context";
import {
  clearAllShippingClassCountCache,
  clearAllShippingClassSearchCache,
  getShippingClassInfoByIdFromRedis,
  setShippingClassInfoByIdInRedis,
} from "../../../helper/redis";
import {
  BaseResponseOrError,
  MutationRestoreShippingClassesArgs,
} from "../../../types";
import { idsSchema } from "../../../utils/data-validation";
import {
  checkUserAuth,
  checkUserPermission,
  getShippingClassesByIds,
  restoreShippingClass,
} from "../../services";

/**
 * Handles the restoration of soft-deleted shipping classes.
 *
 * Workflow:
 * 1. Verifies user authentication and permission to restore shipping classes.
 * 2. Validates input shipping class IDs using Zod schema.
 * 3. Attempts to retrieve shipping class data from Redis.
 * 4. Fetches missing shipping class data from the database if not found in Redis.
 * 5. Ensures all shipping classes are soft-deleted before restoration.
 * 6. Restores shipping classes in the database.
 * 7. Updates Redis cache with restored shipping class data and sets value existence.
 * 8. Returns success response or error if validation, permission, or restoration fails.
 *
 * @param _ - Unused GraphQL resolver parent param.
 * @param args - Mutation args containing shipping class IDs to restore.
 * @param context - GraphQL context with authenticated user.
 * @returns A promise resolving to BaseResponseOrError.
 */
export const restoreShippingClasses = async (
  _: any,
  args: MutationRestoreShippingClassesArgs,
  { user }: Context
): Promise<BaseResponseOrError> => {
  try {
    // Check authentication
    const authError = checkUserAuth(user);
    if (authError) return authError;

    // Check restore permission
    const hasPermission = await checkUserPermission({
      action: "canUpdate",
      entity: "shipping class",
      user,
    });

    if (!hasPermission) {
      return {
        statusCode: 403,
        success: false,
        message: "You do not have permission to restore shipping class(es)",
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
    const cachedShippingClasses = await Promise.all(
      ids.map(getShippingClassInfoByIdFromRedis)
    );

    const foundShippingClasses: any[] = [];
    const missingIds: string[] = [];

    cachedShippingClasses.forEach((shippingClass, index) => {
      if (shippingClass) foundShippingClasses.push(shippingClass);
      else missingIds.push(ids[index]);
    });

    // Fetch missing shipping classes from the database
    if (missingIds.length > 0) {
      const dbShippingClasses = await getShippingClassesByIds(missingIds);

      if (dbShippingClasses.length !== missingIds.length) {
        const dbFoundIds = new Set(dbShippingClasses.map((r) => r.id));
        const notFoundShippingClasses = missingIds.filter(
          (id) => !dbFoundIds.has(id)
        );

        return {
          statusCode: 404,
          success: false,
          message: `Shipping class with IDs: ${notFoundShippingClasses.join(
            ", "
          )} not found`,
          __typename: "BaseResponse",
        };
      }

      foundShippingClasses.push(...dbShippingClasses);
    }

    // Check all shipping classes are soft-deleted
    const notDeleted = foundShippingClasses.filter(
      (shippingClass) => !shippingClass.deletedAt
    );
    if (notDeleted.length > 0) {
      return {
        statusCode: 400,
        success: false,
        message: `Shipping class with IDs ${notDeleted
          .map((r) => r.id)
          .join(", ")} are not in the trash`,
        __typename: "BaseResponse",
      };
    }

    // Restore shipping classes
    const restored = await restoreShippingClass(ids);

    // Update Redis
    await Promise.all([
      ...restored.map((shippingClass) =>
        setShippingClassInfoByIdInRedis(shippingClass.id, shippingClass)
      ),
      clearAllShippingClassSearchCache(),
      clearAllShippingClassCountCache(),
    ]);

    return {
      statusCode: 200,
      success: true,
      message: `Shipping class(es) restored successfully`,
      __typename: "BaseResponse",
    };
  } catch (error: any) {
    console.error("Error restoring shipping class:", error);
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
