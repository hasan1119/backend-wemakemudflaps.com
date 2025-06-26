import { createCategory, updateCategory } from "../../controllers";
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

    createProduct,
  },
};
