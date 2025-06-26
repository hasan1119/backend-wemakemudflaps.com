import CONFIG from "../../../config/config";
import { Context } from "../../../context";
import { Category } from "../../../entities";
import {
  BaseResponseOrError,
  MutationDeleteCategoryArgs,
  SubCategory,
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
} from "../../service";

/**
 * GraphQL Mutation Resolver to delete a category or subcategory.
 *
 * Workflow:
 * 1. Authenticates the user and checks for delete permissions.
 * 2. Validates input arguments using Zod schema.
 * 3. Retrieves the category or subcategory by ID and ensures it exists.
 * 4. Verifies the entity has no associated products (for safe deletion).
 * 5. Performs a soft delete (move to trash) or hard delete (permanent) based on `skipTrash`.
 * 6. If subcategory, ensures position realignment within its parent scope.
 *
 * Notes:
 * - For subcategories, the function determines whether it's nested under a parent subcategory or directly under a category.
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

    // Check database for category existence
    const categoryExist =
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

    if (skipTrash) {
      await hardDeleteCategoryOrSubCategory(id, categoryType, {
        categoryId,
        parentSubCategoryId,
      });

      return {
        statusCode: 200,
        success: true,
        message: `${
          categoryType.charAt(0).toUpperCase() + categoryType.slice(1)
        } permanently deleted successfully`,
        __typename: "BaseResponse",
      };
    } else {
      // Soft delete
      await softDeleteCategoryOrSubCategory(id, categoryType);
      return {
        statusCode: 200,
        success: true,
        message: `${
          categoryType.charAt(0).toUpperCase() + categoryType.slice(1)
        } moved to trash successfully`,
        __typename: "BaseResponse",
      };
    }
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
