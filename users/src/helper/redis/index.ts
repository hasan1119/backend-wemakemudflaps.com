/**
 * Exports utilities for managing login session data in Redis.
 *
 * Workflow:
 * 1. Provides functions for getting, setting, and removing lockout sessions and login attempts.
 */
export {
  getLockoutSessionFromRedis,
  getLoginAttemptsFromRedis,
  removeLockoutSessionFromRedis,
  removeLoginAttemptsFromRedis,
  setLockoutSessionInRedis,
  setLoginAttemptsInRedis,
} from "./utils/login/login-session-manage";

/**
 * Exports utilities for managing address book reset session data in Redis.
 *
 * Workflow:
 * 1. Provides functions for getting and setting the address book.
 */
export {
  getAddressBookInfoByIdFromRedis,
  getAllAddressBooksFromRedis,
  removeAddressBookInfoByIdFromRedis,
  removeAllAddressBookByUserIdFromRedis,
  setAddressBookInfoByIdInRedis,
  setAllAddressBookByUserIdInRedis,
} from "./utils/address-book/address-book-session-manage";

/**
 * Exports utilities for managing password reset session data in Redis.
 *
 * Workflow:
 * 1. Provides functions for getting and setting the last password reset request timestamp.
 */
export {
  getLastResetRequestFromRedis,
  setLastResetRequestInRedis,
} from "./utils/password/password-session-manage";

/**
 * Exports utilities for managing permission and user roles session data in Redis.
 *
 * Workflow:
 * 1. Provides functions for getting, setting, and removing user, user roles info and role permissions.
 */
export {
  getPermissionAgainstRoleFromRedis,
  getUserPermissionsByUserIdFromRedis,
  getUserRolesInfoFromRedis,
  removePermissionAgainstRoleFromRedis,
  removeUserPermissionsByUserIdFromRedis,
  removeUserRolesInfoFromRedis,
  setPermissionAgainstRoleInRedis,
  setUserPermissionsByUserIdInRedis,
  setUserRolesInfoInRedis,
} from "./utils/permissions/permission-session-manage";

/**
 * Exports utilities for managing role session data in Redis.
 *
 * Workflow:
 * 1. Provides functions for getting, setting, and removing role info, existence flags, and user counts.
 */
export {
  clearAllRoleSearchCache,
  getRoleInfoByRoleIdFromRedis,
  getRoleInfoByRoleNameFromRedis,
  getRoleNameExistFromRedis,
  getRolesCountFromRedis,
  getRolesFromRedis,
  getTotalUserCountByRoleIdFromRedis,
  removeRoleInfoByRoleIdFromRedis,
  removeRoleInfoByRoleNameFromRedis,
  removeRoleNameExistFromRedis,
  removeTotalUserCountByRoleIdFromRedis,
  setRoleInfoByRoleIdInRedis,
  setRoleInfoByRoleNameInRedis,
  setRoleNameExistInRedis,
  setRolesCountInRedis,
  setRolesInRedis,
  setTotalUserCountByRoleIdInRedis,
} from "./utils/role/role-session-manage";

/**
 * Exports utilities for managing user session data in Redis.
 *
 * Workflow:
 * 1. Provides functions for getting, setting, and removing user sessions, emails, and counts.
 */
export {
  clearAllUserSearchCache,
  getUserCountInDBFromRedis,
  getUserEmailFromRedis,
  getUserInfoByEmailFromRedis,
  getUserInfoByUserIdFromRedis,
  getUsersCountFromRedis,
  getUsersFromRedis,
  getUserTokenInfoByUserSessionIdFromRedis,
  removeUserCountInDBFromRedis,
  removeUserEmailFromRedis,
  removeUserInfoByEmailFromRedis,
  removeUserInfoByUserIdInRedis,
  removeUserTokenInfoByUserSessionIdFromRedis,
  removeUserUsernameFromRedis,
  setUserCountInDBInRedis,
  setUserEmailInRedis,
  setUserInfoByEmailInRedis,
  setUserInfoByUserIdInRedis,
  setUsersCountInRedis,
  setUsersInRedis,
  setUserTokenInfoByUserSessionIdInRedis,
} from "./utils/user/user-session-manage";
