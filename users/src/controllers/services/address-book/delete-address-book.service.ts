import {
  removeAddressBookInfoByIdFromRedis,
  removeAllAddressBookByUserIdFromRedis,
  setAddressBookInfoByIdInRedis,
} from "../../../helper/redis";
import { AddressBook } from "../../../types";
import { addressBookRepository } from "../repositories/repositories";

/**
 * Permanently deletes an address book from the database.
 * If the deleted address was marked as default, it promotes another of the same type to be the new default.
 * It also removes/updates the Redis cache accordingly.
 *
 * @param addressBookId - The UUID of the address book to be hard deleted.
 * @returns The ID of the new default address, if one was promoted.
 */
export const deleteAddressBook = async (
  addressBookId: string,
  userId: string
): Promise<string | undefined> => {
  // Fetch the address with its user and type
  const existingAddress = await addressBookRepository.findOne({
    where: { id: addressBookId },
    relations: ["user"],
  });

  if (!existingAddress) return;

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

      // Update Redis cache with the new default address
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
      } as AddressBook);

      promotedId = toPromote.id;
    }
  }

  // Remove deleted address from Redis and invalidate user's address book list cache
  await Promise.all([
    removeAddressBookInfoByIdFromRedis(addressBookId, userId),
    removeAllAddressBookByUserIdFromRedis(addressType, userId),
  ]);

  return promotedId;
};
