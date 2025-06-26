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
 * GraphQL Resolver to delete a category or subcategory (soft or hard)
 */
export const deleteCategory = async (
  _: any,
  args: MutationDeleteCategoryArgs,
  { user }: Context
): Promise<BaseResponseOrError> => {
  try {
    // Auth & permission
    const authResponse = checkUserAuth(user);
    if (authResponse) return authResponse;

    const canDelete = await checkUserPermission({
      action: "canDelete",
      entity: "category",
      user,
    });

    if (!canDelete) {
      return {
        statusCode: 403,
        success: false,
        message: "You do not have permission to delete categories",
        __typename: "BaseResponse",
      };
    }

    // Validate args
    const validationResult = deleteCategorySchema.safeParse(args);
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
