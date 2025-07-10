import { Context } from "../../../context";
import {
  MutationUpdateCategoryPositionArgs,
  UpdateCategoryPositionResponseOrError,
} from "../../../types";

/**
 * Handles updating an existing category position with validation and permission checks.
 *
 * Workflow:
 * 1. Verifies user authentication and retrieves user data from Redis.
 * 2. Checks user permission to update roles.
 * 3. Validates input (role ID, position) using Zod schema.
 * 4. Retrieves category data from database and ensures it exists and is not soft-deleted.
 * 5. Updates category position in the database with audit details.
 * 6. Returns a success response or error if validation, permission, or update fails.
 *
 * @param _ - Unused parent parameter for GraphQL resolver.
 * @param args - Input arguments containing role ID, name, description, permissions, protection flags, and optional password.
 * @param context - GraphQL context containing authenticated user information.
 * @returns A promise resolving to a BaseResponseOrError object containing status, message, and errors if applicable.
 */
export const updateCategoryPosition = async (
  _: any,
  args: MutationUpdateCategoryPositionArgs,
  { user }: Context
): Promise<UpdateCategoryPositionResponseOrError> => {
  // try {
  //   // Verify user authentication
  //   const authResponse = checkUserAuth(user);
  //   if (authResponse) return authResponse;
  //   // Check if user has permission to update roles
  //   const canUpdate = await checkUserPermission({
  //     action: "canUpdate",
  //     entity: "category",
  //     user,
  //   });
  //   if (!canUpdate) {
  //     return {
  //       statusCode: 403,
  //       success: false,
  //       message: "You do not have permission to update any category info",
  //       __typename: "BaseResponse",
  //     };
  //   }
  //   // Validate input data with Zod schema
  //   const validationResult = await updateCategoryPositionSchema.safeParseAsync(
  //     args
  //   );
  //   // Return detailed validation errors if input is invalid
  //   if (!validationResult.success) {
  //     const errors = validationResult.error.errors.map((e) => ({
  //       field: e.path.join("."), // Join path array to string for field identification
  //       message: e.message,
  //     }));
  //     return {
  //       statusCode: 400,
  //       success: false,
  //       message: "Validation failed",
  //       errors,
  //       __typename: "ErrorResponse",
  //     };
  //   }
  //   const { id, position, categoryType } = validationResult.data;
  //   // Check database for category existence
  //   const categoryExist =
  //     categoryType === "category"
  //       ? await getCategoryById(id)
  //       : await getSubCategoryById(id);
  //   if (!categoryExist) {
  //     return {
  //       statusCode: 404,
  //       success: false,
  //       message: "Category not found",
  //       __typename: "BaseResponse",
  //     };
  //   }
  //   function isSubCategory(obj: Category | SubCategory): obj is SubCategory {
  //     return "category" in obj;
  //   }
  //   let categoryId: string | undefined = undefined;
  //   let parentSubCategoryId: string | undefined = undefined;
  //   if (categoryType !== "category" && isSubCategory(categoryExist)) {
  //     const resolvedCategory = await categoryExist.category;
  //     categoryId = resolvedCategory?.id;
  //     if (categoryExist.parentSubCategory) {
  //       parentSubCategoryId = categoryExist.parentSubCategory.id;
  //     }
  //   }
  //   // Update role information in the database
  //   try {
  //     await updatePosition(
  //       id,
  //       position,
  //       categoryType === "category" ? "category" : "subCategory",
  //       {
  //         categoryId,
  //         parentSubCategoryId,
  //       }
  //     );
  //   } catch (err: any) {
  //     return {
  //       statusCode: 400,
  //       success: false,
  //       message: err.message || "Failed to update position",
  //       __typename: "BaseResponse",
  //     };
  //   }
  //   if (categoryType !== "category") {
  //     return {
  //       statusCode: 201,
  //       success: true,
  //       message: "Subcategory position updated successfully",
  //       subcategory: {
  //         id: id,
  //         name: categoryExist.name,
  //         slug: categoryExist.slug,
  //         description: categoryExist.description,
  //         thumbnail: categoryExist.thumbnail as any,
  //         position: position,
  //         category: categoryId,
  //         parentSubCategory: parentSubCategoryId,
  //         createdBy: categoryExist.createdBy as any,
  //         subCategories: categoryExist.subCategories
  //           ? categoryExist.subCategories.map((subCat: any) => ({
  //               ...subCat,
  //               category: undefined,
  //             }))
  //           : null,
  //         createdAt:
  //           categoryExist.createdAt instanceof Date
  //             ? categoryExist.createdAt.toISOString()
  //             : categoryExist.createdAt,
  //         deletedAt:
  //           categoryExist.deletedAt instanceof Date
  //             ? categoryExist.deletedAt.toISOString()
  //             : categoryExist.deletedAt,
  //       },
  //       __typename: "SubCategoryResponse",
  //     };
  //   } else {
  //     return {
  //       statusCode: 201,
  //       success: true,
  //       message: "Category position updated successfully",
  //       category: {
  //         id: categoryExist.id,
  //         name: categoryExist.name,
  //         slug: categoryExist.slug,
  //         description: categoryExist.description,
  //         thumbnail: categoryExist.thumbnail as any,
  //         position: position,
  //         createdBy: categoryExist.createdBy as any,
  //         createdAt:
  //           categoryExist.createdAt instanceof Date
  //             ? categoryExist.createdAt.toISOString()
  //             : categoryExist.createdAt,
  //         deletedAt:
  //           categoryExist.deletedAt instanceof Date
  //             ? categoryExist.deletedAt.toISOString()
  //             : categoryExist.deletedAt,
  //       },
  //       __typename: "CategoryResponse",
  //     };
  //   }
  // } catch (error: any) {
  //   console.error("Error updating category info:", error);
  //   return {
  //     statusCode: 500,
  //     success: false,
  //     message: `${
  //       CONFIG.NODE_ENV === "production"
  //         ? "Something went wrong, please try again."
  //         : error.message || "Internal server error"
  //     }`,
  //     __typename: "BaseResponse",
  //   };
  // }
};
