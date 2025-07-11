import { AddressBook } from "../../../../types";
import { redis } from "../../redis";

// Defines prefixes for Redis keys used for addressbook session and user count caching
const PREFIX = {
  ADDRESS_BOOK: "address-book:user:",
};

/**
 * Caches all address books for a user in Redis.
 *
 * @param type - The address type ID.
 * @param userId - The user's ID.
 * @param data - Array of AddressBook entities.
 */
export const setAllAddressBookByUserIdInRedis = async (
  type: string,
  userId: string,
  data: AddressBook[]
): Promise<void> => {
  const key = `${PREFIX.ADDRESS_BOOK}${userId}:type:${type}`;
  await redis.setSession(key, data, "user-app");
};

/**
 * Handles caching address book information in Redis by address book ID.
 *
 * @param addressBookId - The ID of the address book.
 * @param userId - The user's ID.
 * @param data - The AddressBook entity to cache.
 */
export const setAddressBookInfoByIdInRedis = async (
  addressBookId: string,
  userId: string,
  data: AddressBook
): Promise<void> => {
  const key = `${PREFIX.ADDRESS_BOOK}${userId}:address:${addressBookId}`;
  await redis.setSession(key, data, "user-app");
};

/**
 * Retrieves all address books for a user from Redis.
 *
 * @param userId - The user's ID.
 * @returns Array of AddressBook or null.
 */
export const getAllAddressBookByUserIdFromRedis = async (
  type: string,
  userId: string
): Promise<AddressBook[] | null> => {
  const key = `${PREFIX.ADDRESS_BOOK}${userId}:type:${type}`;
  return redis.getSession<AddressBook[] | null>(key, "user-app");
};

/**
 * Handles retrieval of address book information from Redis by address book ID.
 *
 * @param addressBookId - The ID of the address book.
 * @returns The AddressBook or null if not found.
 */
export const getAddressBookInfoByIdFromRedis = async (
  addressBookId: string,
  userId: string
): Promise<AddressBook | null> => {
  const key = `${PREFIX.ADDRESS_BOOK}${userId}:address:${addressBookId}`;
  return redis.getSession<AddressBook | null>(key, "user-app");
};

/**
 * Handles removal of address book information list from Redis user ID.
 *
 * @param type - The address type ID.
 * @param userId - The user's ID.
 */
export const removeAllAddressBookByUserIdFromRedis = async (
  type: string,
  userId: string
): Promise<void> => {
  const key = `${PREFIX.ADDRESS_BOOK}${userId}:type:${type}`;
  await redis.deleteSession(key, "user-app");
};

/**
 * Handles removal of address book information from Redis by address book ID.
 *
 * @param addressBookId - The ID of the address book.
 */
export const removeAddressBookInfoByIdFromRedis = async (
  addressBookId: string,
  userId: string
): Promise<void> => {
  const key = `${PREFIX.ADDRESS_BOOK}${userId}:address:${addressBookId}`;
  await redis.deleteSession(key, "user-app");
};
