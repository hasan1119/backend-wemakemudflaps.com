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
 * Exports utilities for managing site settings in Redis.
 *
 * Workflow:
 * 1. Provides functions for getting and setting site settings and shop address.
 */
export {
  clearShopAddressesCache,
  getShopAddressesFromRedis,
  getSiteSettingsFromRedis,
  setShopAddressesToRedis,
  setSiteSettingsToRedis,
} from "./utils/site-settings/site-settings-session-manage";

/**
 * Exports utilities for managing FAQ data in Redis.
 *
 * Workflow:
 * 1. Provides functions for getting, setting, and removing FAQ entries.
 * 2. Includes functions to clear all FAQ-related cache entries.
 */
export {
  clearFaqsAndCountCache,
  getFaqInfoByIdFromRedis,
  getFaqsAndCountFromRedis,
  removeFaqInfoByIdFromRedis,
  setFaqInfoByIdInRedis,
  setFaqsAndCountInRedis,
} from "./utils/faq/faq-session-manage";
