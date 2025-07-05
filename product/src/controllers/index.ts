/**
 * Exports GraphQL queries and mutations for managing brand data.
 *
 * Workflow:
 * 1. Provides mutations for creating, updating, deleting, and restoring brands.
 * 2. Enables retrieval of a specific brand by its ID.
 * 3. Facilitates listing all tags in the system.
 */
export { createBrand } from "./mutations/manage-brand/create-brand";
export { deleteBrand } from "./mutations/manage-brand/delete-brand";
export { restoreBrands } from "./mutations/manage-brand/restore-brand";
export { updateBrand } from "./mutations/manage-brand/update-brand";
export { getBrandById } from "./queries/brand/get-brand-by-id";
export { getAllBrands } from "./queries/brand/get-brands";

/**
 * Exports GraphQL queries and mutations for managing category data.
 *
 * Workflow:
 * 1. Provides mutations for creating, updating, deleting, and restoring categories or sub-categories.
 * 2. Enables retrieval of a specific category or sub-category by its ID.
 * 3. Facilitates listing all categories and sub-categories in the system.
 */
export { createCategory } from "./mutations/manage-category/create-category";
export { deleteCategory } from "./mutations/manage-category/delete-category";
export { restoreCategory } from "./mutations/manage-category/restore-category";
export { updateCategory } from "./mutations/manage-category/update-category";
export { updateCategoryPosition } from "./mutations/manage-category/update-category-position";
export { getAllCategories } from "./queries/category/get-categories";
export { getCategoryById } from "./queries/category/get-category-by-id";
export { getSubCategoryById } from "./queries/category/get-sub-category-by-id";

/**
 * Exports GraphQL queries and mutations for managing tag data.
 *
 * Workflow:
 * 1. Provides mutations for creating, updating, deleting, and restoring tags.
 * 2. Enables retrieval of a specific tag by its ID.
 * 3. Facilitates listing all tags in the system.
 */
export { createTag } from "./mutations/manage-tag/create-tag";
export { deleteTag } from "./mutations/manage-tag/delete-tag";
export { restoreTags } from "./mutations/manage-tag/restore-tag";
export { updateTag } from "./mutations/manage-tag/update-tag";
export { getTagById } from "./queries/tag/get-tag-by-id";
export { getAllTags } from "./queries/tag/get-tags";

/**
 * Exports GraphQL queries and mutations for managing shipping class data.
 *
 * Workflow:
 * 1. Provides mutations for creating, updating, deleting, and restoring shipping classes.
 * 2. Enables retrieval of a specific shipping class by its ID.
 * 3. Facilitates listing all tags in the system.
 */
export { createShippingClass } from "./mutations/manage-shipping-class/create-shipping-class";
export { deleteShippingClass } from "./mutations/manage-shipping-class/delete-shipping-class";
export { restoreShippingClasses } from "./mutations/manage-shipping-class/restore-shipping-class";
export { updateShippingClass } from "./mutations/manage-shipping-class/update-shipping-class";
export { getAllShippingClass } from "./queries/shipping-class/get-shipping-class";
export { getShippingClassById } from "./queries/shipping-class/get-shipping-class-by-id";

/**
 * Exports GraphQL queries and mutations for managing tax class data.
 *
 * Workflow:
 * 1. Provides mutations for creating, updating, deleting, and restoring tax classes.
 * 2. Enables retrieval of a specific tax class by its ID.
 * 3. Facilitates listing all tags in the system.
 */
export { createTaxClass } from "./mutations/manage-tax-class/create-tax-class";
export { deleteTaxClass } from "./mutations/manage-tax-class/delete-tax-class";
export { restoreTaxClasses } from "./mutations/manage-tax-class/restore-tax-class";
export { updateTaxClass } from "./mutations/manage-tax-class/update-tax-class";
export { getAllTaxClass } from "./queries/tax-class/get-tax-class";
export { getTaxClassById } from "./queries/tax-class/get-tax-class-by-id";

/**
 * Exports GraphQL queries and mutations for managing tax status data.
 *
 * Workflow:
 * 1. Provides mutations for creating, updating, deleting, and restoring tax statuses.
 * 2. Enables retrieval of a specific tax status by its ID.
 * 3. Facilitates listing all tags in the system.
 */
export { createTaxStatus } from "./mutations/manage-tax-status/create-tax-status";
export { deleteTaxStatus } from "./mutations/manage-tax-status/delete-tax-status";
export { restoreTaxStatuses } from "./mutations/manage-tax-status/restore-tax-status";
export { updateTaxStatus } from "./mutations/manage-tax-status/update-tax-status";
export { getAllTaxStatus } from "./queries/tax-status/get-tax-status";
export { getTaxStatusById } from "./queries/tax-status/get-tax-status-by-id";

/**
 * Exports GraphQL queries and mutations for managing tax status data.
 *
 * Workflow:
 * 1. Provides mutations for creating, updating, deleting, and restoring tax statuses.
 * 2. Enables retrieval of a specific tax status by its ID.
 * 3. Facilitates listing all tags in the system.
 */
export { createProduct } from "./mutations/manage-product/create-product";
export { deleteProduct } from "./mutations/manage-product/delete-product";
export { restoreProducts } from "./mutations/manage-product/restore-product";
export { updateProduct } from "./mutations/manage-product/update-product";
export { getProduct } from "./queries/product/get-product";
export { getAllProducts } from "./queries/product/get-all-products";
