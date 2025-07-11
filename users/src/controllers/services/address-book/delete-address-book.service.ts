import {
  removeAddressBookInfoByIdFromRedis,
  removeAllAddressBookByUserIdFromRedis,
  setAddressBookInfoByIdInRedis,
} from "../../../helper/redis";
import { addressBookRepository } from "../repositories/repositories";

/**
 * Permanently deletes an address book from the database.
 * If the deleted address was marked as default, it promotes another of the same type to be the new default.
 * It also removes the deleted entry from the Redis cache.
 *
 * @param addressBookId - The UUID of the address book to be hard deleted.
 * @returns The ID of the new default address, if one was promoted.
 */
export const deleteAddressBook = async (
  addressBookId: string
): Promise<string | undefined> => {
  // Fetch the address with its user and type
  const existingAddress = await addressBookRepository.findOne({
    where: { id: addressBookId },
    relations: ["user"],
  });

  if (!existingAddress) return;

  const userId = (existingAddress.user as any).id;
  const addressType = existingAddress.type;

  // Delete the specified address
  await addressBookRepository.delete(addressBookId);

  let promotedId: string | undefined;

  // If the deleted address was the default, promote a new one
  if (existingAddress.isDefault) {
    const otherAddresses = await addressBookRepository.find({
      where: {
        user: { id: userId },
        type: addressType as any,
      },
      order: { createdAt: "DESC" },
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

  // Clear the cache for the deleted address and the user's address list
  await Promise.all([
    removeAddressBookInfoByIdFromRedis(addressBookId, userId),
    removeAllAddressBookByUserIdFromRedis(addressType, userId),
  ]);

  return promotedId;
};
