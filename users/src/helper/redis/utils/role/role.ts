//
// ===================== GETTERS =====================
//

import { CachedRoleInputs } from "../../../../types";
import { redis } from "../../redis";

// Prefix for Redis keys
const PREFIX = {
  ROLES: "roles:",
  ROLES_COUNT: "roles-count:",
};

/**
 * Get cached roles from Redis by page, limit, search term, sortBy, and sortOrder.
 */
export const getRolesFromRedis = async (
  page: number,
  limit: number,
  search: string | null,
  sortBy: string = "createdAt",
  sortOrder: string = "desc"
): Promise<CachedRoleInputs[] | null> => {
  const searchKeyWord = search ? search.toLowerCase().trim() : "none";
  const key = `${PREFIX.ROLES}page:${page}:limit:${limit}:search:${searchKeyWord}:sort:${sortBy}:${sortOrder}`;
  return redis.getSession<CachedRoleInputs[] | null>(key);
};

/**
 * Get cached total roles count from Redis.
 */
export const getRolesCountFromRedis = async (): Promise<number> => {
  const result = await redis.getSession<number | null>(`${PREFIX.ROLES}`);

  const count = Number(result);
  return isNaN(count) ? 0 : count;
};

//
// ===================== SETTERS =====================
//

/**
 * Set roles in Redis by page, limit, search term, sortBy, and sortOrder.
 * @param ttl - Time to live in seconds (default: 5 minutes)
 */
export const setRolesInRedis = async (
  page: number,
  limit: number,
  search: string | null,
  sortBy: string = "createdAt",
  sortOrder: string = "desc",
  roles: CachedRoleInputs[],
  ttl: number = 300
): Promise<void> => {
  const searchKeyWord = search ? search.toLowerCase().trim() : "none";
  const key = `${PREFIX.ROLES}page:${page}:limit:${limit}:search:${searchKeyWord}:sort:${sortBy}:${sortOrder}`;
  await redis.setSession(key, roles, ttl);
};

/**
 * Set total roles count in Redis.
 * @param ttl - Time to live in seconds (default: 5 minutes)
 */
export const setRolesCountInRedis = async (
  total: number,
  ttl: number = 300
): Promise<void> => {
  const key = `${PREFIX.ROLES}`;
  await redis.setSession(key, total.toString(), ttl);
};
