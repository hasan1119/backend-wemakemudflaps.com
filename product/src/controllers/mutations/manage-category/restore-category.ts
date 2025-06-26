import CONFIG from "../../../config/config";
import { Context } from "../../../context";
import {
  MutationRestoreCategoryArgs,
  RestoreCategoryResponseOrError,
} from "../../../types";
import { restoreCategorySchema } from "../../../utils/data-validation";
import {
  checkUserAuth,
  checkUserPermission,
  restoreCategoryOrSubCategoryById,
} from "../../service";

export const restoreCategory = async (
  _: any,
  args: MutationRestoreCategoryArgs,
  { user }: Context
): Promise<RestoreCategoryResponseOrError> => {
  try {
    const authResponse = checkUserAuth(user);
    if (authResponse) return authResponse;

    const canRestore = await checkUserPermission({
      action: "canUpdate",
      entity: "category",
      user,
    });

    if (!canRestore) {
      return {
        statusCode: 403,
        success: false,
        message: "You do not have permission to restore categories",
        __typename: "BaseResponse",
      };
    }

    const parsed = restoreCategorySchema.safeParse(args);

    if (!parsed.success) {
      const errors = parsed.error.errors.map((e) => ({
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

    const { id, categoryType } = parsed.data;

    // Map "subCategory" to "subcategory" to match the expected type
    const normalizedCategoryType =
      categoryType === "subCategory" ? "subcategory" : categoryType;

    await restoreCategoryOrSubCategoryById(id, normalizedCategoryType);

    return {
      statusCode: 200,
      success: true,
      message: `${
        categoryType === "category" ? "Category" : "Subcategory"
      } restored successfully`,
      __typename: "BaseResponse",
    };
  } catch (error: any) {
    console.error("Restore category error:", error);
    return {
      statusCode: 500,
      success: false,
      message:
        CONFIG.NODE_ENV === "production"
          ? "Something went wrong. Please try again."
          : error.message || "Internal server error",
      __typename: "ErrorResponse",
    };
  }
};
