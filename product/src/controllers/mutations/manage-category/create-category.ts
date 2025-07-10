import CONFIG from "../../../config/config";
import { Context } from "../../../context";
import { Category as CategoryEntity } from "../../../entities";
import {
  Category as CategoryGql,
  MutationCreateCategoryArgs,
} from "../../../types"; // Your GraphQL types
import { createCategorySchema } from "../../../utils/data-validation";
import {
  checkUserAuth,
  checkUserPermission,
  createCategoryOrSubCategory,
  findCategoryByNameOrSlug,
  getCategoryById,
} from "../../services";

/** Helper to check if value is Date */
function isDate(value: any): value is Date {
  return Object.prototype.toString.call(value) === "[object Date]";
}

/**
 * Recursively maps a TypeORM Category entity to GraphQL-friendly Category type,
 * converting Date fields to ISO strings and mapping nested relations.
 *
 * @param categoryEntity TypeORM Category entity or null
 * @returns GraphQL Category type or null
 */
function mapCategoryEntityToGql(
  categoryEntity: CategoryEntity | null
): CategoryGql | null {
  if (!categoryEntity) return null;

  const hasValidParent =
    categoryEntity.parentCategory &&
    categoryEntity.parentCategory.name != null &&
    categoryEntity.parentCategory.slug != null;

  return {
    ...categoryEntity,
    createdAt: isDate(categoryEntity.createdAt)
      ? categoryEntity.createdAt.toISOString()
      : categoryEntity.createdAt,
    deletedAt: isDate(categoryEntity.deletedAt)
      ? categoryEntity.deletedAt.toISOString()
      : categoryEntity.deletedAt,
    parentCategory: hasValidParent
      ? mapCategoryEntityToGql(categoryEntity.parentCategory)
      : null,
    subCategories: (categoryEntity.subCategories ?? []).map(
      mapCategoryEntityToGql
    ),
    // Map createdBy and thumbnail if needed (cast to any if necessary)
    createdBy: categoryEntity.createdBy as any,
    thumbnail: categoryEntity.thumbnail as any,
  };
}

/**
 * GraphQL resolver to create a new category or subcategory.
 *
 * Workflow:
 * 1. Verify user authentication.
 * 2. Check if user has permission to create categories.
 * 3. Validate inputs using Zod schema.
 * 4. Check if a category with the same name or slug exists under the same parent.
 * 5. Validate existence of parent category if `parentCategoryId` is provided.
 * 6. Create the category.
 * 7. Return success response with created category data.
 *
 * @param _ - Unused parent parameter for GraphQL resolver.
 * @param args - Arguments containing category creation fields.
 * @param context - GraphQL context containing authenticated user.
 * @returns Promise resolving to a CreateCategoryResponseOrError.
 */
export const createCategory = async (
  _: any,
  args: MutationCreateCategoryArgs,
  { user }: Context
): Promise<any> => {
  try {
    // Verify user authentication
    const authResponse = checkUserAuth(user);
    if (authResponse) return authResponse;

    // Check user permission
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

    // Validate input using Zod schema
    const validationResult = await createCategorySchema.safeParseAsync(args);
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

    // Destructure validated input
    const { parentCategoryId, description, name, thumbnail, slug } =
      validationResult.data;

    // Check if category with same name or slug exists under the same parent
    const categoryExists = await findCategoryByNameOrSlug(
      name,
      slug,
      parentCategoryId || null
    );

    if (categoryExists) {
      return {
        statusCode: 400,
        success: false,
        message: parentCategoryId
          ? "Subcategory with this name or slug already exists in the parent category"
          : "Category with this name or slug already exists",
        __typename: "BaseResponse",
      };
    }

    // Validate parent category existence if provided
    let parentCategoryExist: CategoryEntity | null = null;
    if (parentCategoryId) {
      parentCategoryExist = await getCategoryById(parentCategoryId);
      if (!parentCategoryExist) {
        return {
          statusCode: 404,
          success: false,
          message: "Parent category not found",
          __typename: "BaseResponse",
        };
      }
    }
    // Create category or subcategory
    const categoryResult = await createCategoryOrSubCategory(
      {
        parentCategoryId,
        description,
        name,
        thumbnail,
        slug,
      },
      user.id
    );

    // Fetch the full category including relations
    const fullCategory = await getCategoryById(categoryResult.id);

    // If parentCategoryExist was already fetched,
    // replace the parentCategory in fullCategory with it to avoid re-fetch or partial data
    if (parentCategoryExist && fullCategory) {
      fullCategory.parentCategory = parentCategoryExist;
    }

    const categoryResponse = mapCategoryEntityToGql(fullCategory);

    return {
      statusCode: 201,
      success: true,
      message: parentCategoryId
        ? "Subcategory created successfully"
        : "Category created successfully",
      category: categoryResponse,
      __typename: "CategoryResponse",
    };
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
