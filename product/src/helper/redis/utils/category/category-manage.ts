import {
  CategoryDataResponse,
  SubCategoryDataResponse,
} from "../../../../types";
import { redis } from "../../redis";

// Prefixes for Redis keys
const PREFIX = {
  CATEGORY: "category:",
  SUB_CATEGORY: "sub-category:",
  CATEGORY_EXISTS: "category-exists:",
  SUB_CATEGORY_EXISTS: "sub-category-exists:",
};

/**
 * Check if a category name exists in Redis.
 */
export const getCategoryNameExistFromRedis = async (
  name: string
): Promise<boolean> => {
  const result = await redis.getSession<string | null>(
    `${PREFIX.CATEGORY_EXISTS}${name.toLowerCase().trim()}`,
    "product-app"
  );
  return result === "exists";
};

/**
 * Check if a subcategory name exists in Redis.
 */
export const getSubCategoryNameExistFromRedis = async (
  name: string,
  parentScopeId: string
): Promise<boolean> => {
  const key = `${PREFIX.SUB_CATEGORY_EXISTS}${parentScopeId}:${name
    .toLowerCase()
    .trim()}`;
  const result = await redis.getSession<string | null>(key, "product-app");
  return result === "exists";
};

/**
 * Get category info by ID from Redis.
 */
export const getCategoryInfoByCategoryIdFromRedis = async (
  id: string
): Promise<CategoryDataResponse | null> => {
  return redis.getSession<CategoryDataResponse | null>(
    `${PREFIX.CATEGORY}${id}`,
    "product-app"
  );
};

/**
 * Get subcategory info by ID from Redis.
 */
export const getSubCategoryInfoBySubCategoryIdFromRedis = async (
  id: string
): Promise<SubCategoryDataResponse | null> => {
  return redis.getSession<SubCategoryDataResponse | null>(
    `${PREFIX.SUB_CATEGORY}${id}`,
    "product-app"
  );
};

/**
 * Set a category name existence flag in Redis.
 */
export const setCategoryNameExistInRedis = async (
  name: string
): Promise<void> => {
  await redis.setSession(
    `${PREFIX.CATEGORY_EXISTS}${name.toLowerCase().trim()}`,
    "exists",
    "product-app"
  );
};

/**
 * Set a subcategory name existence flag in Redis.
 */
export const setSubCategoryNameExistInRedis = async (
  name: string,
  parentScopeId: string
): Promise<void> => {
  const key = `${PREFIX.SUB_CATEGORY_EXISTS}${parentScopeId}:${name
    .toLowerCase()
    .trim()}`;
  await redis.setSession(key, "exists", "product-app");
};

/**
 * Set category info by ID in Redis.
 */
export const setCategoryInfoByCategoryIdInRedis = async (
  id: string,
  data: CategoryDataResponse
): Promise<void> => {
  await redis.setSession(`${PREFIX.CATEGORY}${id}`, data, "product-app");
};

/**
 * Set subcategory info by ID in Redis.
 */
export const setSubCategoryInfoBySubCategoryIdInRedis = async (
  id: string,
  data: SubCategoryDataResponse
): Promise<void> => {
  await redis.setSession(`${PREFIX.SUB_CATEGORY}${id}`, data, "product-app");
};

/**
 * Remove category name existence flag from Redis.
 */
export const removeCategoryNameExistFromRedis = async (
  name: string
): Promise<void> => {
  await redis.deleteSession(
    `${PREFIX.CATEGORY_EXISTS}${name.toLowerCase().trim()}`,
    "product-app"
  );
};

/**
 * Remove subcategory name existence flag from Redis.
 */
export const removeSubCategoryNameExistFromRedis = async (
  name: string
): Promise<void> => {
  await redis.deleteSession(
    `${PREFIX.SUB_CATEGORY_EXISTS}${name.toLowerCase().trim()}`,
    "product-app"
  );
};

/**
 * Remove category info by ID from Redis.
 */
export const removeCategoryInfoByCategoryIdFromRedis = async (
  id: string
): Promise<void> => {
  await redis.deleteSession(`${PREFIX.CATEGORY}${id}`, "product-app");
};

/**
 * Remove subcategory info by ID from Redis.
 */
export const removeSubCategoryInfoBySubCategoryIdFromRedis = async (
  id: string
): Promise<void> => {
  await redis.deleteSession(`${PREFIX.SUB_CATEGORY}${id}`, "product-app");
};
