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
export const getUserInfoByEmailCacheKey = (email: string) => {
  return `user-info-by-email-${email}`;
};
export const getRegisterUserCountKeyCacheKey = () => {
  return "user-count-register";
};

// Functions to generate dynamic Redis session keys for user roles
export const getSingleUserRoleInfoByIdCacheKey = (id: string) => {
  return `single-user-role-${id}`;
};
// export const getSingleUserRoleNameCacheKey = (name: string) => {
//   return `role-name-${name}`;
// };
export const getSingleUserRoleInfoByRoleNameCacheKey = (name: string) => {
  return `role-info-by-${name}`;
};
export const getSingleUserRoleInfoByRoleIdCacheKey = (id: string) => {
  return `role-info-by-${id}`;
};
export const getSingleUserRoleInfoExistByRoleNameCacheKey = (name: string) => {
  return `role-info-exist-by-${name}`;
};
// export const getUserRoleCountAssociateCacheKey = (id: string) => {
//   return `user-role-${id}`;
// };
export const getMultipleUserRolesCacheKey = () => {
  return "multiple-user-roles";
};

// Functions to generate dynamic Redis session keys for user permissions
export const getUserPermissionByUserIdCacheKey = (id: string) => {
  return `user-permission-${id}`;
};
export const getMultipleUserPermissionsCacheKey = () => {
  return "multiple-user-permissions";
};

// Functions to generate dynamic Redis session keys for exist keyword
export const getExistKeyWord = () => {
  return "exists";
};
