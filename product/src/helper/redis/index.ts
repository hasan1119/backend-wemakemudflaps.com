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
} from "./utils/tag/manage-tag-session";

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
