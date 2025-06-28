import CONFIG from "../../../config/config";
import { Context } from "../../../context";
import {
  getBrandInfoByBrandIdFromRedis,
  setBrandInfoByBrandIdInRedis,
} from "../../../helper/redis";
import {
  GetBrandByIdResponseOrError,
  QueryGetBrandByIdArgs,
} from "../../../types";
import { idSchema } from "../../../utils/data-validation";
import {
  checkUserAuth,
  checkUserPermission,
  getBrandById as getBrandByIdService,
} from "../../services";

/**
 * Handles retrieving a brand by its ID with validation and permission checks.
 *
 * Workflow:
 * 1. Verifies user authentication and checks permission to view brands.
 * 2. Validates input brand ID using Zod schema.
 * 3. Attempts to retrieve brand data from Redis for performance optimization.
 * 4. Fetches brand data from the database if not found in Redis and caches it.
 * 5. Returns a success response with brand data or an error if validation, permission, or retrieval fails.
 *
 * @param _ - Unused parent parameter for GraphQL resolver.
 * @param args - Input arguments containing the brand ID.
 * @param context - GraphQL context containing authenticated user information.
 * @returns A promise resolving to a GetBrandByIDResponseOrError object containing status, message, brand data, and errors if applicable.
 */
export const getBrandById = async (
  _: any,
  args: QueryGetBrandByIdArgs,
  { user }: Context
): Promise<GetBrandByIdResponseOrError> => {
  try {
    // Verify user authentication
    const authResponse = checkUserAuth(user);
    if (authResponse) return authResponse;

    // Check if user has permission to view brands
    const canRead = await checkUserPermission({
      action: "canRead",
      entity: "brand",
      user,
    });

    if (!canRead) {
      return {
        statusCode: 403,
        success: false,
        message: "You do not have permission to view brand info",
        __typename: "BaseResponse",
      };
    }

    // Validate input brand ID with Zod schema
    const validationResult = await idSchema.safeParseAsync(args);

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

    const { id } = args;

    // Attempt to retrieve cached brand data from Redis
    let brandData = await getBrandInfoByBrandIdFromRedis(id);

    if (brandData?.deletedAt) {
      return {
        statusCode: 404,
        success: false,
        message: `Brand not found with this id: ${id}, or it may have been deleted or moved to the trash`,
        __typename: "BaseResponse",
      };
    }

    if (!brandData) {
      // On cache miss, fetch brand data from database
      const dbBrand = await getBrandByIdService(id);

      if (!dbBrand) {
        return {
          statusCode: 404,
          success: false,
          message: `Brand not found with this id: ${id}, or it may have been deleted or moved to the trash`,
          __typename: "BaseResponse",
        };
      }

      // Cache brand data in Redis
      await setBrandInfoByBrandIdInRedis(id, dbBrand);
      brandData = dbBrand;
    }

    return {
      statusCode: 200,
      success: true,
      message: "Brand fetched successfully",
      brand: {
        id: brandData.id,
        name: brandData.name,
        slug: brandData.slug,
        thumbnail: brandData.thumbnail,
        createdBy: brandData.createdBy as any,
        createdAt:
          brandData.createdAt instanceof Date
            ? brandData.createdAt.toISOString()
            : brandData.createdAt,
        deletedAt:
          brandData.deletedAt instanceof Date
            ? brandData.deletedAt.toISOString()
            : brandData.deletedAt,
      },
      __typename: "BrandResponseById",
    };
  } catch (error: any) {
    console.error("Error retrieving brand:", {
      message: error.message,
    });

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
