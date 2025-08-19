/**
 * Exports utilities for managing brand session data in Redis.
 *
 * Workflow:
 * 1. Provides functions for getting, setting and removing.
 */
export {
  clearBrandsAndCountCache,
  getBrandInfoByIdFromRedis,
  getBrandNameExistFromRedis,
  getBrandsAndCountFromRedis,
  getBrandSlugExistFromRedis,
  removeBrandInfoByIdFromRedis,
  removeBrandNameExistFromRedis,
  removeBrandSlugExistFromRedis,
  setBrandInfoByIdInRedis,
  setBrandNameExistInRedis,
  setBrandsAndCountInRedis,
  setBrandSlugExistInRedis,
} from "./utils/brand/brand-session-manage";

/**
 * Exports utilities for managing brand session data in Redis.
 *
 * Workflow:
 * 1. Provides functions for getting, setting and removing.
 */
export {
  clearCategoriesAndCountCache,
  getCategoriesAndCountFromRedis,
  getCategoryInfoByIdFromRedis,
  getCategoryNameExistFromRedis,
  getCategorySlugExistFromRedis,
  removeCategoryInfoByIdFromRedis,
  removeCategoryNameExistFromRedis,
  removeCategorySlugExistFromRedis,
  setCategoriesAndCountInRedis,
  setCategoryInfoByIdInRedis,
  setCategoryNameExistInRedis,
  setCategorySlugExistInRedis,
} from "./utils/category/category-session-manage";

/**
 * Exports utilities for managing tag session data in Redis.
 *
 * Workflow:
 * 1. Provides functions for getting, setting and removing.
 */
export {
  clearTagsAndCountCache,
  getTagInfoByIdFromRedis,
  getTagNameExistFromRedis,
  getTagsAndCountFromRedis,
  getTagSlugExistFromRedis,
  removeTagInfoByIdFromRedis,
  removeTagNameExistFromRedis,
  removeTagSlugExistFromRedis,
  setTagInfoByIdInRedis,
  setTagNameExistInRedis,
  setTagsAndCountInRedis,
  setTagSlugExistInRedis,
} from "./utils/tag/tag-session-manage";

/**
 * Exports utilities for managing shipping class session data in Redis.
 *
 * Workflow:
 * 1. Provides functions for getting, setting and removing.
 */
export {
  clearShippingClassesAndCountCache,
  getShippingClassesAndCountFromRedis,
  getShippingClassInfoByIdFromRedis,
  getShippingClassValueExistFromRedis,
  removeShippingClassInfoByIdFromRedis,
  removeShippingClassValueExistFromRedis,
  setShippingClassesAndCountInRedis,
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
  clearTaxClassesAndCountCache,
  getTaxClassesAndCountFromRedis,
  getTaxClassInfoByIdFromRedis,
  getTaxClassValueExistFromRedis,
  removeTaxClassInfoByIdFromRedis,
  removeTaxClassValueExistFromRedis,
  setTaxClassesAndCountInRedis,
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
  clearTaxRatesAndCountCacheByTaxClass,
  getTaxRateInfoByIdFromRedis,
  getTaxRatesAndCountFromRedis,
  removeTaxRateInfoByIdFromRedis,
  setTaxRateInfoByIdInRedis,
  setTaxRatesAndCountInRedis,
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
  clearProductsAndCountCache,
  getProductInfoByIdFromRedis,
  getProductInfoBySlugFromRedis,
  getProductsAndCountFromRedis,
  removeProductInfoByIdFromRedis,
  removeProductInfoBySlugFromRedis,
  setProductInfoByIdInRedis,
  setProductInfoBySlugInRedis,
  setProductsAndCountInRedis,
} from "./utils/product/product-session-manage";
