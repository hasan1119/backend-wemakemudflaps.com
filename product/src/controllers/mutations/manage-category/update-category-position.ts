import CONFIG from "../../../config/config";
import { Context } from "../../../context";
import { Category, SubCategory } from "../../../entities";
import {
  clearAllCategorySearchCache,
  getCategoryInfoByIdFromRedis,
  getSubCategoryInfoByIdFromRedis,
  setCategoryInfoByIdInRedis,
  setSubCategoryInfoByIdInRedis,
} from "../../../helper/redis";
import {
  MutationUpdateCategoryPositionArgs,
  UpdateCategoryPositionResponseOrError,
} from "../../../types";
import { updateCategoryPositionSchema } from "../../../utils/data-validation";
import {
  checkUserAuth,
  checkUserPermission,
  getCategoryById,
  getSubCategoryById,
  updatePosition,
} from "../../services";

/**
 * Handles updating an existing category or subcategory position with validation, permission checks, and Redis caching.
 *
 * Workflow:
 * 1. Verifies user authentication.
 * 2. Checks user permission to update categories.
 * 3. Validates input (id, position, categoryType) using Zod schema.
 * 4. Retrieves category/subcategory from Redis or database and ensures it exists and is not soft-deleted.
 * 5. Updates the position in the database with audit details.
 * 6. Caches the updated category/subcategory in Redis and clears the search cache.
 * 7. Returns a success response or error if validation, permission, or update fails.
 *
 * @param _ - Unused parent parameter for GraphQL resolver.
 * @param args - Input arguments containing id, position, and categoryType.
 * @param context - GraphQL context containing authenticated user information.
 * @returns A promise resolving to a UpdateCategoryPositionResponseOrError object.
 */
export const updateCategoryPosition = async (
  _: any,
  args: MutationUpdateCategoryPositionArgs,
  { user }: Context
): Promise<UpdateCategoryPositionResponseOrError> => {
  try {
    // Verify user authentication
    const authResponse = checkUserAuth(user);
    if (authResponse) return authResponse;

    // Check if user has permission to update categories
    const canUpdate = await checkUserPermission({
      action: "canUpdate",
      entity: "category",
      user,
    });

    if (!canUpdate) {
      return {
        statusCode: 403,
        success: false,
        message: "You do not have permission to update any category info",
        __typename: "BaseResponse",
      };
    }

    // Validate input data with Zod schema
    const validationResult = await updateCategoryPositionSchema.safeParseAsync(
      args
    );

    // Return detailed validation errors if input is invalid
    if (!validationResult.success) {
      const errors = validationResult.error.errors.map((e) => ({
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

    const { id, position, categoryType } = validationResult.data;

    // Check Redis for category/subcategory existence
    let categoryExist = null;
    if (categoryType === "category") {
      categoryExist = await getCategoryInfoByIdFromRedis(id);
    } else {
      categoryExist = await getSubCategoryInfoByIdFromRedis(id);
    }

    // Check if the category was soft deleted
    if (categoryExist?.deletedAt) {
      return {
        statusCode: 404,
        success: false,
        message: `Category not found with this id: ${id}, or it may have been deleted or moved to the trash`,
        __typename: "BaseResponse",
      };
    }

    // If not found in Redis, fall back to the database
    if (!categoryExist) {
      categoryExist =
        categoryType === "category"
          ? await getCategoryById(id)
          : await getSubCategoryById(id);

      if (!categoryExist) {
        return {
          statusCode: 404,
          success: false,
          message: `Category not found with this id: ${id}, or it may have been deleted or moved to the trash`,
          __typename: "BaseResponse",
        };
      }
    }

    function isSubCategory(obj: Category | SubCategory): obj is SubCategory {
      return "category" in obj;
    }

    let categoryId: string | undefined = undefined;
    let parentSubCategoryId: string | undefined = undefined;

    if (categoryType !== "category" && isSubCategory(categoryExist)) {
      const resolvedCategory = await categoryExist.category;
      categoryId = resolvedCategory?.id;

      if (categoryExist.parentSubCategory) {
        parentSubCategoryId = categoryExist.parentSubCategory.id;
      }
    }

    // Update position in the database
    try {
      await updatePosition(
        id,
        position,
        categoryType === "category" ? "category" : "subCategory",
        {
          categoryId,
          parentSubCategoryId,
        }
      );
    } catch (err: any) {
      return {
        statusCode: 400,
        success: false,
        message: err.message || "Failed to update position",
        __typename: "BaseResponse",
      };
    }

    // Construct the response object
    let categoryResponse: any;
    if (categoryType === "category") {
      categoryResponse = {
        id: categoryExist.id,
        name: categoryExist.name,
        slug: categoryExist.slug,
        description: categoryExist.description,
        thumbnail: categoryExist.thumbnail as any,
        position: position,
        createdBy: categoryExist.createdBy as any,
        createdAt:
          categoryExist.createdAt instanceof Date
            ? categoryExist.createdAt.toISOString()
            : categoryExist.createdAt,
        deletedAt:
          categoryExist.deletedAt instanceof Date
            ? categoryExist.deletedAt.toISOString()
            : categoryExist.deletedAt,
      };
    } else {
      categoryResponse = {
        id: categoryExist.id,
        name: categoryExist.name,
        slug: categoryExist.slug,
        description: categoryExist.description,
        thumbnail: categoryExist.thumbnail as any,
        position: position,
        category: categoryId,
        parentSubCategory: parentSubCategoryId,
        createdBy: categoryExist.createdBy as any,
        subCategories: categoryExist.subCategories
          ? categoryExist.subCategories.map((subCat: any) => ({
              ...subCat,
              category: undefined,
            }))
          : null,
        createdAt:
          categoryExist.createdAt instanceof Date
            ? categoryExist.createdAt.toISOString()
            : categoryExist.createdAt,
        deletedAt:
          categoryExist.deletedAt instanceof Date
            ? categoryExist.deletedAt.toISOString()
            : categoryExist.deletedAt,
      };
    }

    // Cache updated category/subcategory in Redis and clear search cache
    await Promise.all([
      categoryType === "category"
        ? setCategoryInfoByIdInRedis(categoryResponse.id, categoryResponse)
        : setSubCategoryInfoByIdInRedis(categoryResponse.id, categoryResponse),
      clearAllCategorySearchCache(),
    ]);

    if (categoryType !== "category") {
      return {
        statusCode: 201,
        success: true,
        message: "Subcategory position updated successfully",
        subcategory: categoryResponse,
        __typename: "SubCategoryResponse",
      };
    } else {
      return {
        statusCode: 201,
        success: true,
        message: "Category position updated successfully",
        category: categoryResponse,
        __typename: "CategoryResponse",
      };
    }
  } catch (error: any) {
    console.error("Error updating category position:", error);
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
