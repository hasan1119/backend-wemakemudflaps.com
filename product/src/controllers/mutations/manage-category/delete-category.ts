import CONFIG from "../../../config/config";
import { Context } from "../../../context";
import { Category, SubCategory } from "../../../entities";
import {
  clearAllCategorySearchCache,
  getCategoryInfoByIdFromRedis,
  getSubCategoryInfoByIdFromRedis,
  removeCategoryInfoByIdFromRedis,
  removeCategoryNameExistFromRedis,
  removeCategorySlugExistFromRedis,
  removeSubCategoryInfoByIdFromRedis,
  removeSubCategoryNameExistFromRedis,
  removeSubCategorySlugExistFromRedis,
  setCategoryInfoByIdInRedis,
  setSubCategoryInfoByIdInRedis,
} from "../../../helper/redis";
import {
  BaseResponseOrError,
  MutationDeleteCategoryArgs,
} from "../../../types";
import { deleteCategorySchema } from "../../../utils/data-validation";
import {
  canDeleteCategoryOrSubCategory,
  checkUserAuth,
  checkUserPermission,
  getCategoryById,
  getSubCategoryById,
  hardDeleteCategoryOrSubCategory,
  softDeleteCategoryOrSubCategory,
} from "../../services";

// Clear category/subcategory-related cache entries in Redis
const clearCategoryCache = async (
  id: string,
  name: string,
  slug: string,
  categoryType: "category" | "subCategory",
  parentId?: string
) => {
  await Promise.all([
    categoryType === "category"
      ? removeCategoryInfoByIdFromRedis(id)
      : removeSubCategoryInfoByIdFromRedis(id),
    categoryType === "category"
      ? removeCategoryNameExistFromRedis(name)
      : removeSubCategoryNameExistFromRedis(name, parentId),
    categoryType === "category"
      ? removeCategorySlugExistFromRedis(slug)
      : removeSubCategorySlugExistFromRedis(slug, parentId),
    clearAllCategorySearchCache(),
  ]);
};

// Perform soft delete and update cache
const softDeleteAndCache = async (
  id: string,
  categoryType: "category" | "subCategory",
  categoryId?: string,
  parentSubCategoryId?: string
) => {
  const deletedData = await softDeleteCategoryOrSubCategory(id, categoryType);
  // Construct the response object
  let categoryResponse: any;
  if (categoryType === "category") {
    // Top-level category
    categoryResponse = {
      id: deletedData.id,
      name: deletedData.name,
      slug: deletedData.slug,
      description: deletedData.description,
      thumbnail: deletedData.thumbnail,
      position: deletedData.position,
      totalProducts: deletedData?.products?.length ?? 0,
      createdBy: deletedData.createdBy as any,
      createdAt:
        deletedData.createdAt instanceof Date
          ? deletedData.createdAt.toISOString()
          : deletedData.createdAt,
      deletedAt:
        deletedData.deletedAt instanceof Date
          ? deletedData.deletedAt.toISOString()
          : deletedData.deletedAt,
    };
  } else {
    // Subcategory
    categoryResponse = {
      id: deletedData.id,
      name: deletedData.name,
      slug: deletedData.slug,
      description: deletedData.description,
      thumbnail: deletedData.thumbnail,
      position: deletedData.position,
      totalProducts: deletedData?.products?.length ?? 0,
      category: categoryId,
      parentSubCategory: parentSubCategoryId || null,
      createdBy: deletedData.createdBy as any,
      createdAt:
        deletedData.createdAt instanceof Date
          ? deletedData.createdAt.toISOString()
          : deletedData.createdAt,
      deletedAt:
        deletedData.deletedAt instanceof Date
          ? deletedData.deletedAt.toISOString()
          : deletedData.deletedAt,
    };
  }

  if (categoryType === "category") {
    await setCategoryInfoByIdInRedis(id, categoryResponse);
  } else {
    await setSubCategoryInfoByIdInRedis(id, categoryResponse);
  }
  await clearAllCategorySearchCache();
};

/**
 * GraphQL Mutation Resolver to delete a category or subcategory with Redis caching.
 *
 * Workflow:
 * 1. Authenticates the user and checks for delete permissions.
 * 2. Validates input arguments using Zod schema.
 * 3. Retrieves the category or subcategory by ID from Redis or database and ensures it exists.
 * 4. Verifies the entity has no associated products (for safe deletion).
 * 5. Performs a soft delete (move to trash) or hard delete (permanent) based on `skipTrash`.
 * 6. Updates Redis cache (clears name/slug for hard delete, updates entity for soft delete).
 * 7. If subcategory, ensures position realignment within its parent scope.
 *
 * Notes:
 * - For subcategories, determines whether it's nested under a parent subcategory or directly under a category.
 * - Handles both `category` and `subcategory` types via a shared resolver.
 *
 * @param _ - Unused resolver root parameter.
 * @param args - Input arguments: id (UUID), categoryType ("category" or "subcategory"), and skipTrash (Boolean).
 * @param context - GraphQL context with authenticated user info.
 * @returns A `BaseResponseOrError` indicating success or detailed error info.
 */
export const deleteCategory = async (
  _: any,
  args: MutationDeleteCategoryArgs,
  { user }: Context
): Promise<BaseResponseOrError> => {
  try {
    // Verify user authentication
    const authResponse = checkUserAuth(user);
    if (authResponse) return authResponse;

    const canDelete = await checkUserPermission({
      action: "canDelete",
      entity: "category",
      user,
    });

    // Check if user has permission to delete a category
    if (!canDelete) {
      return {
        statusCode: 403,
        success: false,
        message: "You do not have permission to delete categories",
        __typename: "BaseResponse",
      };
    }

    // Validate input data with Zod schema
    const validationResult = deleteCategorySchema.safeParse(args);

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

    const { id, categoryType, skipTrash } = validationResult.data;

    // Check Redis for category/subcategory existence
    let categoryExist = null;
    if (categoryType === "category") {
      categoryExist = await getCategoryInfoByIdFromRedis(id);
    } else {
      categoryExist = await getSubCategoryInfoByIdFromRedis(id);
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
          message: "Category not found",
          __typename: "BaseResponse",
        };
      }
    }

    // Check if the category was soft deleted
    if (categoryExist.deletedAt && !skipTrash) {
      return {
        statusCode: 400,
        success: false,
        message: `${
          categoryType.charAt(0).toUpperCase() + categoryType.slice(1)
        }: ${categoryExist.name} already in the trash`,
        __typename: "BaseResponse",
      };
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

    // Check if deletable (no associated products)
    const deletable = await canDeleteCategoryOrSubCategory(id, categoryType);
    if (!deletable) {
      return {
        statusCode: 400,
        success: false,
        message: `Cannot delete ${categoryType} because it has associated products.`,
        __typename: "BaseResponse",
      };
    }

    const { name, slug } = categoryExist;

    // Perform soft or hard deletion based on skipTrash
    if (skipTrash) {
      await hardDeleteCategoryOrSubCategory(id, categoryType, {
        categoryId,
        parentSubCategoryId,
      });
      await clearCategoryCache(
        id,
        name,
        slug,
        categoryType,
        parentSubCategoryId
      );
    } else {
      await softDeleteAndCache(
        id,
        categoryType,
        categoryId,
        parentSubCategoryId
      );
    }

    return {
      statusCode: 200,
      success: true,
      message: `${
        skipTrash
          ? `${
              categoryType.charAt(0).toUpperCase() + categoryType.slice(1)
            } permanently deleted`
          : `${
              categoryType.charAt(0).toUpperCase() + categoryType.slice(1)
            } moved to trash`
      } successfully: ${name}`,
      __typename: "BaseResponse",
    };
  } catch (error: any) {
    console.error("Error deleting category/subcategory:", error);

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
