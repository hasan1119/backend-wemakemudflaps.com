import CONFIG from "../../../config/config";
import { Context } from "../../../context";
import { Category, SubCategory } from "../../../entities";
import {
  clearAllCategorySearchCache,
  getCategoryInfoByIdFromRedis,
  getCategoryNameExistFromRedis,
  getCategorySlugExistFromRedis,
  getSubCategoryInfoByIdFromRedis,
  getSubCategoryNameExistFromRedis,
  getSubCategorySlugExistFromRedis,
  setCategoryInfoByIdInRedis,
  setCategoryNameExistInRedis,
  setCategorySlugExistInRedis,
  setSubCategoryInfoByIdInRedis,
  setSubCategoryNameExistInRedis,
  setSubCategorySlugExistInRedis,
} from "../../../helper/redis";
import {
  MutationUpdateCategoryArgs,
  UpdateCategoryResponseOrError,
} from "../../../types";
import { updateCategorySchema } from "../../../utils/data-validation";
import {
  checkUserAuth,
  checkUserPermission,
  findCategoryByNameOrSlugToUpdateScoped,
  getCategoryById,
  getSubCategoryById,
  updateCategoryOrSubCategory,
} from "../../services";

/**
 * Handles updating an existing category information with validation and permission checks.
 *
 * Workflow:
 * 1. Verifies user authentication and retrieves user data from Redis.
 * 2. Checks user permission to update categories.
 * 3. Validates input (id, name, slug, etc.) using Zod schema.
 * 4. Retrieves category/sub-category from Redis or DB and ensures it exists.
 * 5. Checks for duplicate name/slug in the same scope (excluding self).
 * 6. Updates category/sub-category info in DB and returns updated result.
 *
 * @param _ - Unused parent parameter for GraphQL resolver.
 * @param args - Input arguments containing id, name, slug, and other optional fields.
 * @param context - GraphQL context containing authenticated user information.
 * @returns A promise resolving to a BaseResponseOrError object.
 */
export const updateCategory = async (
  _: any,
  args: MutationUpdateCategoryArgs,
  { user }: Context
): Promise<UpdateCategoryResponseOrError> => {
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
    const validationResult = await updateCategorySchema.safeParseAsync(args);

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

    const { id, name, slug, categoryType } = validationResult.data;

    // Get category exist data from Redis or DB
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

    // Check for duplicate name (if changed)
    if (name && name !== categoryExist.name) {
      const nameExists =
        categoryType === "category"
          ? await getCategoryNameExistFromRedis(name)
          : categoryId
          ? await getSubCategoryNameExistFromRedis(name)
          : await getSubCategoryNameExistFromRedis(name, parentSubCategoryId);

      if (nameExists) {
        return {
          statusCode: 400,
          success: false,
          message: `Category name: "${name}" already exists`,
          __typename: "BaseResponse",
        };
      }
    }

    // Check for duplicate slug (if changed)
    if (slug && slug !== categoryExist.slug) {
      const slugExists =
        categoryType === "category"
          ? await getCategorySlugExistFromRedis(slug)
          : categoryId
          ? await getSubCategorySlugExistFromRedis(slug)
          : await getSubCategorySlugExistFromRedis(slug, parentSubCategoryId);

      if (slugExists) {
        return {
          statusCode: 400,
          success: false,
          message: `Category slug: "${slug}" already exists`,
          __typename: "BaseResponse",
        };
      }
    }

    // Check for name/slug conflict in the same parent scope (excluding self)
    const nameConflict = await findCategoryByNameOrSlugToUpdateScoped(
      id,
      name,
      slug ? slug : undefined,
      categoryType,
      categoryId,
      parentSubCategoryId
    );

    if (nameConflict) {
      return {
        statusCode: 400,
        success: false,
        message:
          categoryType === "category"
            ? "Category with this name/slug already exists"
            : "Subcategory with this name/slug already exists in parent",
        __typename: "BaseResponse",
      };
    }

    // Update category or subcategory in the database
    const result = await updateCategoryOrSubCategory(
      id,
      args,
      categoryType === "category" ? "category" : "subCategory"
    );

    // Construct the response object
    let categoryResponse: any;
    if (categoryType === "category") {
      categoryResponse = {
        id: result.id,
        name: result.name,
        slug: result.slug,
        description: result.description,
        thumbnail: result.thumbnail as any,
        position: result.position,
        createdBy: result.createdBy as any,
        createdAt:
          result.createdAt instanceof Date
            ? result.createdAt.toISOString()
            : result.createdAt,
        deletedAt:
          result.deletedAt instanceof Date
            ? result.deletedAt.toISOString()
            : result.deletedAt,
      };
    } else {
      categoryResponse = {
        id: result.id,
        name: result.name,
        slug: result.slug,
        description: result.description,
        thumbnail: result.thumbnail as any,
        category: categoryId,
        parentSubCategory: parentSubCategoryId,
        position: result.position,
        createdBy: result.createdBy as any,
        subCategories: result.subCategories
          ? result.subCategories.map((subCat: any) => ({
              ...subCat,
              category: undefined,
            }))
          : null,
        createdAt:
          result.createdAt instanceof Date
            ? result.createdAt.toISOString()
            : result.createdAt,
        deletedAt:
          result.deletedAt instanceof Date
            ? result.deletedAt.toISOString()
            : result.deletedAt,
      };
    }

    // Cache updated category/sub-category in Redis
    await Promise.all([
      categoryType === "category"
        ? Promise.all([
            setCategoryInfoByIdInRedis(categoryResponse.id, categoryResponse),
            setCategoryNameExistInRedis(categoryResponse.name),
            setCategorySlugExistInRedis(categoryResponse.slug),
          ])
        : Promise.all([
            setSubCategoryInfoByIdInRedis(
              categoryResponse.id,
              categoryResponse
            ),
            ...(categoryId
              ? [
                  setSubCategoryNameExistInRedis(categoryResponse.name),
                  setSubCategorySlugExistInRedis(categoryResponse.slug),
                ]
              : [
                  setSubCategoryNameExistInRedis(
                    categoryResponse.name,
                    parentSubCategoryId
                  ),
                  setSubCategorySlugExistInRedis(
                    categoryResponse.slug,
                    parentSubCategoryId
                  ),
                ]),
          ]),
      clearAllCategorySearchCache(),
    ]);

    if (categoryType !== "category") {
      return {
        statusCode: 201,
        success: true,
        message: "Subcategory updated successfully",
        subcategory: categoryResponse,
        __typename: "SubCategoryResponse",
      };
    } else {
      return {
        statusCode: 201,
        success: true,
        message: "Category updated successfully",
        category: categoryResponse,
        __typename: "CategoryResponse",
      };
    }
  } catch (error: any) {
    console.error("Error updating category info:", error);

    return {
      statusCode: 500,
      success: false,
      message: `${
        CONFIG.NODE_ENV === "production"
          ? "Something went wrong, please try again."
          : error.message || "Internal server error"
      }`,
      __typename: "BaseResponse",
    };
  }
};
