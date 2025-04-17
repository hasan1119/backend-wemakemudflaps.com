// Functions to generate dynamic Redis session keys for user login
export const getLoginAttemptsKeyCacheKey = (email: string) => {
  return `login-attempt-${email}`;
};
export const getLockoutKeyCacheKey = (email: string) => {
  return `lockout-${email}`;
};

// Functions to generate dynamic Redis session keys for user
export const getSingleUserCacheKey = (id: string) => {
  return `single-user-${id}`;
};
export const getMultipleUsersCacheKey = () => {
  return "multiple-users";
};
export const getUserSessionCacheKey = (id: string) => {
  return `user-session-${id}`;
};
export const getUserEmailCacheKey = (email: string) => {
  return `user-email-${email}`;
};
export const getRegisterUserCountKeyCacheKey = () => {
  return "user-count-register";
};

// Functions to generate dynamic Redis session keys for user roles
export const getSingleUserRoleCacheKey = (id: string) => {
  return `single-user-role-${id}`;
};
export const getSingleUserRoleNameCacheKey = (name: string) => {
  return `role-name-${name}`;
};
export const getSingleUserRoleInfoByNameCacheKey = (name: string) => {
  return `role-info-${name}`;
};
export const getUserRoleCountAssociateCacheKey = (id: string) => {
  return `user-role-${id}`;
};
export const getMultipleUserRolesCacheKey = () => {
  return "multiple-user-roles";
};

// Functions to generate dynamic Redis session keys for user permissions
export const getSingleUserPermissionCacheKey = (id: string) => {
  return `single-user-permission-${id}`;
};
export const getMultipleUserPermissionsCacheKey = () => {
  return "multiple-user-permissions";
};

// Functions to generate dynamic Redis session keys for exist keyword
export const getExistKeyWord = () => {
  return "exists";
};
