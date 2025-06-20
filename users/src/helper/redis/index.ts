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
  getRoleInfoByRoleIdFromRedis,
  getRoleInfoByRoleNameFromRedis,
  getRoleNameExistFromRedis,
  getTotalUserCountByRoleIdFromRedis,
  removeRoleInfoByRoleIdFromRedis,
  removeRoleInfoByRoleNameFromRedis,
  removeRoleNameExistFromRedis,
  removeTotalUserCountByRoleIdFromRedis,
  setRoleInfoByRoleIdInRedis,
  setRoleInfoByRoleNameInRedis,
  setRoleNameExistInRedis,
  setTotalUserCountByRoleIdInRedis,
} from "./utils/role/role-session-manage";

/**
 * Exports utilities for managing role list data in Redis.
 *
 * Workflow:
 * 1. Provides functions for getting and setting cached roles and their counts.
 */
export {
  getRolesCountFromRedis,
  getRolesFromRedis,
  setRolesCountInRedis,
  setRolesInRedis,
} from "./utils/role/role";

/**
 * Exports utilities for managing user session data in Redis.
 *
 * Workflow:
 * 1. Provides functions for getting, setting, and removing user sessions, emails, and counts.
 */
export {
  getUserCountInDBFromRedis,
  getUserEmailFromRedis,
  getUserInfoByEmailFromRedis,
  getUserInfoByUserIdFromRedis,
  getUserTokenInfoByUserSessionIdFromRedis,
  removeUserCountInDBFromRedis,
  removeUserEmailFromRedis,
  removeUserInfoByEmailFromRedis,
  removeUserInfoByUserIdInRedis,
  removeUserTokenInfoByUserSessionIdFromRedis,
  setUserCountInDBInRedis,
  setUserEmailInRedis,
  setUserInfoByEmailInRedis,
  setUserInfoByUserIdInRedis,
  setUserTokenInfoByUserSessionIdInRedis,
} from "./utils/user/user-session-manage";

/**
 * Exports utilities for managing user list data in Redis.
 *
 * Workflow:
 * 1. Provides functions for getting, setting, and removing cached users and their counts.
 */
export {
  getUsersCountFromRedis,
  getUsersFromRedis,
  removeUsersFromRedis,
  setUsersCountInRedis,
  setUsersInRedis,
} from "./utils/user/users";
