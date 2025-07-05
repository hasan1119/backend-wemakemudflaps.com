import { In } from "typeorm";
import {
  removeAddressBookInfoByIdFromRedis,
  removeAllAddressBookByUserIdFromRedis,
  setAddressBookInfoByIdInRedis,
} from "../../../helper/redis";
import { addressBookRepository } from "../repositories/repositories";

/**
 * Permanently deletes multiple address books from the database.
 * For each deleted address that was marked as default, promotes another of the same type to be default.
 * Also removes deleted entries from Redis cache.
 *
 * @param addressBookIds - An array of UUIDs of address books to hard delete.
 */
export const hardDeleteAddressBook = async (
  addressBookIds: string[]
): Promise<string | undefined> => {
  if (!addressBookIds.length) return;

  // Fetch all addresses with users and types for given IDs
  const existingAddresses = await addressBookRepository.find({
    where: { id: In(addressBookIds) },
    relations: ["user"],
  });

  if (!existingAddresses.length) return;

  // Group deleted addresses by userId + type for default promotion later
  const defaultCandidatesMap = new Map<
    string,
    { userId: string; type: string }
  >();

  // Collect IDs to delete
  const idsToDelete = existingAddresses.map((addr) => addr.id);

  // Track which userId/type combos had a deleted default
  for (const addr of existingAddresses) {
    if (addr.isDefault) {
      const userId = (addr.user as any).id;
      const key = `${userId}:${addr.type}`;
      defaultCandidatesMap.set(key, { userId, type: addr.type });
    }
  }

  // Delete all specified addresses in one go
  await addressBookRepository.delete(idsToDelete);

  let promotedId: string | undefined;

  // For each userId/type combo that lost a default, promote a new default if possible
  for (const { userId, type } of defaultCandidatesMap.values()) {
    const otherAddresses = await addressBookRepository.find({
      where: {
        user: { id: userId },
        type: type as any,
      },
      order: { updatedAt: "DESC" },
    });

    if (otherAddresses.length > 0) {
      const toPromote = otherAddresses[0];
      toPromote.isDefault = true;
      await addressBookRepository.save(toPromote);
      await setAddressBookInfoByIdInRedis(toPromote.id, userId, {
        ...toPromote,
        type: toPromote.type as any,
        createdAt:
          toPromote.createdAt instanceof Date
            ? toPromote.createdAt.toISOString()
            : toPromote.createdAt,
        updatedAt:
          toPromote.updatedAt instanceof Date
            ? toPromote.updatedAt.toISOString()
            : toPromote.updatedAt,
      });

      promotedId = toPromote.id;
    }
  }

  // Get the unique user ID (assuming all addresses belong to the same user)
  const userId = (existingAddresses[0].user as any).id;

  // Extract unique types from deleted addresses
  const uniqueTypes = new Set(existingAddresses.map((addr) => addr.type));

  // Prepare cache clearing promises
  const removeItemCachePromises = existingAddresses.map((addr) =>
    removeAddressBookInfoByIdFromRedis(addr.id, userId)
  );

  const removeListCachePromises = Array.from(uniqueTypes).map((type) =>
    removeAllAddressBookByUserIdFromRedis(type, userId)
  );

  // Remove item and list caches in parallel
  await Promise.all([...removeItemCachePromises, ...removeListCachePromises]);

  return promotedId;
};
