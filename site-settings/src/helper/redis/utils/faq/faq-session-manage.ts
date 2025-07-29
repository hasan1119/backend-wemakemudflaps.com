import { Faq } from "../../../../types";
import { redis } from "../../redis";

// Defines prefixes for Redis keys used for FAQ session and user count caching
const PREFIX = {
  FAQ: "faq:",
  LIST: "faqs-list:",
  COUNT: "faqs-count:",
};

/**
 * Retrieves paginated FAQ list and count from Redis.
 *
 * Workflow:
 * 1. Constructs Redis keys using page, limit, search, sortBy, and sortOrder.
 * 2. Attempts to fetch both FAQ list and count from Redis.
 * 3. Parses count into number if it exists and is valid.
 *
 * @param page - Current pagination page.
 * @param limit - Number of FAQs per page.
 * @param search - Optional search keyword.
 * @param sortBy - Field name to sort by (default: "createdAt").
 * @param sortOrder - Sort direction ("asc" | "desc", default: "desc").
 * @returns An object with FAQs array and total count, or nulls if not cached.
 */
export const getFaqsAndCountFromRedis = async (
  page: number,
  limit: number,
  search: string | null,
  sortBy: string = "createdAt",
  sortOrder: string = "desc"
): Promise<{
  faqs: Faq[] | null;
  count: number | null;
}> => {
  const searchKeyWord = search ? search.toLowerCase().trim() : "none";
  const faqsKey = `${PREFIX.LIST}page:${page}:limit:${limit}:search:${searchKeyWord}:sort:${sortBy}:${sortOrder}`;
  const countKey = `${PREFIX.COUNT}search:${searchKeyWord}:sort:${sortBy}:${sortOrder}`;

  const [faqsResult, countResult] = await Promise.all([
    redis.getSession<Faq[] | null>(faqsKey, "site-settings"),
    redis.getSession<string | null>(countKey, "site-settings"),
  ]);

  const count =
    countResult !== null
      ? isNaN(Number(countResult))
        ? 0
        : Number(countResult)
      : null;

  return { faqs: faqsResult, count };
};

/**
 * Caches a paginated FAQ list and total count in Redis.
 *
 * Workflow:
 * 1. Builds Redis keys using pagination and sorting inputs.
 * 2. Stores FAQ list and count separately in Redis with optional TTL.
 *
 * @param page - Current pagination page.
 * @param limit - Number of FAQs per page.
 * @param search - Optional search keyword.
 * @param sortBy - Sort field (default: "createdAt").
 * @param sortOrder - Sort direction (default: "desc").
 * @param faqs - Array of FAQ objects to cache.
 * @param total - Total count of matching FAQs.
 * @param ttl - Time-to-live in seconds (default: 3600 = 1 hour).
 */
export const setFaqsAndCountInRedis = async (
  page: number,
  limit: number,
  search: string | null,
  sortBy: string = "createdAt",
  sortOrder: string = "desc",
  faqs: Faq[],
  total: number,
  ttl: number = 3600
): Promise<void> => {
  const searchKeyWord = search ? search.toLowerCase().trim() : "none";
  const faqsKey = `${PREFIX.LIST}page:${page}:limit:${limit}:search:${searchKeyWord}:sort:${sortBy}:${sortOrder}`;
  const countKey = `${PREFIX.COUNT}search:${searchKeyWord}:sort:${sortBy}:${sortOrder}`;

  await Promise.all([
    redis.setSession(faqsKey, faqs, "site-settings", ttl),
    redis.setSession(countKey, total.toString(), "site-settings", ttl),
  ]);
};

/**
 * Clears all FAQ list and count cache entries from Redis.
 *
 * Workflow:
 * 1. Fetches all Redis keys in "site-settings" namespace.
 * 2. Filters out only keys that match FAQ list or count patterns.
 * 3. Deletes those keys from Redis.
 */
export const clearFaqsAndCountCache = async (): Promise<void> => {
  const keys = await redis.getAllSessionKey("site-settings");
  const relevantKeys = keys.filter(
    (key) => key.startsWith(PREFIX.LIST) || key.startsWith(PREFIX.COUNT)
  );

  if (relevantKeys.length > 0) {
    await Promise.all(
      relevantKeys.map((key) => redis.deleteSession(key, "site-settings"))
    );
  }
};

/**
 * Retrieves a single FAQ entry by ID from Redis.
 *
 * @param faqId - UUID of the FAQ to retrieve.
 * @returns Cached FAQ object or null if not found.
 */
export const getFaqInfoByIdFromRedis = async (
  faqId: string
): Promise<Faq | null> => {
  return redis.getSession<Faq | null>(`${PREFIX.FAQ}${faqId}`, "site-settings");
};

/**
 * Caches a single FAQ entry by ID in Redis.
 *
 * @param faqId - UUID of the FAQ to cache.
 * @param data - FAQ data to store.
 */
export const setFaqInfoByIdInRedis = async (
  faqId: string,
  data: Faq
): Promise<void> => {
  await redis.setSession(`${PREFIX.FAQ}${faqId}`, data, "site-settings");
};

/**
 * Removes a single FAQ entry from Redis by ID.
 *
 * @param faqId - UUID of the FAQ to remove from cache.
 */
export const removeFaqInfoByIdFromRedis = async (
  faqId: string
): Promise<void> => {
  await redis.deleteSession(`${PREFIX.FAQ}${faqId}`, "site-settings");
};
