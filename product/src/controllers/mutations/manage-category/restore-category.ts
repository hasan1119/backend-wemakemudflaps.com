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
} from "../../services";

/**
 * GraphQL Mutation Resolver to restore a soft-deleted category or subcategory.
 *
 * Workflow:
 * 1. Verifies user authentication and authorization to perform update operations.
 * 2. Validates the input arguments using Zod schema.
 * 3. Normalizes `categoryType` to match service expectations (e.g., converts "subCategory" to "subcategory").
 * 4. Invokes the service function to restore the soft-deleted entity by clearing `deletedAt`.
 * 5. Returns a success message on successful restoration, or error response if any failure occurs.
 *
 * Notes:
 * - This handles both `category` and `subcategory` restoration using the same resolver.
 * - A permission check for `canUpdate` is used since restore is a form of update.
 *
 * @param _ - Unused resolver root parameter.
 * @param args - Input arguments including ID of the entity to restore and its category type.
 * @param context - GraphQL context containing authenticated user information.
 * @returns A `RestoreCategoryResponseOrError` indicating operation success or failure details.
 */
export const restoreCategory = async (
  _: any,
  args: MutationRestoreCategoryArgs,
  { user }: Context
): Promise<RestoreCategoryResponseOrError> => {
  try {
    // Verify user authentication
    const authResponse = checkUserAuth(user);
    if (authResponse) return authResponse;

    // Check if user has permission to restore a category
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

    // Validate input data with Zod schema
    const parsed = restoreCategorySchema.safeParse(args);

    // Return detailed validation errors if input is invalid
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

    const { ids, categoryType } = parsed.data;

    // Map "subCategory" to "subcategory" to match the expected type
    const normalizedCategoryType =
      categoryType === "subCategory" ? "subcategory" : categoryType;

    await restoreCategoryOrSubCategoryById(ids, normalizedCategoryType);

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

// import CONFIG from "../../../config/config";
// import { Context } from "../../../context";
// import { Category, SubCategory } from "../../../entities";
// import {
//   clearAllCategorySearchCache,
//   getCategoryInfoByIdFromRedis,
//   getSubCategoryInfoByIdFromRedis,
//   setCategoryInfoByIdInRedis,
//   setCategoryNameExistInRedis,
//   setCategorySlugExistInRedis,
//   setSubCategoryInfoByIdInRedis,
//   setSubCategoryNameExistInRedis,
//   setSubCategorySlugExistInRedis,
// } from "../../../helper/redis";
// import {
//   MutationRestoreCategoryArgs,
//   RestoreCategoryResponseOrError,
// } from "../../../types";
// import { restoreCategorySchema } from "../../../utils/data-validation";
// import {
//   checkUserAuth,
//   checkUserPermission,
//   getCategoryByIds,
//   getSubCategoryByIds,
//   restoreCategoryOrSubCategoryById,
// } from "../../services";

// /**
//  * GraphQL Mutation Resolver to restore soft-deleted categories or subcategories with Redis caching.
//  *
//  * Workflow:
//  * 1. Verifies user authentication and permission to restore categories.
//  * 2. Validates input (ids, categoryType) using Zod schema.
//  * 3. Attempts to retrieve category/subcategory data from Redis.
//  * 4. Fetches missing data from the database if not found in Redis.
//  * 5. Ensures all entities are soft-deleted before restoration.
//  * 6. Restores entities in the database by clearing `deletedAt`.
//  * 7. Updates Redis cache with restored data and sets name/slug existence.
//  * 8. Clears the category search cache.
//  * 9. Returns a success response or error if validation, permission, or restoration fails.
//  *
//  * Notes:
//  * - Handles both `category` and `subCategory` types via a shared resolver.
//  * - Supports multiple IDs for batch restoration.
//  *
//  * @param _ - Unused resolver root parameter.
//  * @param args - Input arguments: ids (array of UUIDs), categoryType ("category" or "subCategory").
//  * @param context - GraphQL context with authenticated user info.
//  * @returns A `RestoreCategoryResponseOrError` indicating success or detailed error info.
//  */
// export const restoreCategory = async (
//   _: any,
//   args: MutationRestoreCategoryArgs,
//   { user }: Context
// ): Promise<RestoreCategoryResponseOrError> => {
//   try {
//     // Verify user authentication
//     const authResponse = checkUserAuth(user);
//     if (authResponse) return authResponse;

//     // Check if user has permission to restore categories
//     const canRestore = await checkUserPermission({
//       action: "canUpdate",
//       entity: "category",
//       user,
//     });

//     if (!canRestore) {
//       return {
//         statusCode: 403,
//         success: false,
//         message: "You do not have permission to restore categories",
//         __typename: "BaseResponse",
//       };
//     }

//     // Validate input data with Zod schema
//     const parsed = await restoreCategorySchema.safeParseAsync(args);

//     // Return detailed validation errors if input is invalid
//     if (!parsed.success) {
//       const errors = parsed.error.errors.map((e) => ({
//         field: e.path.join("."),
//         message: e.message,
//       }));

//       return {
//         statusCode: 400,
//         success: false,
//         message: "Validation failed",
//         errors,
//         __typename: "ErrorResponse",
//       };
//     }

//     const { ids, categoryType } = parsed.data;

//     // Map "subCategory" to "subcategory" to match the expected type
//     const normalizedCategoryType =
//       categoryType === "subCategory" ? "subcategory" : categoryType;

//     // Attempt Redis fetch
//     const cachedEntities = await Promise.all(
//       ids.map((id) =>
//         normalizedCategoryType === "category"
//           ? getCategoryInfoByIdFromRedis(id)
//           : getSubCategoryInfoByIdFromRedis(id)
//       )
//     );

//     const foundEntities: (Category | SubCategory)[] = [];
//     const missingIds: string[] = [];

//     cachedEntities.forEach((entity, index) => {
//       // Only push if entity is an instance of Category or SubCategory
//       if (
//         entity &&
//         (entity instanceof Category || entity instanceof SubCategory)
//       ) {
//         foundEntities.push(entity);
//       } else {
//         missingIds.push(ids[index]);
//       }
//     });

//     // Fetch missing entities from the database
//     if (missingIds.length > 0) {
//       const dbEntities =
//         normalizedCategoryType === "category"
//           ? await getCategoryByIds(missingIds)
//           : await getSubCategoryByIds(missingIds);

//       if (dbEntities.length !== missingIds.length) {
//         const dbFoundIds = new Set(dbEntities.map((r) => r.id));
//         const notFoundEntities = missingIds
//           .filter((id) => !dbFoundIds.has(id))
//           .map((id) => id);

//         const notFoundNames = dbEntities
//           .filter((entity) => notFoundEntities.includes(entity.id))
//           .map((entity) => entity.name)
//           .concat(notFoundEntities.map(() => '"Unknown"'));

//         return {
//           statusCode: 404,
//           success: false,
//           message: `${
//             normalizedCategoryType === "category"
//               ? "Categories"
//               : "Subcategories"
//           } with names: ${notFoundNames.join(", ")} not found`,
//           __typename: "BaseResponse",
//         };
//       }
//       foundEntities.push(...dbEntities);
//     }

//     // Check all entities are soft-deleted
//     const notDeleted = foundEntities.filter((entity) => !entity.deletedAt);
//     if (notDeleted.length > 0) {
//       return {
//         statusCode: 400,
//         success: false,
//         message: `${
//           normalizedCategoryType === "category" ? "Categories" : "Subcategories"
//         } with IDs ${notDeleted
//           .map((r) => r.id)
//           .join(", ")} are not in the trash`,
//         __typename: "BaseResponse",
//       };
//     }

//     // Restore entities
//     const restored = await restoreCategoryOrSubCategoryById(
//       ids,
//       normalizedCategoryType
//     );

//     // Construct response objects and update Redis
//     const redisUpdates = restored.map(async (entity) => {
//       function isSubCategory(obj: Category | SubCategory): obj is SubCategory {
//         return "category" in obj;
//       }

//       let categoryId: string | undefined = undefined;
//       let parentSubCategoryId: string | undefined = undefined;

//       if (normalizedCategoryType !== "category" && isSubCategory(entity)) {
//         const resolvedCategory = await entity.category;
//         categoryId = resolvedCategory?.id;
//         if (entity.parentSubCategory) {
//           parentSubCategoryId = entity.parentSubCategory.id;
//         }
//       }

//       const categoryResponse: any = {
//         id: entity.id,
//         name: entity.name,
//         slug: entity.slug,
//         description: entity.description,
//         thumbnail: entity.thumbnail,
//         position: entity.position,
//         totalProducts: entity?.products?.length ?? 0,
//         createdBy: entity.createdBy as any,
//         createdAt:
//           entity.createdAt instanceof Date
//             ? entity.createdAt.toISOString()
//             : entity.createdAt,
//         deletedAt: null, // Restored, so deletedAt is null
//         ...(normalizedCategoryType !== "category" && {
//           category: categoryId,
//           parentSubCategory: parentSubCategoryId || null,
//         }),
//       };

//       return Promise.all([
//         normalizedCategoryType === "category"
//           ? setCategoryInfoByIdInRedis(entity.id, categoryResponse)
//           : setSubCategoryInfoByIdInRedis(entity.id, categoryResponse),
//         normalizedCategoryType === "category"
//           ? setCategoryNameExistInRedis(entity.name)
//           : setSubCategoryNameExistInRedis(
//               entity.name,
//               categoryId || parentSubCategoryId
//             ),
//         normalizedCategoryType === "category"
//           ? setCategorySlugExistInRedis(entity.slug)
//           : setSubCategorySlugExistInRedis(
//               entity.slug,
//               categoryId || parentSubCategoryId
//             ),
//       ]);
//     });

//     // Execute Redis updates and clear search cache
//     await Promise.all([...redisUpdates, clearAllCategorySearchCache()]);

//     return {
//       statusCode: 200,
//       success: true,
//       message: `${categoryType === "category" ? "Category" : "Subcategory"}${
//         ids.length > 1 ? "ies" : "y"
//       } restored successfully: ${restored.map((r) => r.name).join(", ")}`,
//       __typename: "BaseResponse",
//     };
//   } catch (error: any) {
//     console.error("Restore category error:", error);
//     return {
//       statusCode: 500,
//       success: false,
//       message:
//         CONFIG.NODE_ENV === "production"
//           ? "Something went wrong. Please try again."
//           : error.message || "Internal server error",
//       __typename: "BaseResponse",
//     };
//   }
// };
