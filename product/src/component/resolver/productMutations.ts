import {
  createCategory,
  createTag,
  deleteCategory,
  deleteTag,
  restoreCategory,
  restoreTags,
  updateCategory,
  updateCategoryPosition,
  updateTag,
} from "../../controllers";
import { createProduct } from "../../controllers/mutations/manage-product/create-product";

/**
 * Defines GraphQL mutation resolvers for product-related operations.
 *
 * Workflow:
 * 1. Maps mutation fields to controller functions for product management.
 * 2. Handles product file create, updates, deletions, and restorations.
 * 3. Ensures efficient product file lifecycle management through structured mutations.
 */
export const productMutationsResolver = {
  Mutation: {
    /**
     * Creates a new category/sub category.
     */
    createCategory,

    /**
     * Updates detailed information for a specific category/sub category.
     */
    updateCategory,

    /**
     * Update a specific category/sub category position.
     */
    updateCategoryPosition,

    /**
     * Deletes specified category from the system.
     */
    deleteCategory,

    /**
     * Restores previously deleted category
     */
    restoreCategory,

    /**
     * Creates a new tag.
     */
    createTag,

    /**
     * Updates detailed information for a specific tag.
     */
    updateTag,

    /**
     * Deletes specified tag from the system.
     */
    deleteTag,

    /**
     * Restores previously deleted category
     */
    restoreTags,

    createProduct,
  },
};
