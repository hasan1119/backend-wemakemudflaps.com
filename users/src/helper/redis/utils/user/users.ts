import { User } from "../../../../types";
import { redis } from "../../redis";

// Prefix for Redis keys
const PREFIX = {
  USERS: "users:",
};

//
// ===================== GETTERS =====================
//

/**
 * Get cached users from Redis by page, limit, search term, sortBy, and sortOrder.
 */
export const getUsersFromRedis = async (
  page: number,
  limit: number,
  search: string | null,
  sortBy: string = "createdAt",
  sortOrder: string = "desc"
): Promise<User[] | null> => {
  const searchKeyWord = search ? search.toLowerCase().trim() : "none";
  const key = `${PREFIX.USERS}page:${page}:limit:${limit}:search:${searchKeyWord}:sort:${sortBy}:${sortOrder}`;
  return redis.getSession<User[] | null>(key);
};

/**
 * Get cached total users count from Redis.
 */
export const getUsersCountFromRedis = async (): Promise<number> => {
  const result = await redis.getSession<number | null>(`${PREFIX.USERS}count}`);

  const count = Number(result);
  return isNaN(count) ? 0 : count;
};

//
// ===================== SETTERS =====================
//

/**
 * Set users in Redis by page, limit, search term, sortBy, and sortOrder.
 * @param ttl - Time to live in seconds (default: 5 minutes)
 */
export const setUsersInRedis = async (
  page: number,
  limit: number,
  search: string | null,
  sortBy: string = "createdAt",
  sortOrder: string = "desc",
  users: User[],
  ttl: number = 300
): Promise<void> => {
  const searchKeyWord = search ? search.toLowerCase().trim() : "none";
  const key = `${PREFIX.USERS}page:${page}:limit:${limit}:search:${searchKeyWord}:sort:${sortBy}:${sortOrder}`;
  await redis.setSession(key, users, ttl);
};

/**
 * Set total users count in Redis.
 * @param ttl - Time to live in seconds (default: 5 minutes)
 */
export const setUsersCountInRedis = async (
  total: number,
  ttl: number = 300
): Promise<void> => {
  const key = `${PREFIX.USERS}count`;
  await redis.setSession(key, total.toString(), ttl);
};
