/**
 * Exports utilities for managing brand session data in Redis.
 *
 * Workflow:
 * 1. Provides functions for getting, setting and removing.
 */
export {
  clearAllBrandCountCache,
  clearAllBrandSearchCache,
  getBrandInfoByIdFromRedis,
  getBrandNameExistFromRedis,
  getBrandsCountFromRedis,
  getBrandsFromRedis,
  getBrandSlugExistFromRedis,
  removeBrandInfoByIdFromRedis,
  removeBrandNameExistFromRedis,
  removeBrandSlugExistFromRedis,
  setBrandInfoByIdInRedis,
  setBrandNameExistInRedis,
  setBrandsCountInRedis,
  setBrandsInRedis,
  setBrandSlugExistInRedis,
} from "./utils/brand/brand-session-manage";

/**
 * Exports utilities for managing brand session data in Redis.
 *
 * Workflow:
 * 1. Provides functions for getting, setting and removing.
 */
export {
  clearAllCategoryCountCache,
  clearAllCategorySearchCache,
  getCategoriesCountFromRedis,
  getCategoriesFromRedis,
  getCategoryInfoByIdFromRedis,
  getCategoryNameExistFromRedis,
  getCategorySlugExistFromRedis,
  getSubCategoryInfoByIdFromRedis,
  getSubCategoryNameExistFromRedis,
  getSubCategoryNameKey,
  getSubCategorySlugExistFromRedis,
  removeCategoryInfoByIdFromRedis,
  removeCategoryNameExistFromRedis,
  removeCategorySlugExistFromRedis,
  removeSubCategoryInfoByIdFromRedis,
  removeSubCategoryNameExistFromRedis,
  removeSubCategorySlugExistFromRedis,
  setCategoriesCountInRedis,
  setCategoriesInRedis,
  setCategoryInfoByIdInRedis,
  setCategoryNameExistInRedis,
  setCategorySlugExistInRedis,
  setSubCategoryInfoByIdInRedis,
  setSubCategoryNameExistInRedis,
  setSubCategorySlugExistInRedis,
} from "./utils/category/category-session-manage";

/**
 * Exports utilities for managing tag session data in Redis.
 *
 * Workflow:
 * 1. Provides functions for getting, setting and removing.
 */
export {
  clearAllTagCountCache,
  clearAllTagSearchCache,
  getTagInfoByIdFromRedis,
  getTagNameExistFromRedis,
  getTagsCountFromRedis,
  getTagsFromRedis,
  getTagSlugExistFromRedis,
  removeTagInfoByIdFromRedis,
  removeTagNameExistFromRedis,
  removeTagSlugExistFromRedis,
  setTagInfoByIdInRedis,
  setTagNameExistInRedis,
  setTagsCountInRedis,
  setTagsInRedis,
  setTagSlugExistInRedis,
} from "./utils/tag/tag-session-manage";

/**
 * Exports utilities for managing shipping class session data in Redis.
 *
 * Workflow:
 * 1. Provides functions for getting, setting and removing.
 */
export {
  clearAllShippingClassCountCache,
  clearAllShippingClassSearchCache,
  getShippingClassCountFromRedis,
  getShippingClassesFromRedis,
  getShippingClassInfoByIdFromRedis,
  getShippingClassValueExistFromRedis,
  removeShippingClassInfoByIdFromRedis,
  removeShippingClassValueExistFromRedis,
  setShippingClassCountInRedis,
  setShippingClassesInRedis,
  setShippingClassInfoByIdInRedis,
  setShippingClassValueExistInRedis,
} from "./utils/shipping-class/shipping-class-session-manage";

/**
 * Exports utilities for managing tax class session data in Redis.
 *
 * Workflow:
 * 1. Provides functions for getting, setting and removing.
 */
export {
  clearAllTaxClassCountCache,
  clearAllTaxClassSearchCache,
  getTaxClassCountFromRedis,
  getTaxClassesFromRedis,
  getTaxClassInfoByIdFromRedis,
  getTaxClassValueExistFromRedis,
  removeTaxClassInfoByIdFromRedis,
  removeTaxClassValueExistFromRedis,
  setTaxClassCountInRedis,
  setTaxClassesInRedis,
  setTaxClassInfoByIdInRedis,
  setTaxClassValueExistInRedis,
} from "./utils/tax-class/tax-class-session-manage";

/**
 * Exports utilities for managing tax rate session data in Redis.
 *
 * Workflow:
 * 1. Provides functions for getting, setting and removing.
 */
export {
  clearAllTaxRateSearchCacheByTaxClass,
  clearTaxRateCountCacheByTaxClass,
  getTaxRateCountFromRedis,
  getTaxRateInfoByIdFromRedis,
  getTaxRatesFromRedis,
  removeTaxRateInfoByIdFromRedis,
  removeTaxRateLabelExistFromRedis,
  setTaxRateCountInRedis,
  setTaxRateInfoByIdInRedis,
  setTaxRateLabelExistInRedis,
  setTaxRatesInRedis,
} from "./utils/tax-rate/tax-rate-session-manage";

/**
 * Exports utilities for managing user session data in Redis.
 *
 * Workflow:
 * 1. Provides functions for getting and setting.
 */
export {
  getUserInfoByEmailFromRedis,
  getUserTokenInfoByUserSessionIdFromRedis,
} from "./utils/user/user-session-manage";

/**
 * Exports utilities for managing permission and user roles session data in Redis.
 *
 * Workflow:
 * 1. Provides functions for getting.
 */
export {
  getUserPermissionsByUserIdFromRedis,
  getUserRolesInfoFromRedis,
} from "./utils/permissions/permission-session-manage";

/**
 * Exports utilities for managing product session data in Redis.
 *
 * Workflow:
 * 1. Provides functions for getting, setting and removing.
 */
export {
  clearAllProductCountCache,
  clearAllProductSearchCache,
  getProductInfoByIdFromRedis,
  getProductNameExistFromRedis,
  getProductsCountFromRedis,
  getProductsFromRedis,
  getProductSlugExistFromRedis,
  removeProductInfoByIdFromRedis,
  removeProductNameExistFromRedis,
  removeProductSlugExistFromRedis,
  setProductInfoByIdInRedis,
  setProductNameExistInRedis,
  setProductsCountInRedis,
  setProductsInRedis,
  setProductSlugExistInRedis,
} from "./utils/product/product-session-manage";
