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
 * @returns The updated AddressBook entity.
 */
export const updateAddressBookEntry = async (
  id: string,
  data: MutationUpdateAddressBookEntryArgs
): Promise<AddressBook | null> => {
  const userId = data.userId;

  const existing = await addressBookRepository.findOne({
    where: { id, user: { id: userId } },
  });

  if (!existing) return null;

  const targetType = data.type || existing.type;

  // If updating to default, clear isDefault from others
  if (data.isDefault) {
    await addressBookRepository
      .createQueryBuilder()
      .update(AddressBook)
      .set({ isDefault: false })
      .where("userId = :userId", { userId })
      .andWhere("type = :type", { type: targetType })
      .andWhere("id != :id", { id })
      .execute();

    const affectedAddresses = await addressBookRepository.find({
      where: { user: { id: userId }, type: targetType as any },
    });

    await Promise.all(
      affectedAddresses.map((address) =>
        setAddressBookInfoByIdInRedis(address.id, userId, {
          ...address,
          type: address.type as any,
          createdAt:
            address.createdAt instanceof Date
              ? address.createdAt.toISOString()
              : address.createdAt,
          updatedAt:
            address.updatedAt instanceof Date
              ? address.updatedAt.toISOString()
              : address.updatedAt,
        })
      )
    );
  }

  // Merge updated fields
  Object.assign(existing, {
    ...data,
    user: { id: userId } as any,
  });

  const updated = await addressBookRepository.save(existing);

  await Promise.all([
    setAddressBookInfoByIdInRedis(updated.id, userId, {
      ...updated,
      type: updated.type as any,
      createdAt:
        updated.createdAt instanceof Date
          ? updated.createdAt.toISOString()
          : updated.createdAt,
      updatedAt:
        updated.updatedAt instanceof Date
          ? updated.updatedAt.toISOString()
          : updated.updatedAt,
    }),
    removeAllAddressBookByUserIdFromRedis(updated.type, userId),
  ]);

  return updated;
};
