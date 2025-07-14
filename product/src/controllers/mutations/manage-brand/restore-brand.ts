import CONFIG from "../../../config/config";
import { Context } from "../../../context";
import {
  clearBrandsAndCountCache,
  getBrandInfoByIdFromRedis,
  setBrandInfoByIdInRedis,
} from "../../../helper/redis";
import { BaseResponseOrError, MutationRestoreBrandsArgs } from "../../../types";
import { idsSchema } from "../../../utils/data-validation";
import {
  checkUserAuth,
  checkUserPermission,
  getBrandsByIds,
  restoreBrand,
} from "../../services";

/**
 * Handles the restoration of soft-deleted brands.
 *
 * Workflow:
 * 1. Verifies user authentication and permission to restore brands.
 * 2. Validates input brand IDs using Zod schema.
 * 3. Attempts to retrieve brand data from Redis.
 * 4. Fetches missing brand data from the database if not found in Redis.
 * 5. Ensures all brands are soft-deleted before restoration.
 * 6. Restores brands in the database.
 * 7. Updates Redis cache with restored brand data and sets name existence.
 * 8. Returns success response or error if validation, permission, or restoration fails.
 *
 * @param _ - Unused GraphQL resolver parent param.
 * @param args - Mutation args containing brand IDs to restore.
 * @param context - GraphQL context with authenticated user.
 * @returns A promise resolving to BaseResponseOrError.
 */
export const restoreBrands = async (
  _: any,
  args: MutationRestoreBrandsArgs,
  { user }: Context
): Promise<BaseResponseOrError> => {
  try {
    // Check authentication
    const authError = checkUserAuth(user);
    if (authError) return authError;

    // Check restore permission
    const hasPermission = await checkUserPermission({
      action: "canUpdate",
      entity: "brand",
      user,
    });

    if (!hasPermission) {
      return {
        statusCode: 403,
        success: false,
        message: "You do not have permission to restore brand(s)",
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
    const cachedBrands = await Promise.all(ids.map(getBrandInfoByIdFromRedis));
    const foundBrands: any[] = [];
    const missingIds: string[] = [];

    cachedBrands.forEach((brand, index) => {
      if (brand) foundBrands.push(brand);
      else missingIds.push(ids[index]);
    });

    // Fetch missing brands from the database
    if (missingIds.length > 0) {
      const dbBrands = await getBrandsByIds(missingIds);
      if (dbBrands.length !== missingIds.length) {
        const dbFoundIds = new Set(dbBrands.map((r) => r.id));
        const notFoundBrands = missingIds
          .filter((id) => !dbFoundIds.has(id))
          .map((id) => id);

        const notFoundNames = notFoundBrands.map((id) => {
          const brand = dbBrands.find((r) => r.id === id);
          return brand ? brand.name : '"Unknown Brand"';
        });

        return {
          statusCode: 404,
          success: false,
          message: `Brands with names: ${notFoundNames.join(", ")} not found`,
          __typename: "BaseResponse",
        };
      }
      foundBrands.push(...dbBrands);
    }

    // Check all brands are soft-deleted
    const notDeleted = foundBrands.filter((brand) => !brand.deletedAt);
    if (notDeleted.length > 0) {
      return {
        statusCode: 400,
        success: false,
        message: `Brands with IDs ${notDeleted
          .map((r) => r.id)
          .join(", ")} are not in the trash`,
        __typename: "BaseResponse",
      };
    }

    // Restore brands
    const restored = await restoreBrand(ids);

    // Update Redis
    await Promise.all([
      restored.map((brand) =>
        setBrandInfoByIdInRedis(brand.id, {
          ...brand,
          thumbnail: brand.thumbnail as any,
          createdBy: brand.createdBy as any,
          totalProducts: brand.products.length,
          createdAt:
            brand.createdAt instanceof Date
              ? brand.createdAt.toISOString()
              : brand.createdAt,
          deletedAt:
            brand.deletedAt instanceof Date
              ? brand.deletedAt.toISOString()
              : brand.deletedAt,
        })
      ),
      clearBrandsAndCountCache(),
    ]);

    return {
      statusCode: 200,
      success: true,
      message: `Brand(s) restored successfully`,
      __typename: "BaseResponse",
    };
  } catch (error: any) {
    console.error("Error restoring brand:", error);
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
