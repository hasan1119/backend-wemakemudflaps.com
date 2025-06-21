import CONFIG from "../../../config/config";
import { Context } from "../../../context";
import {
  getCategoryInfoByCategoryIdFromRedis,
  getCategoryNameExistFromRedis,
  getSubCategoryNameExistFromRedis,
  setCategoryInfoByCategoryIdInRedis,
  setCategoryNameExistInRedis,
  setSubCategoryNameExistInRedis,
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
  findCategoryByName,
  getCategoryById,
  getSubCategoryById,
} from "../../service";

export const createCategory = async (
  _: any,
  args: MutationCreateCategoryArgs,
  { user }: Context
): Promise<CreateCategoryResponseOrError> => {
  try {
    // Verify user authentication
    const authResponse = checkUserAuth(user);
    if (authResponse) return authResponse;

    // Check if user has permission to create a role
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
        field: error.path.join("."), // Join path array to string for field identification
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

    const { categoryId, description, name, parentSubCategoryId, thumbnail } =
      validationResult.data;

    // Attempt to check for existing category in Redis
    let categoryExists;

    if (categoryId || parentSubCategoryId) {
      // Check if category exists in Redis
      categoryExists = await getSubCategoryNameExistFromRedis(name);
    } else {
      categoryExists = await getCategoryNameExistFromRedis(name);
    }

    if (!categoryExists) {
      // On cache miss, check database for role existence
      categoryExists = await findCategoryByName(
        name,
        categoryId || parentSubCategoryId ? "subCategory" : "category"
      );

      if (categoryExists) {
        // Cache role existence in Redis

        if (categoryId || parentSubCategoryId) {
          await setSubCategoryNameExistInRedis(name);
        } else {
          await setCategoryNameExistInRedis(name);
        }

        return {
          statusCode: 400,
          success: false,
          message:
            categoryId || parentSubCategoryId
              ? "Subcategory with this name already exists"
              : "Category with this name already exists",
          __typename: "BaseResponse",
        };
      }
    } else {
      return {
        statusCode: 400,
        success: false,
        message:
          categoryId || parentSubCategoryId
            ? "Subcategory with this name already exists"
            : "Category with this name already exists",
        __typename: "BaseResponse",
      };
    }

    // Create the category in the database with audit information
    const category = await createCategoryOrSubCategory(
      {
        categoryId,
        description,
        name,
        parentSubCategoryId,
        thumbnail,
      },
      user.id
    );

    const isSubCategory = "categoryId" in args || "parentSubCategoryId" in args;

    let parentCategory = null;
    let parentSubCategory = null;

    if (isSubCategory) {
      if (categoryId) {
        // Direct subcategory under category
        parentCategory =
          (await getCategoryInfoByCategoryIdFromRedis(categoryId)) ||
          (await getCategoryById(categoryId));
        if (!parentCategory) {
          return {
            statusCode: 404,
            success: false,
            message: "Parent category not found",
            __typename: "BaseResponse",
          };
        }
        await setCategoryInfoByCategoryIdInRedis(categoryId, parentCategory);
      } else if (parentSubCategoryId) {
        // Nested subcategory, find parent subcategory
        parentSubCategory = await getSubCategoryById(parentSubCategoryId);
        if (!parentSubCategory) {
          return {
            statusCode: 404,
            success: false,
            message: "Parent subcategory not found",
            __typename: "BaseResponse",
          };
        }

        parentCategory = parentSubCategory.category;
        if (!parentCategory) {
          return {
            statusCode: 500,
            success: false,
            message: "Parent category is missing from subcategory",
            __typename: "BaseResponse",
          };
        }
      }
    }

    let categoryResponse: any;
    if (!isSubCategory) {
      categoryResponse = {
        ...category,
        subCategories: category.subCategories ?? [],
        products: category.products ?? [],
        createdBy: category.createdBy as any,
        createdAt:
          category.createdAt instanceof Date
            ? category.createdAt.toISOString()
            : category.createdAt,
        deletedAt:
          category.deletedAt instanceof Date
            ? category.deletedAt.toISOString()
            : category.deletedAt,
      };
    } else {
      categoryResponse = {
        ...category,
        category: isSubCategory ? parentCategory : undefined,
        parentSubCategory: parentSubCategory || null,
        subCategories: category.subCategories ?? [],
        products: category.products ?? [],
        createdBy: category.createdBy as any,
        createdAt:
          category.createdAt instanceof Date
            ? category.createdAt.toISOString()
            : category.createdAt,
        deletedAt:
          category.deletedAt instanceof Date
            ? category.deletedAt.toISOString()
            : category.deletedAt,
      };
    }

    // Cache the new category and its name existence in Redis
    await Promise.all([
      setCategoryInfoByCategoryIdInRedis(category.id, categoryResponse),
      setCategoryNameExistInRedis(category.name),
    ]);

    return {
      statusCode: 201,
      success: true,
      message: isSubCategory
        ? "Subcategory created successfully"
        : "Category created successfully",
      data: categoryResponse,
      __typename: isSubCategory ? "SubCategoryResponse" : "CategoryResponse",
    };
  } catch (error: any) {
    console.error("Error creating category:", error);

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
