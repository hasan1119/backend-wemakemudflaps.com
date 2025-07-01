import CONFIG from "../../../config/config";
import { Context } from "../../../context";
import {
  getSubCategoryInfoByIdFromRedis,
  setSubCategoryInfoByIdInRedis,
} from "../../../helper/redis";
import {
  GetSubCategoryByIdResponseOrError,
  QueryGetCategoryByIdArgs,
} from "../../../types";
import { idSchema } from "../../../utils/data-validation";
import {
  checkUserAuth,
  checkUserPermission,
  getSubCategoryById as getSubCategoryByIdService,
} from "../../services";

/**
 * Handles retrieving a sub category by its ID with validation and permission checks.
 *
 * Workflow:
 * 1. Verifies user authentication and checks permission to view category.
 * 2. Validates input sub category ID using Zod schema.
 * 3. Fetches sub category data from the database if not found in Redis and caches it.
 * 4. Returns a success response with sub category data or an error if validation, permission, or retrieval fails.
 *
 * @param _ - Unused parent parameter for GraphQL resolver.
 * @param args - Input arguments containing the category ID.
 * @param context - GraphQL context containing authenticated user information.
 * @returns A promise resolving to a GetSubCategoryByIdResponseOrError object containing status, message, sub category data, and errors if applicable.
 */
export const getSubCategoryById = async (
  _: any,
  args: QueryGetCategoryByIdArgs,
  { user }: Context
): Promise<GetSubCategoryByIdResponseOrError> => {
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
        message: "You do not have permission to view sub category info",
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

    // Attempt to retrieve cached category data from Redis
    let subCategoryExist;

    subCategoryExist = await getSubCategoryInfoByIdFromRedis(id);

    if (!subCategoryExist) {
      const dbSubCategoryExist = await getSubCategoryByIdService(id);

      if (!dbSubCategoryExist) {
        return {
          statusCode: 404,
          success: false,
          message: "Category not found",
          __typename: "BaseResponse",
        };
      }
      subCategoryExist = {
        ...dbSubCategoryExist,
        subCategories: dbSubCategoryExist.subCategories
          ? dbSubCategoryExist.subCategories.map((subCat: any) => ({
              ...subCat,
              createdBy: dbSubCategoryExist.createdBy as any,
              category: undefined,
            }))
          : null,
        category:
          dbSubCategoryExist.category &&
          typeof dbSubCategoryExist.category === "object"
            ? (await dbSubCategoryExist.category)?.id ?? null
            : null,
        parentSubCategory:
          dbSubCategoryExist.parentSubCategory &&
          typeof dbSubCategoryExist.parentSubCategory === "object"
            ? (await dbSubCategoryExist.parentSubCategory)?.id ?? null
            : null,
        createdBy: dbSubCategoryExist.createdBy as any,
        createdAt:
          dbSubCategoryExist.createdAt instanceof Date
            ? dbSubCategoryExist.createdAt.toISOString()
            : dbSubCategoryExist.createdAt,
        deletedAt:
          dbSubCategoryExist.deletedAt instanceof Date
            ? dbSubCategoryExist.deletedAt.toISOString()
            : dbSubCategoryExist.deletedAt,
      };

      // Cache sub category data in Redis
      await setSubCategoryInfoByIdInRedis(
        subCategoryExist.id,
        subCategoryExist
      );
    }

    return {
      statusCode: 200,
      success: true,
      message: "Sub Category fetched successfully",
      subcategory: subCategoryExist,
      __typename: "SubCategoryResponseById",
    };
  } catch (error: any) {
    console.error("Error retrieving sub category:", {
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
