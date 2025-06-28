/**
 * Exports utilities for managing brand session data in Redis.
 *
 * Workflow:
 * 1. Provides functions for getting, setting and removing.
 */
export {
  clearAllBrandSearchCache,
  getBrandInfoByBrandIdFromRedis,
  getBrandNameExistFromRedis,
  getBrandsCountFromRedis,
  getBrandsFromRedis,
  getBrandSlugExistFromRedis,
  removeBrandInfoByBrandIdFromRedis,
  removeBrandNameExistFromRedis,
  removeBrandSlugExistFromRedis,
  setBrandInfoByBrandIdInRedis,
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
  getTagInfoByTagIdFromRedis,
  getTagNameExistFromRedis,
  getTagsCountFromRedis,
  getTagsFromRedis,
  getTagSlugExistFromRedis,
  removeTagInfoByTagIdFromRedis,
  removeTagNameExistFromRedis,
  removeTagSlugExistFromRedis,
  setTagInfoByTagIdInRedis,
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
