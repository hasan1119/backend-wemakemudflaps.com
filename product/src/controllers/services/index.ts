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
  findCategoryByNameOrSlug,
  findCategoryByNameOrSlugToUpdateScoped,
  getCategoryById,
  getCategoryByIds,
  getSubCategoryById,
  getSubCategoryByIds,
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

/**
 * Exports services for creating shipping class.
 *
 * Workflow:
 * 1. Provides a function to create either a shipping class based on input.
 */
export { createShippingClass } from "./shipping-class/create-shipping-class.service";

/**
 * Exports services for deleting shipping classes.
 *
 * Workflow:
 * 1. Provides functions for soft deleting (skip to trash) and hard deleting entities.
 */
export {
  hardDeleteShippingClass,
  softDeleteShippingClass,
} from "./shipping-class/delete-shipping-class.service";

/**
 * Exports services for fetching and counting shipping class.
 *
 * Workflow:
 * 1. Provides counting of shipping class matching optional search criteria.
 * 2. Provides functions to fetch shipping class by ID/name with relations.
 * 3. Supports paginated retrieval of shipping class.
 */
export {
  countProductsForShippingClass,
  countShippingClassesWithSearch,
  findShippingClassByValue,
  findShippingClassByValueToUpdate,
  getShippingClassById,
  getShippingClassesByIds,
  paginateShippingClasses,
} from "./shipping-class/get-shipping-class.service";

/**
 * Exports service for restoring soft-deleted shipping class by ID.
 *
 * Workflow:
 * 1. Allows restoring entities by clearing their deletedAt timestamp.
 */
export { restoreShippingClass } from "./shipping-class/restore-shipping-class.service";

/**
 * Exports services for updating shipping class.
 *
 * Workflow:
 * 1. Provides functions to update basic fields (value, description).
 */
export { updateShippingClass } from "./shipping-class/update-shipping-class.service";

/**
 * Exports services for creating tax class.
 *
 * Workflow:
 * 1. Provides a function to create a tax class based on input.
 */
export { createTaxClass } from "./tax-class/create-tax-class.service";

/**
 * Exports services for deleting tax classes.
 *
 * Workflow:
 * 1. Provides functions for soft deleting (skip to trash) and hard deleting entities.
 */
export {
  hardDeleteTaxClass,
  softDeleteTaxClass,
} from "./tax-class/delete-tax-class.service";

/**
 * Exports services for fetching and counting tax classes.
 *
 * Workflow:
 * 1. Provides counting of tax classes matching optional search criteria.
 * 2. Provides functions to fetch tax class by ID/name with relations.
 * 3. Supports paginated retrieval of tax classes.
 */
export {
  countProductsForTaxClass,
  countTaxClassesWithSearch,
  findTaxClassByValue,
  findTaxClassByValueToUpdate,
  getTaxClassById,
  getTaxClassByIds,
  paginateTaxClasses,
} from "./tax-class/get-tax-class.service";

/**
 * Exports service for restoring soft-deleted tax class by ID.
 *
 * Workflow:
 * 1. Allows restoring entities by clearing their deletedAt timestamp.
 */
export { restoreTaxClass } from "./tax-class/restore-tax-class.service";

/**
 * Exports services for updating tax class.
 *
 * Workflow:
 * 1. Provides functions to update basic fields (value, description).
 */
export { updateTaxClass } from "./tax-class/update-tax-class.service";

/**
 * Exports services for creating tax class.
 *
 * Workflow:
 * 1. Provides a function to create a tax class based on input.
 */
export { createTaxStatus } from "./tax-status/create-tax-status.service";

/**
 * Exports services for deleting tax status.
 *
 * Workflow:
 * 1. Provides functions for soft deleting (skip to trash) and hard deleting entities.
 */
export {
  hardDeleteTaxStatus,
  softDeleteTaxStatus,
} from "./tax-status//delete-tax-status.service";

/**
 * Exports services for fetching and counting tax status.
 *
 * Workflow:
 * 1. Provides counting of tax status matching optional search criteria.
 * 2. Provides functions to fetch tax status by ID/name with relations.
 * 3. Supports paginated retrieval of tax status.
 */
export {
  countProductsForTaxStatus,
  countTaxStatusWithSearch,
  findTaxStatusByValue,
  findTaxStatusByValueToUpdate,
  getTaxStatusById,
  getTaxStatusByIds,
  paginateTaxStatus,
} from "./tax-status/get-tax-status.service";

/**
 * Exports service for restoring soft-deleted tax status by ID.
 *
 * Workflow:
 * 1. Allows restoring entities by clearing their deletedAt timestamp.
 */
export { restoreTaxStatus } from "./tax-status/restore-tax-status.service";

/**
 * Exports services for updating tax status.
 *
 * Workflow:
 * 1. Provides functions to update basic fields (value, description).
 */
export { updateTaxStatus } from "./tax-status/update-tax-status.service";
