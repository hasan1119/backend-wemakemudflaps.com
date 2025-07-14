/**
 * Exports GraphQL queries and mutations for managing brand data.
 *
 * Workflow:
 * 1. Provides mutations for creating, updating, deleting, and restoring brands.
 * 2. Enables retrieval of a specific brand by its ID.
 * 3. Facilitates listing all brands in the system.
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
export { createProduct } from "./mutations/manage-product/create-product";
export { deleteProduct } from "./mutations/manage-product/delete-product";
export { restoreProducts } from "./mutations/manage-product/restore-product";
export { updateProduct } from "./mutations/manage-product/update-product";
export { getAllProducts } from "./queries/product/get-all-products";
export { getProductById } from "./queries/product/get-product-by-id";

/**
 * Exports GraphQL queries and mutations for managing tax rate data.
 *
 * Workflow:
 * 1. Provides mutations for creating, updating, deleting, and restoring tax rates.
 * 2. Enables retrieval of a specific tax rate by its ID.
 * 3. Facilitates listing all tax rates in the system.
 */
export { createTaxRate } from "./mutations/manage-tax-rate/create-tax-rate";
export { deleteTaxRate } from "./mutations/manage-tax-rate/delete-tax-rate";
export { restoreTaxRates } from "./mutations/manage-tax-rate/restore-tax-rate";
export { updateTaxRate } from "./mutations/manage-tax-rate/update-tax-rate";
export { getAllTaxRates } from "./queries/tax-rate/get-tax-rate";
export { getTaxRateById } from "./queries/tax-rate/get-tax-rate-by-id";

/**
 * Exports GraphQL queries and mutations for managing shipping method data.
 *
 * Workflow:
 * 1. Provides mutations for creating, updating, deleting, and restoring shipping methods.
 * 2. Enables retrieval of a specific shipping method by its ID.
 * 3. Facilitates listing all shipping methods in the system.
 */
export { createShippingMethod } from "./mutations/manage-shipping-method/create-shipping-method";

/*
 * Exports GraphQL queries and mutations for managing shipping zone data.
 *
 * Workflow:
 * 1. Provides mutations for creating, updating, deleting, and restoring shipping zones.
 * 2. Enables retrieval of a specific shipping zone by its ID.
 * 3. Facilitates listing all shipping zones in the system.
 */
export { createShippingZone } from "./mutations/manage-shipping-zone/create-shipping-zone";
