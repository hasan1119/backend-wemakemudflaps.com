import { Permission, Role, RolePermission, User } from "../../../../entities";
import { PermissionSession, RolePermissionSession } from "../../../../types";
import { mapPermissions } from "../../../../utils/mapper";
import { redis } from "../../redis";

// Defines prefixes for Redis keys used for permission session caching
const PREFIX = {
  PERMISSIONS_USER: "permissions:user:",
  USER_ROLES_INFO: "user:roles:info:",
  ROLE_PERMISSIONS: "role_permissions:",
};

/**
 * Handles storing user permissions data in Redis by user ID.
 *
 * Workflow:
 * 1. Maps the provided user or permission data to a session format using mapPermissions.
 * 2. Stores the mapped session data in Redis with the user permissions prefix and user ID.
 *
 * @param userId - The ID of the user.
 * @param data - The User or Permission data to store.
 * @returns A promise resolving when the permissions are stored.
 */
export const setUserPermissionsByUserIdInRedis = async (
  userId: string,
  data: User | Permission
): Promise<void> => {
  let sessionData: RolePermissionSession[] | PermissionSession[];
  if ("permissions" in data) {
    sessionData = await mapPermissions(data.permissions);
  } else if ("id" in data && "name" in data) {
    sessionData = await mapPermissions([data as Permission]);
  }
  await redis.setSession(`${PREFIX.PERMISSIONS_USER}${userId}`, sessionData);
};

/**
 * Handles storing user role data in Redis by user ID.
 *
 * Workflow:
 * 1. Stores the role data in Redis with the user roles info prefix and user ID.
 *
 * @param userId - The ID of the user.
 * @param data - The Role data to store.
 * @returns A promise resolving when the roles are stored.
 */
export const setUserRolesInfoInRedis = async (
  userId: string,
  data: Role[]
): Promise<void> => {
  await redis.setSession(`${PREFIX.USER_ROLES_INFO}${userId}`, data);
};

/**
 * Handles storing role permissions data in Redis by role ID.
 *
 * Workflow:
 * 1. Stores the provided role permissions data in Redis with the role permissions prefix and role ID.
 *
 * @param roleId - The ID of the role.
 * @param permissions - The array of RolePermission data to store.
 * @returns A promise resolving when the permissions are stored.
 */
export const setPermissionAgainstRoleInRedis = async (
  roleId: string,
  permissions: RolePermission[]
): Promise<void> => {
  await redis.setSession(`${PREFIX.ROLE_PERMISSIONS}${roleId}`, permissions);
};

/**
 * Handles retrieval of user permissions data from Redis by user ID.
 *
 * Workflow:
 * 1. Queries Redis using the user permissions prefix and user ID.
 * 2. Returns the parsed permissions data or null if not found.
 *
 * @param userId - The ID of the user.
 * @returns A promise resolving to the RolePermissionSession or PermissionSession array or null if not found.
 */
export const getUserPermissionsByUserIdFromRedis = async (
  userId: string
): Promise<RolePermissionSession[] | PermissionSession[] | null> => {
  return redis.getSession<RolePermissionSession[] | null>(
    `${PREFIX.PERMISSIONS_USER}${userId}`
  );
};

/**
 * Handles retrieval of user role data from Redis by user ID.
 *
 * Workflow:
 * 1. Queries Redis using the user roles info prefix and user ID.
 * 2. Returns the parsed Role data or null if not found.
 *
 * @param userId - The ID of the user.
 * @returns A promise resolving to the Role data or null if not found.
 */
export const getUserRolesInfoFromRedis = async (
  userId: string
): Promise<Role[] | null> => {
  return redis.getSession<Role[] | null>(`${PREFIX.USER_ROLES_INFO}${userId}`);
};

/**
 * Handles retrieval of role permissions data from Redis by role ID.
 *
 * Workflow:
 * 1. Queries Redis using the role permissions prefix and role ID.
 * 2. Returns the parsed RolePermission array or null if not found.
 *
 * @param roleId - The ID of the role.
 * @returns A promise resolving to the RolePermission array or null if not found.
 */
export const getPermissionAgainstRoleFromRedis = async (
  roleId: string
): Promise<RolePermission[] | null> => {
  return redis.getSession<RolePermission[] | null>(
    `${PREFIX.ROLE_PERMISSIONS}${roleId}`
  );
};

/**
 * Handles removal of user permissions data from Redis by user ID.
 *
 * Workflow:
 * 1. Deletes the permissions data from Redis using the user permissions prefix and user ID.
 *
 * @param userId - The ID of the user.
 * @returns A promise resolving when the permissions are removed.
 */
export const removeUserPermissionsFromRedis = async (
  userId: string
): Promise<void> => {
  return redis.deleteSession(`${PREFIX.PERMISSIONS_USER}${userId}`);
};

/**
 * Handles removal of user role data from Redis by user ID.
 *
 * Workflow:
 * 1. Deletes the role data from Redis using the user roles info prefix and user ID.
 *
 * @param userId - The ID of the user.
 * @returns A promise resolving when the role data is removed.
 */
export const removeUserRolesInfoFromRedis = async (
  userId: string
): Promise<void> => {
  return redis.deleteSession(`${PREFIX.USER_ROLES_INFO}${userId}`);
};

/**
 * Handles removal of role permissions data from Redis by role ID.
 *
 * Workflow:
 * 1. Deletes the permissions data from Redis using the role permissions prefix and role ID.
 *
 * @param roleId - The ID of the role.
 * @returns A promise resolving when the permissions are removed.
 */
export const removePermissionAgainstRoleFromRedis = async (
  roleId: string
): Promise<void> => {
  return redis.deleteSession(`${PREFIX.ROLE_PERMISSIONS}${roleId}`);
};
