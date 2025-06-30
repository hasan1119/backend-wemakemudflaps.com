import { AddressBook } from "../../../entities";
import {
  removeAllAddressBookByUserIdFromRedis,
  setAddressBookInfoByIdInRedis,
} from "../../../helper/redis";
import { MutationUpdateAddressBookEntryArgs } from "../../../types";
import { addressBookRepository } from "../repositories/repositories";

/**
 * Updates an existing address book entry with new data.
 *
 * If `isDefault` is true, ensures all other entries of the same type and user are set to `isDefault = false`.
 * Redis cache is updated accordingly.
 *
 * @param id - ID of the address book entry to update.
 * @param data - Fields to update (partial).
 * @param userId - ID of the user performing the update.
 * @returns The updated AddressBook entity.
 */
export const updateAddressBookEntry = async (
  id: string,
  data: MutationUpdateAddressBookEntryArgs,
  userId: string
): Promise<AddressBook | null> => {
  const existing = await addressBookRepository.findOne({
    where: { id, user: { id: userId } },
  });

  if (!existing) {
    return null;
  }

  // Handle isDefault logic: unmark all other entries for the same type
  if (data.isDefault) {
    await addressBookRepository
      .createQueryBuilder()
      .update(AddressBook)
      .set({ isDefault: false })
      .where("userId = :userId", { userId })
      .andWhere("type = :type", { type: data.type || existing.type }) // fallback to existing type
      .andWhere("id != :id", { id })
      .execute();

    const affectedAddresses = await addressBookRepository.find({
      where: {
        user: { id: userId },
        type: data.type || (existing.type as any),
      },
    });

    await Promise.all(
      affectedAddresses.map((address) =>
        setAddressBookInfoByIdInRedis(address.id, userId, address)
      )
    );
  }

  // Merge updated fields
  Object.assign(existing, {
    ...data,
    user: { id: userId } as any, // to ensure relation stays intact
  });

  const updated = await addressBookRepository.save(existing);

  await Promise.all([
    setAddressBookInfoByIdInRedis(updated.id, userId, updated),
    removeAllAddressBookByUserIdFromRedis(userId),
  ]);

  return updated;
};
