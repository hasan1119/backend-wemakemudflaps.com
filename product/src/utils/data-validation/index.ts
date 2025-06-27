/**
 * Exports category-related schemas for category management.
 *
 * Workflow:
 * 1. Provides schemas for creating, and updating categories.
 */
export {
  createCategorySchema,
  deleteCategorySchema,
  restoreCategorySchema,
  updateCategoryPositionSchema,
  updateCategorySchema,
} from "./category/category";

/**
 * Exports common schemas for general use.
 *
 * Workflow:
 * 1. Provides schemas for UUID validation, pagination, sorting.
 */
export {
  categorySortingSchema,
  idSchema,
  idsSchema,
  paginationSchema,
  skipTrashSchema,
  tagsSortingSchema,
} from "./common/common";

/**
 * Exports tag-related schemas for tag management.
 *
 * Workflow:
 * 1. Provides schemas for creating, and updating tag.
 */
export { createTagSchema } from "./tag/tag";
