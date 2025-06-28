/**
 * Exports service for verifying user authentication status.
 *
 * Workflow:
 * 1. Provides a function to check if a user is authenticated.
 */
export { checkUserAuth } from "./session-check/session-check";

/**
 * Exports services for managing permissions for media access.
 *
 * Workflow:
 * 1. Provides a function to check if a user has permission to access media.
 */
export { checkUserPermission } from "./permission/get-user-permission.service";

/**
 * Exports services for creating categories and subcategories.
 *
 * Workflow:
 * 1. Provides a function to create either a Category or SubCategory based on input.
 * 2. Handles nested subcategory creation and position ordering.
 */
export { createCategoryOrSubCategory } from "./category/create-category.service";

/**
 * Exports services for deleting categories and subcategories.
 *
 * Workflow:
 * 1. Provides functions for soft deleting (skip to trash) and hard deleting entities.
 * 2. Handles position reordering after deletion.
 * 3. Checks for product associations before allowing deletion.
 */
export {
  canDeleteCategoryOrSubCategory,
  hardDeleteCategoryOrSubCategory,
  softDeleteCategoryOrSubCategory,
} from "./category/delete-category.service";

/**
 * Exports services for fetching and counting categories and subcategories.
 *
 * Workflow:
 * 1. Provides counting of categories matching optional search criteria.
 * 2. Provides functions to fetch category or subcategory by ID/name with relations.
 * 3. Supports paginated retrieval of categories including their subcategories.
 */
export {
  countCategoriesWithSearch,
  findCategoryByName,
  findCategoryByNameToUpdateScoped,
  getCategoryById,
  getSubCategoryById,
  paginateCategories,
} from "./category/get-category.service";

/**
 * Exports service for restoring soft-deleted categories and subcategories by ID.
 *
 * Workflow:
 * 1. Allows restoring entities by clearing their deletedAt timestamp.
 * 2. Automatically detects whether the entity is category or subcategory.
 */
export { restoreCategoryOrSubCategoryById } from "./category/restore-category.service";

/**
 * Exports services for updating categories and subcategories.
 *
 * Workflow:
 * 1. Provides functions to update basic fields (name, description, thumbnail).
 * 2. Handles updating position/order of categories or subcategories.
 */
export {
  updateCategoryOrSubCategory,
  updatePosition,
} from "./category/update-category.service";

/**
 * Exports services for creating tag.
 *
 * Workflow:
 * 1. Provides a function to create either a tag based on input.
 */
export { createTag } from "./tag/create-tag.service";

/**
 * Exports services for deleting tags.
 *
 * Workflow:
 * 1. Provides functions for soft deleting (skip to trash) and hard deleting entities.
 */
export { hardDeleteTag, softDeleteTag } from "./tag/delete-tag.service";

/**
 * Exports services for fetching and counting tags.
 *
 * Workflow:
 * 1. Provides counting of tags matching optional search criteria.
 * 2. Provides functions to fetch tag by ID/name with relations.
 * 3. Supports paginated retrieval of tags.
 */
export {
  countProductsForTag,
  countTagsWithSearch,
  findTagByName,
  findTagByNameToUpdate,
  findTagBySlug,
  findTagBySlugToUpdate,
  getTagById,
  getTagsByIds,
  paginateTags,
} from "./tag/get-tag.service";

/**
 * Exports service for restoring soft-deleted tags by ID.
 *
 * Workflow:
 * 1. Allows restoring entities by clearing their deletedAt timestamp.
 */
export { restoreTag } from "./tag/restore-tag.service";

/**
 * Exports services for updating categories and subcategories.
 *
 * Workflow:
 * 1. Provides functions to update basic fields (name, slug).
 */
export { updateTag } from "./tag/update-tag.service";

/**
 * Exports services for creating brand.
 *
 * Workflow:
 * 1. Provides a function to create either a brand based on input.
 */
export { createBrand } from "./brand/create-brand.service";

/**
 * Exports services for deleting brands.
 *
 * Workflow:
 * 1. Provides functions for soft deleting (skip to trash) and hard deleting entities.
 */
export { hardDeleteBrand, softDeleteBrand } from "./brand/delete-brand.service";

/**
 * Exports services for fetching and counting brands.
 *
 * Workflow:
 * 1. Provides counting of brands matching optional search criteria.
 * 2. Provides functions to fetch brand by ID/name with relations.
 * 3. Supports paginated retrieval of brands.
 */
export {
  countBrandsWithSearch,
  countProductsForBrand,
  findBrandByName,
  findBrandByNameToUpdate,
  findBrandBySlug,
  findBrandBySlugToUpdate,
  getBrandById,
  getBrandsByIds,
  paginateBrands,
} from "./brand/get-brand.service";

/**
 * Exports service for restoring soft-deleted brands by ID.
 *
 * Workflow:
 * 1. Allows restoring entities by clearing their deletedAt timestamp.
 */
export { restoreBrand } from "./brand/restore-brand.service";

/**
 * Exports services for updating categories and subcategories.
 *
 * Workflow:
 * 1. Provides functions to update basic fields (name, slug).
 */
export { updateBrand } from "./brand/update-brand.service";
