import CONFIG from "../../../config/config";
import { Context } from "../../../context";
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

/**
 * Handles the creation of a new category for product in the system.
 *
 * Workflow:
 * 1. Verifies user authentication and permission to create categories.
 * 2. Validates input (categoryId, description, name, parentSubCategoryId, thumbnail) using Zod schema.
 * 3. Queries the database for category existence.
 * 4. Creates the category in the database.
 * 5. Returns a success response or error if validation, permission, or creation fails.
 *
 * @param _ - Unused parent parameter for GraphQL resolver.
 * @param args - Input arguments containing role categoryId, description, name, parentSubCategoryId and thumbnail.
 * @param context - GraphQL context containing authenticated user information.
 * @returns A promise resolving to a BaseResponseOrError object containing status, message, and errors if applicable.
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

    const { categoryId, description, name, parentSubCategoryId, thumbnail } =
      validationResult.data;

    // Check database for category existence
    const categoryExists = await findCategoryByName(
      name,
      categoryId || parentSubCategoryId ? "subCategory" : "category",
      categoryId ? categoryId : undefined,
      parentSubCategoryId ? parentSubCategoryId : undefined
    );

    if (categoryExists) {
      return {
        statusCode: 400,
        success: false,
        message:
          categoryId || parentSubCategoryId
            ? "Subcategory with this name already exists in parent"
            : "Category with this name already exists",
        __typename: "BaseResponse",
      };
    }

    // Validate parent category if categoryId is provided
    let parentCategoryExist;

    if (categoryId) {
      // Check database for category existence
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
      // Check database for category existence
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
      },
      user.id
    );

    const isSubCategory = categoryId || parentSubCategoryId;

    // Construct the response object
    let categoryResponse: any;
    if (!isSubCategory) {
      // Top-level category
      categoryResponse = {
        id: categoryResult.id,
        name: categoryResult.name,
        description: categoryResult.description,
        thumbnail: categoryResult.thumbnail,
        position: categoryResult.position,
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
        description: categoryResult.description,
        thumbnail: categoryResult.thumbnail,
        position: categoryResult.position,
        category: categoryId ? categoryId : subParentCategoryExist.category,
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
