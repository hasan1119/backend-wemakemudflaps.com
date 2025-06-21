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
  hardDeleteCategoryOrSubCategory,
  softDeleteCategoryOrSubCategory,
} from "./category/delete-category.service";

/**
 * Exports services for fetching and counting categories and subcategories.
 *
 * Workflow:
 * 1. Provides counting of categories matching optional search criteria.
 * 2. Provides functions to fetch category or subcategory by ID with relations.
 * 3. Supports paginated retrieval of categories including their subcategories.
 */
export {
  countCategoriesWithSearch,
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
