import CONFIG from "../../../config/config";
import { Context } from "../../../context";
import {
  clearAllCategorySearchCache,
  getCategoryNameExistFromRedis,
  getCategorySlugExistFromRedis,
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
  CreateCategoryResponseOrError,
  MutationCreateCategoryArgs,
} from "../../../types";
import { createCategorySchema } from "../../../utils/data-validation";
import {
  checkUserAuth,
  checkUserPermission,
  createCategoryOrSubCategory,
  findCategoryByNameOrSlug,
  getCategoryById,
  getSubCategoryById,
} from "../../services";

/**
 * Handles the creation of a new category or sub-category in the system.
 *
 * Workflow:
 * 1. Verifies user authentication and permission to create categories.
 * 2. Validates input (categoryId, description, name, parentSubCategoryId, thumbnail, slug) using Zod schema.
 * 3. Checks Redis for existing category/sub-category name and slug to prevent duplicates.
 * 4. Queries the database for category/sub-category existence if not found in Redis.
 * 5. Creates the category/sub-category in the database with audit information from the authenticated user.
 * 6. Caches the new category/sub-category, its name and slug existence in Redis for future requests.
 * 7. Returns a success response or error if validation, permission, or creation fails.
 *
 * @param _ - Unused parent parameter for GraphQL resolver.
 * @param args - Input arguments containing categoryId, description, name, parentSubCategoryId, thumbnail, and slug.
 * @param context - GraphQL context containing authenticated user information.
 * @returns A promise resolving to a CreateCategoryResponseOrError object.
 */
export const createCategory = async (
  _: any,
  args: MutationCreateCategoryArgs,
  { user }: Context
): Promise<CreateCategoryResponseOrError> => {
  try {
    // Verify user authentication
    const authResponse = checkUserAuth(user);
    if (authResponse) return authResponse;

    // Check if user has permission to create a category
    const canCreate = await checkUserPermission({
      action: "canCreate",
      entity: "category",
      user,
    });

    if (!canCreate) {
      return {
        statusCode: 403,
        success: false,
        message: "You do not have permission to create category",
        __typename: "BaseResponse",
      };
    }

    // Validate input data with Zod schema
    const validationResult = await createCategorySchema.safeParseAsync(args);

    // Return detailed validation errors if input is invalid
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

    const {
      categoryId,
      description,
      name,
      parentSubCategoryId,
      thumbnail,
      slug,
    } = validationResult.data;

    const isSubCategory = categoryId || parentSubCategoryId;
    const scopeType = isSubCategory ? "subCategory" : "category";
    const parentId = categoryId || parentSubCategoryId;

    // Attempt to check for existing name in Redis
    const nameExists = isSubCategory
      ? categoryId
        ? await getSubCategoryNameExistFromRedis(name)
        : await getSubCategoryNameExistFromRedis(name, parentSubCategoryId)
      : await getCategoryNameExistFromRedis(name);

    if (nameExists) {
      return {
        statusCode: 400,
        success: false,
        message: `${
          scopeType === "category" ? "Category" : "Subcategory"
        } with this name already exists`,
        __typename: "BaseResponse",
      };
    }

    // Attempt to check for existing slug in Redis
    const slugExists = isSubCategory
      ? categoryId
        ? await getSubCategorySlugExistFromRedis(slug)
        : await getSubCategorySlugExistFromRedis(slug, parentSubCategoryId)
      : await getCategorySlugExistFromRedis(slug);

    if (slugExists) {
      return {
        statusCode: 400,
        success: false,
        message: `${
          scopeType === "category" ? "Category" : "Subcategory"
        } with this slug already exists`,
        __typename: "BaseResponse",
      };
    }

    // Check database for category/subcategory existence
    const categoryExists = await findCategoryByNameOrSlug(
      name,
      slug,
      scopeType,
      categoryId,
      parentSubCategoryId
    );

    if (categoryExists) {
      return {
        statusCode: 400,
        success: false,
        message: isSubCategory
          ? "Subcategory with this name/slug already exists in parent"
          : "Category with this name/slug already exists",
        __typename: "BaseResponse",
      };
    }

    // Validate parent category if categoryId is provided
    let parentCategoryExist;
    if (categoryId) {
      parentCategoryExist = await getCategoryById(categoryId);
      if (!parentCategoryExist) {
        return {
          statusCode: 404,
          success: false,
          message: "Parent category not found",
          __typename: "BaseResponse",
        };
      }
    }

    // Validate parent subcategory if parentSubCategoryId is provided
    let subParentCategoryExist;
    if (parentSubCategoryId) {
      subParentCategoryExist = await getSubCategoryById(parentSubCategoryId);
      if (!subParentCategoryExist) {
        return {
          statusCode: 404,
          success: false,
          message: "Parent subcategory not found",
          __typename: "BaseResponse",
        };
      }
    }

    // Create the category or subcategory in the database
    const categoryResult = await createCategoryOrSubCategory(
      {
        categoryId,
        description,
        name,
        parentSubCategoryId,
        thumbnail,
        slug,
      },
      user.id
    );

    // Construct the response object
    let categoryResponse: any;
    if (!isSubCategory) {
      // Top-level category
      categoryResponse = {
        id: categoryResult.id,
        name: categoryResult.name,
        slug: categoryResult.slug,
        description: categoryResult.description,
        thumbnail: categoryResult.thumbnail as any,
        position: categoryResult.position,
        totalProducts: categoryResult?.products?.length ?? 0,
        createdBy: categoryResult.createdBy as any,
        createdAt:
          categoryResult.createdAt instanceof Date
            ? categoryResult.createdAt.toISOString()
            : categoryResult.createdAt,
        deletedAt:
          categoryResult.deletedAt instanceof Date
            ? categoryResult.deletedAt.toISOString()
            : categoryResult.deletedAt,
      };
    } else {
      // Subcategory
      categoryResponse = {
        id: categoryResult.id,
        name: categoryResult.name,
        slug: categoryResult.slug,
        description: categoryResult.description,
        thumbnail: categoryResult.thumbnail as any,
        position: categoryResult.position,
        totalProducts: categoryResult?.products?.length ?? 0,
        category: categoryId ? categoryId : subParentCategoryExist?.category,
        parentSubCategory: subParentCategoryExist?.id || null,
        createdBy: categoryResult.createdBy as any,
        createdAt:
          categoryResult.createdAt instanceof Date
            ? categoryResult.createdAt.toISOString()
            : categoryResult.createdAt,
        deletedAt:
          categoryResult.deletedAt instanceof Date
            ? categoryResult.deletedAt.toISOString()
            : categoryResult.deletedAt,
      };
    }

    // Cache category/sub-category information and existence in Redis
    await Promise.all([
      isSubCategory
        ? // Cache sub-category information and existence in Redis await
          Promise.all([
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
          ])
        : // Cache category information and existence in Redis await
          Promise.all([
            setCategoryInfoByIdInRedis(categoryResponse.id, categoryResponse),
            setCategoryNameExistInRedis(categoryResponse.name),
            setCategorySlugExistInRedis(categoryResponse.slug),
          ]),
      clearAllCategorySearchCache(),
    ]);

    if (isSubCategory) {
      return {
        statusCode: 201,
        success: true,
        message: "Subcategory created successfully",
        subcategory: categoryResponse,
        __typename: "SubCategoryResponse",
      };
    } else {
      return {
        statusCode: 201,
        success: true,
        message: "Category created successfully",
        category: categoryResponse,
        __typename: "CategoryResponse",
      };
    }
  } catch (error: any) {
    console.error("Error creating category:", error);
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
