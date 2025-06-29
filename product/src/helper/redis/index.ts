/**
 * Exports utilities for managing brand session data in Redis.
 *
 * Workflow:
 * 1. Provides functions for getting, setting and removing.
 */
export {
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
 * Exports utilities for managing tag session data in Redis.
 *
 * Workflow:
 * 1. Provides functions for getting, setting and removing.
 */
export {
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
