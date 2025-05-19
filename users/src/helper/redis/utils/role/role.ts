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
 * Get cached total roles count from Redis for a specific query.
 * Returns null if the count is not cached, allowing the caller to query the database.
 */
export const getRolesCountFromRedis = async (
  search: string | null,
  sortBy: string = "createdAt",
  sortOrder: string = "desc"
): Promise<number | null> => {
  const searchKeyWord = search ? search.toLowerCase().trim() : "none";
  const key = `${PREFIX.ROLES_COUNT}search:${searchKeyWord}:sort:${sortBy}:${sortOrder}`;

  const result = await redis.getSession<string | null>(key);

  if (result === null) {
    return null;
  }

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
 * Set total roles count in Redis for a specific query.
 * @param ttl - Time to live in seconds (default: 5 minutes)
 */
export const setRolesCountInRedis = async (
  search: string | null,
  sortBy: string = "createdAt",
  sortOrder: string = "desc",
  total: number,
  ttl: number = 300
): Promise<void> => {
  const searchKeyWord = search ? search.toLowerCase().trim() : "none";
  const key = `${PREFIX.ROLES_COUNT}search:${searchKeyWord}:sort:${sortBy}:${sortOrder}`;
  await redis.setSession(key, total.toString(), ttl);
};
