/**
 * Exports category-related schemas for category management.
 *
 * Workflow:
 * 1. Provides schemas for creating, and updating categories.
 */
export {
  createCategorySchema,
  updateCategorySchema,
} from "./category/category";

/**
 * Exports common schemas for general use.
 *
 * Workflow:
 * 1. Provides schemas for UUID validation, pagination, sorting.
 */
export {
  idSchema,
  idsSchema,
  paginationSchema,
  skipTrashSchema,
} from "./common/common";
