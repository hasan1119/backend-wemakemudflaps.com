import CONFIG from "../../../config/config";
import { Context } from "../../../context";
import {
  clearBrandsAndCountCache,
  getBrandNameExistFromRedis,
  getBrandSlugExistFromRedis,
  setBrandInfoByIdInRedis,
  setBrandNameExistInRedis,
  setBrandSlugExistInRedis,
} from "../../../helper/redis";
import {
  CreateBrandResponseOrError,
  MutationCreateBrandArgs,
} from "../../../types";
import { createBrandSchema } from "../../../utils/data-validation";
import {
  checkUserAuth,
  checkUserPermission,
  createBrand as createBrandService,
  findBrandByName,
  findBrandBySlug,
} from "../../services";

/**
 * Handles the creation of a new brand in the system.
 *
 * Workflow:
 * 1. Verifies user authentication and permission to create brands.
 * 2. Validates input (name, slug and thumbnail) using Zod schema.
 * 3. Checks Redis for existing brand name to prevent duplicates.
 * 4. Queries the database for brand existence if not found in Redis.
 * 5. Creates the brand in the database with audit information from the authenticated user.
 * 6. Caches the new brand and its name existence in Redis for future requests.
 * 7. Returns a success response or error if validation, permission, or creation fails.
 *
 * @param _ - Unused parent parameter for GraphQL resolver.
 * @param args - Input arguments containing brand name and slug.
 * @param context - GraphQL context containing authenticated user information.
 * @returns A promise resolving to a BaseResponseOrError object containing status, message, and errors if applicable.
 */
export const createBrand = async (
  _: any,
  args: MutationCreateBrandArgs,
  { user }: Context
): Promise<CreateBrandResponseOrError> => {
  try {
    // Verify user authentication
    const authError = checkUserAuth(user);
    if (authError) return authError;

    // Check if user has permission to create a brand
    const hasPermission = await checkUserPermission({
      user,
      action: "canCreate",
      entity: "brand",
    });

    if (!hasPermission) {
      return {
        statusCode: 403,
        success: false,
        message: "You do not have permission to create brands",
        __typename: "BaseResponse",
      };
    }

    // Validate input data with Zod schema
    const result = await createBrandSchema.safeParseAsync(args);

    // Return detailed validation errors if input is invalid
    if (!result.success) {
      const errors = result.error.errors.map((e) => ({
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

    const { name, slug, thumbnail } = result.data;

    // Attempt to check for existing brand in Redis
    let brandExists = await getBrandNameExistFromRedis(name);

    if (!brandExists) {
      // On cache miss, check database for brand existence
      const existingBrand = await findBrandByName(name);

      if (existingBrand) {
        // Cache brand existence in Redis
        await setBrandNameExistInRedis(name);

        return {
          statusCode: 400,
          success: false,
          message: `A brand with this ${name} already exists`,
          __typename: "BaseResponse",
        };
      }
    } else {
      return {
        statusCode: 400,
        success: false,
        message: `A brand with this ${name} already exists`,
        __typename: "BaseResponse",
      };
    }

    // Attempt to check for existing brand slug in Redis
    let brandSlug = await getBrandSlugExistFromRedis(slug);

    if (!brandSlug) {
      // On cache miss, check database for brand existence
      const existingSlugBrand = await findBrandBySlug(name);

      if (existingSlugBrand) {
        // Cache brand existence in Redis
        await setBrandSlugExistInRedis(name);

        return {
          statusCode: 400,
          success: false,
          message: `A brand with this ${slug} already exists`,
          __typename: "BaseResponse",
        };
      }
    } else {
      return {
        statusCode: 400,
        success: false,
        message: `A brand with this ${slug} already exists`,
        __typename: "BaseResponse",
      };
    }

    // Create the brand in the database
    const brand = await createBrandService({ name, slug, thumbnail }, user.id);

    // Cache brand information and existence in Redis
    await Promise.all([
      setBrandInfoByIdInRedis(brand.id, {
        ...brand,
        totalProducts: brand.products.length,
        thumbnail: brand.thumbnail as any,
        createdBy: brand.createdBy as any,
        createdAt:
          brand.createdAt instanceof Date
            ? brand.createdAt.toISOString()
            : brand.createdAt,
        deletedAt:
          brand.deletedAt instanceof Date
            ? brand.deletedAt.toISOString()
            : brand.deletedAt,
      }),
      setBrandNameExistInRedis(brand.name),
      setBrandSlugExistInRedis(brand.slug),
      clearBrandsAndCountCache(),
    ]);

    return {
      statusCode: 201,
      success: true,
      message: "Brand created successfully",
      brand: {
        id: brand.id,
        name: brand.name,
        slug: brand.slug,
        thumbnail: brand.thumbnail as any,
        createdBy: brand.createdBy as any,
        createdAt:
          brand.createdAt instanceof Date
            ? brand.createdAt.toISOString()
            : brand.createdAt,
        deletedAt:
          brand.deletedAt instanceof Date
            ? brand.deletedAt.toISOString()
            : brand.deletedAt,
      },
      __typename: "BrandResponse",
    };
  } catch (error: any) {
    console.error("Error creating brand:", error);
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
