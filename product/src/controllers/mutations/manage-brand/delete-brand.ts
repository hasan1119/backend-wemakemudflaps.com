import CONFIG from "../../../config/config";
import { Context } from "../../../context";
import {
  clearBrandsAndCountCache,
  getBrandInfoByIdFromRedis,
  removeBrandInfoByIdFromRedis,
  removeBrandNameExistFromRedis,
  removeBrandSlugExistFromRedis,
  setBrandInfoByIdInRedis,
} from "../../../helper/redis";
import { BaseResponseOrError, MutationDeleteBrandArgs } from "../../../types";
import { idsSchema, skipTrashSchema } from "../../../utils/data-validation";
import {
  checkUserAuth,
  checkUserPermission,
  getBrandsByIds,
  hardDeleteBrand,
  softDeleteBrand,
} from "../../services";

// Clear brand-related cache entries in Redis
const clearBrandCache = async (id: string, name: string, slug: string) => {
  await Promise.all([
    removeBrandInfoByIdFromRedis(id),
    removeBrandNameExistFromRedis(name),
    removeBrandSlugExistFromRedis(slug),
    clearBrandsAndCountCache(),
  ]);
};

// Perform soft delete and update cache
const softDeleteAndCache = async (id: string) => {
  const deletedData = await softDeleteBrand(id);
  setBrandInfoByIdInRedis(id, deletedData);
  await clearBrandsAndCountCache();
};

/**
 * Handles the deletion of brands with validation and permission checks.
 *
 * Workflow:
 * 1. Verifies user authentication and permission to delete brands.
 * 2. Validates input (ids, skipTrash) using Zod schemas.
 * 3. Retrieves brand data from Redis or database for each brand ID.
 * 4. Ensures brands are not used in any products.
 * 5. Performs soft or hard deletion based on skipTrash parameter.
 * 6. Clears related cache entries in Redis.
 * 7. Returns a success response with deleted brand names or error if validation, permission, or deletion fails.
 *
 * @param _ - Unused parent parameter for GraphQL resolver.
 * @param args - Input arguments containing brand IDs and skipTrash flag.
 * @param context - GraphQL context containing authenticated user information.
 * @returns A promise resolving to a BaseResponseOrError object containing status, message, and errors if applicable.
 */
export const deleteBrand = async (
  _: any,
  args: MutationDeleteBrandArgs,
  { user }: Context
): Promise<BaseResponseOrError> => {
  try {
    // Verify user authentication
    const authResponse = checkUserAuth(user);
    if (authResponse) return authResponse;

    // Check if user has permission to delete brands
    const canDelete = await checkUserPermission({
      action: "canDelete",
      entity: "brand",
      user,
    });

    if (!canDelete) {
      return {
        statusCode: 403,
        success: false,
        message: "You do not have permission to delete brand(s)",
        __typename: "BaseResponse",
      };
    }

    const { ids, skipTrash } = args;

    // Validate input data with Zod schemas
    const [idsResult, skipTrashResult] = await Promise.all([
      idsSchema.safeParseAsync({ ids }),
      skipTrashSchema.safeParseAsync({ skipTrash }),
    ]);

    if (!idsResult.success || !skipTrashResult.success) {
      const errors = [
        ...(idsResult.error?.errors || []),
        ...(skipTrashResult.error?.errors || []),
      ].map((e) => ({
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

    // Attempt to retrieve brand data from Redis
    const cachedBrands = await Promise.all(ids.map(getBrandInfoByIdFromRedis));

    const foundBrands: any[] = [];
    const missingIds: string[] = [];

    cachedBrands.forEach((brand, index) => {
      if (brand) {
        foundBrands.push(brand);
      } else {
        missingIds.push(ids[index]);
      }
    });

    // Fetch missing brands from the database
    if (missingIds.length > 0) {
      const dbBrands = await getBrandsByIds(missingIds);

      if (dbBrands.length !== missingIds.length) {
        const dbFoundIds = new Set(dbBrands.map((t) => t.id));
        const notFoundBrands = missingIds
          .filter((id) => !dbFoundIds.has(id))
          .map((id) => id);

        return {
          statusCode: 404,
          success: false,
          message: `Brands not found with IDs: ${notFoundBrands.join(", ")}`,
          __typename: "BaseResponse",
        };
      }

      foundBrands.push(...dbBrands);
    }

    const deletedBrands: string[] = [];

    for (const brandData of foundBrands) {
      const { id, name, slug, deletedAt } = brandData;

      // Perform soft or hard deletion based on skipTrash
      if (skipTrash) {
        await hardDeleteBrand(id);
        await clearBrandCache(id, name, slug);
      } else {
        if (deletedAt) {
          return {
            statusCode: 400,
            success: false,
            message: `Brand: ${name} already in the trash`,
            __typename: "BaseResponse",
          };
        }
        await softDeleteAndCache(id);
      }

      deletedBrands.push(name);
    }

    return {
      statusCode: 200,
      success: true,
      message: deletedBrands.length
        ? `${
            skipTrash
              ? "Brand(s) permanently deleted"
              : "Brand(s) moved to trash"
          } successfully: ${deletedBrands.join(", ")}`
        : "No brands deleted",
      __typename: "BaseResponse",
    };
  } catch (error: any) {
    console.error("Error deleting brand:", error);

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
