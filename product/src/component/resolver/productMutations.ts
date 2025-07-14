import {
  createBrand,
  createCategory,
  createProduct,
  createShippingClass,
  createShippingMethod,
  createShippingZone,
  createTag,
  createTaxClass,
  createTaxRate,
  deleteBrand,
  deleteCategory,
  deleteProduct,
  deleteShippingClass,
  deleteShippingZone,
  deleteTag,
  deleteTaxClass,
  deleteTaxRate,
  restoreBrands,
  restoreCategory,
  restoreProducts,
  restoreShippingClasses,
  restoreTags,
  restoreTaxClasses,
  restoreTaxRates,
  updateBrand,
  updateCategory,
  updateCategoryPosition,
  updateProduct,
  updateShippingClass,
  updateTag,
  updateTaxClass,
  updateTaxRate,
} from "../../controllers";

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
     * Restores previously deleted category.
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
     * Restores previously deleted category.
     */
    restoreTags,

    /**
     * Creates a new brand.
     */
    createBrand,

    /**
     * Updates detailed information for a specific brand.
     */
    updateBrand,

    /**
     * Deletes specified brand from the system.
     */
    deleteBrand,

    /**
     * Restores previously deleted brand.
     */
    restoreBrands,

    /**
     * Creates a new shipping class.
     */
    createShippingClass,
    /**
     * Updates detailed information for a specific shipping class .
     */
    updateShippingClass,

    /**
     * Deletes specified shipping class from the system.
     */
    deleteShippingClass,

    /**
     * Restores previously deleted shipping class.
     */
    restoreShippingClasses,

    /**
     * Creates a new tax class.
     */
    createTaxClass,

    /**
     * Updates detailed information for a specific tax class .
     */
    updateTaxClass,

    /**
     * Deletes specified tax class from the system.
     */
    deleteTaxClass,

    /**
     * Restores previously deleted tax class.
     */
    restoreTaxClasses,

    /**
     * Creates a product.
     */
    createProduct,

    /**
     * Updates detailed information for a specific product.
     */
    updateProduct,

    /**
     * Deletes specified product from the system.
     */
    deleteProduct,

    /**
     * Restores previously deleted product.
     */
    restoreProducts,

    /**
     * Creates a new tax rate.
     */
    createTaxRate,

    /**
     * Updates detailed information for a specific tax rate .
     */
    updateTaxRate,

    /**
     * Deletes specified tax rate from the system.
     */
    deleteTaxRate,

    /**
     * Restores previously deleted tax class.
     */
    restoreTaxRates,

    /**
     * Creates a new shipping method.
     */
    createShippingMethod,

    /**
     * Creates a new shipping zone.
     */
    createShippingZone,

    /**
     * Deletes specified shipping zone from the system.
     */
    deleteShippingZone,
  },
};
