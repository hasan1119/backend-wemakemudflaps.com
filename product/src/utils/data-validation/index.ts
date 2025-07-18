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
} from "./shipping-method/shipping-method";

/**
 * Exports product attribute related schemas for product attribute management.
 *
 * Workflow:
 * 1. Provides schemas for creating, updating, and sorting product attributes.
 */
export {
  CreateProductAttributeInputSchema,
  productAttributeSortingSchema,
  ProductAttributeValueInputSchema,
  UpdateProductAttributeInputSchema,
} from "./product/product-attribute/product-attribute";

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

/**
 * Exports shipping-zone related schemas for shipping zone management.
 *
 * Workflow:
 * 1. Provides schemas for creating, updating, and sorting shipping zones.
 */
export {
  createShippingZoneSchema,
  sortShippingZoneSchema,
  updateShippingZoneSchema,
} from "./shipping-zone/shipping-zone";

/**
 * Exports tax-options related schemas for tax option management.
 *
 * Workflow:
 * 1. Provides schemas for creating, and updating tax options.
 */
export {
  createdTaxOptionsSchema,
  updatedTaxOptionsSchema,
} from "./tax-options/tax-options";
