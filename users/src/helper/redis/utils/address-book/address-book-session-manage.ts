import { AddressBook } from "../../../../types";
import { redis } from "../../redis";

// Defines prefixes for Redis keys used for addressbook session and user count caching
const PREFIX = {
  ADDRESS_BOOK: "address-book:",
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
  await redis.setSession(
    `${PREFIX.ADDRESS_BOOK}type:${type}user:${userId}`,
    data,
    "user-app"
  );
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
  await redis.setSession(
    `${PREFIX.ADDRESS_BOOK}address-id:${addressBookId}user:${userId}`,
    data,
    "user-app"
  );
};

/**
 * Retrieves all address books for a user from Redis.
 *
 * @param userId - The user's ID.
 * @returns Array of AddressBook or null.
 */
export const getAllAddressBooksFromRedis = async (
  userId: string
): Promise<AddressBook[] | null> => {
  return redis.getSession<AddressBook[] | null>(
    `${PREFIX.ADDRESS_BOOK}user:${userId}`,
    "user-app"
  );
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
  return redis.getSession<AddressBook | null>(
    `${PREFIX.ADDRESS_BOOK}address-id:${addressBookId}user:${userId}`,
    "user-app"
  );
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
  await redis.deleteSession(
    `${PREFIX.ADDRESS_BOOK}type:${type}user:${userId}`,
    "user-app"
  );
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
  await redis.deleteSession(
    `${PREFIX.ADDRESS_BOOK}address-id:${addressBookId}user:${userId}`,
    "user-app"
  );
};
