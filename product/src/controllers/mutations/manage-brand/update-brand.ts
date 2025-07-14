import CONFIG from "../../../config/config";
import { Context } from "../../../context";
import {
  clearBrandsAndCountCache,
  getBrandInfoByIdFromRedis,
  getBrandNameExistFromRedis,
  getBrandSlugExistFromRedis,
  removeBrandInfoByIdFromRedis,
  removeBrandNameExistFromRedis,
  removeBrandSlugExistFromRedis,
  setBrandInfoByIdInRedis,
  setBrandNameExistInRedis,
  setBrandSlugExistInRedis,
} from "../../../helper/redis";
import {
  MutationUpdateBrandArgs,
  UpdateBrandResponseOrError,
} from "../../../types";
import { updateBrandSchema } from "../../../utils/data-validation";
import {
  checkUserAuth,
  checkUserPermission,
  findBrandByNameToUpdate,
  findBrandBySlugToUpdate,
  getBrandById,
  updateBrand as updateBrandService,
} from "../../services";

/**
 * Handles updating brand data (name, slug and thumbnail) with proper validation and permission checks.
 *
 * Workflow:
 * 1. Authenticates user and verifies permission to update brands.
 * 2. Validates input (id, name, slug) using Zod schema.
 * 3. Fetches current brand data from Redis or DB.
 * 4. Checks if updated name or slug conflicts with existing brands.
 * 5. Updates the brand in the database.
 * 6. Updates Redis with new brand info and name existence key.
 * 7. Returns the updated brand or error if validation or update fails.
 *
 * @param _ - Unused parent parameter for GraphQL resolver.
 * @param args - Input arguments containing brand ID and updated fields.
 * @param context - GraphQL context containing authenticated user information.
 * @returns A promise resolving to an UpdateBrandResponseOrError.
 */
export const updateBrand = async (
  _: any,
  args: MutationUpdateBrandArgs,
  { user }: Context
): Promise<UpdateBrandResponseOrError> => {
  try {
    // Check user authentication
    const authError = checkUserAuth(user);
    if (authError) return authError;

    // Permission check
    const hasPermission = await checkUserPermission({
      user,
      action: "canUpdate",
      entity: "brand",
    });

    if (!hasPermission) {
      return {
        statusCode: 403,
        success: false,
        message: "You do not have permission to update brands",
        __typename: "BaseResponse",
      };
    }

    // Validate input
    const result = await updateBrandSchema.safeParseAsync(args);
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

    const { id, name, slug, thumbnail } = result.data;

    // Get current brand data from Redis or DB
    let currentBrand = await getBrandInfoByIdFromRedis(id);

    if (currentBrand?.deletedAt) {
      return {
        statusCode: 404,
        success: false,
        message: `Brand not found with this id: ${id}, or it may have been deleted or moved to the trash`,
        __typename: "BaseResponse",
      };
    }

    if (!currentBrand) {
      currentBrand = await getBrandById(id); // fallback to DB
      if (!currentBrand) {
        return {
          statusCode: 404,
          success: false,
          message: `Brand not found with this id: ${id}, or it may have been deleted or moved to the trash`,
          __typename: "BaseResponse",
        };
      }
    }

    // Check for duplicate name (if changed)
    if (name && name !== currentBrand.name) {
      let nameExists;

      nameExists = await getBrandNameExistFromRedis(name);

      if (!nameExists) {
        nameExists = await findBrandByNameToUpdate(id, name);
      }

      if (nameExists) {
        await setBrandNameExistInRedis(name);

        return {
          statusCode: 400,
          success: false,
          message: `Brand name: "${name}" already exists`,
          __typename: "BaseResponse",
        };
      }
    }

    // Check for duplicate name (if changed)
    if (slug && slug !== currentBrand.slug) {
      let slugExists;

      slugExists = await getBrandSlugExistFromRedis(slug);

      if (!slugExists) {
        slugExists = await findBrandBySlugToUpdate(id, slug);
      }

      if (slugExists) {
        await setBrandSlugExistInRedis(slug);

        return {
          statusCode: 400,
          success: false,
          message: `Brand slug: "${slug}" already exists`,
          __typename: "BaseResponse",
        };
      }
    }

    // Update the brand in the database
    const updatedBrand = await updateBrandService(id, {
      name,
      slug,
      thumbnail,
    });

    // Update Redis cache: remove old, add new
    await Promise.all([
      removeBrandInfoByIdFromRedis(id),
      removeBrandNameExistFromRedis(currentBrand.name),
      removeBrandSlugExistFromRedis(currentBrand.slug),
      setBrandInfoByIdInRedis(id, updatedBrand),
      setBrandNameExistInRedis(updatedBrand.name),
      setBrandSlugExistInRedis(updatedBrand.slug),
      clearBrandsAndCountCache(),
    ]);

    return {
      statusCode: 200,
      success: true,
      message: "Brand updated successfully",
      brand: {
        id: updatedBrand.id,
        name: updatedBrand.name,
        slug: updatedBrand.slug,
        thumbnail: updatedBrand.thumbnail as any,
        createdBy: updatedBrand.createdBy as any,
        createdAt: updatedBrand.createdAt.toISOString(),
        deletedAt:
          updatedBrand.deletedAt instanceof Date
            ? updatedBrand.deletedAt.toISOString()
            : updatedBrand.deletedAt,
      },
      __typename: "BrandResponse",
    };
  } catch (error: any) {
    console.error("Error updating brand:", error);
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
