import CONFIG from "../../../config/config";
import { Context } from "../../../context";
import {
  GetCategoryByIdResponseOrError,
  QueryGetCategoryByIdArgs,
} from "../../../types";
import { idSchema } from "../../../utils/data-validation";
import {
  checkUserAuth,
  checkUserPermission,
  getCategoryById as getCategoryByIdService,
} from "../../service";

/**
 * Handles retrieving a category by its ID with validation and permission checks.
 *
 * Workflow:
 * 1. Verifies user authentication and checks permission to view category.
 * 2. Validates input category ID using Zod schema.
 * 3. Fetches category data from the database if not found in Redis and caches it.
 * 4. Returns a success response with category data and user count or an error if validation, permission, or retrieval fails.
 *
 * @param _ - Unused parent parameter for GraphQL resolver.
 * @param args - Input arguments containing the category ID.
 * @param context - GraphQL context containing authenticated user information.
 * @returns A promise resolving to a GetCategoryByIdResponseOrError object containing status, message, category data, and errors if applicable.
 */
export const getCategoryById = async (
  _: any,
  args: QueryGetCategoryByIdArgs,
  { user }: Context
): Promise<GetCategoryByIdResponseOrError> => {
  try {
    // Verify user authentication
    const authResponse = checkUserAuth(user);
    if (authResponse) return authResponse;

    // Check if user has permission to view category
    const canRead = await checkUserPermission({
      action: "canRead",
      entity: "category",
      user,
    });

    if (!canRead) {
      return {
        statusCode: 403,
        success: false,
        message: "You do not have permission to view category info",
        __typename: "BaseResponse",
      };
    }

    // Validate input data with Zod schema
    const validationResult = await idSchema.safeParseAsync(args);

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

    const { id } = args;

    const category = await getCategoryByIdService(id);

    if (!category) {
      return {
        statusCode: 404,
        success: false,
        message: "Category not found",
        __typename: "BaseResponse",
      };
    }

    return {
      statusCode: 200,
      success: true,
      message: "Category fetched successfully",
      category: {
        ...category,
        subCategories: category.subCategories
          ? category.subCategories.map((subCat: any) => ({
              ...subCat,
              createdBy: category.createdBy as any,
              category: undefined,
            }))
          : null,
        createdBy: category.createdBy as any,
        createdAt:
          category.createdAt instanceof Date
            ? category.createdAt.toISOString()
            : category.createdAt,
        deletedAt:
          category.deletedAt instanceof Date
            ? category.deletedAt.toISOString()
            : category.deletedAt,
      },
      __typename: "CategoryResponseById",
    };
  } catch (error: any) {
    console.error("Error retrieving category:", {
      message: error.message,
    });

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
