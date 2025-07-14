/**
 * Exports shipping-method related schemas for shipping method management.
 *
 * Workflow:
 * 1. Provides schemas for creating, and updating shipping method.
 */
export {
  createShippingMethodSchema,
  shippingMethodSortingSchema,
  updateShippingMethodSchema,
} from "./shipping-method/shipping-method.validation";

/**
 * Exports category-related schemas for category management.
 *
 * Workflow:
 * 1. Provides schemas for creating, and updating categories.
 */
export {
  categorySortingSchema,
  createCategorySchema,
  deleteCategorySchema,
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
  idSchema,
  idsSchema,
  paginationSchema,
  skipTrashSchema,
  SortOrderTypeEnum,
} from "./common/common";

/**
 * Exports tag-related schemas for tag management.
 *
 * Workflow:
 * 1. Provides schemas for creating, and updating tag.
 */
export { createTagSchema, tagsSortingSchema, updateTagSchema } from "./tag/tag";

/**
 * Exports brand-related schemas for brand management.
 *
 * Workflow:
 * 1. Provides schemas for creating, and updating brand.
 */
export {
  brandsSortingSchema,
  createBrandSchema,
  updateBrandSchema,
} from "./brand/brand";

/**
 * Exports shipping-class related schemas for tag management.
 *
 * Workflow:
 * 1. Provides schemas for creating, and updating tag.
 */
export {
  createShippingClassSchema,
  shippingClassSortingSchema,
  updateShippingClassSchema,
} from "./shipping-class/shipping-class";

/**
 * Exports tax-class related schemas for tag management.
 *
 * Workflow:
 * 1. Provides schemas for creating, and updating tag.
 */
export {
  createTaxClassSchema,
  taxClassSortingSchema,
  updateTaxClassSchema,
} from "./tax-class/tax-class";

/**
 * Exports product-related schemas for product management.
 *
 * Workflow:
 * 1. Provides schemas for creating, and updating categories.
 */
export {
  createProductSchema,
  productSortingSchema,
  updateProductSchema,
} from "./product/product";

/**
 * Exports tax-rate related schemas for tax rate management.
 *
 * Workflow:
 * 1. Provides schemas for creating, updating, and sorting tax rates.
 */
export {
  createTaxRateSchema,
  taxRateSortingSchema,
  updateTaxRateSchema,
} from "./tax-rate/tax-rate";
