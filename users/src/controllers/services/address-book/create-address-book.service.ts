import { AddressBook } from "../../../entities";
import {
  removeAllAddressBookByUserIdFromRedis,
  setAddressBookInfoByIdInRedis,
} from "../../../helper/redis";
import { MutationCreateAddressBookEntryArgs } from "../../../types";
import { addressBookRepository } from "../repositories/repositories";

/**
 * Handles creation and saving of a new address book entry in the database.
 *
 * If isDefault is true, sets all other entries with the same type and user to isDefault = false.
 *
 * @param data - Partial AddressBook data for creating the new entry.
 * @param userId - Optional user ID of the creator.
 * @returns A promise resolving to the newly created AddressBook entity.
 */
export const createAddressBookEntry = async (
  data: MutationCreateAddressBookEntryArgs,
  userId: string
): Promise<AddressBook> => {
  if (data.isDefault) {
    // Set isDefault = false for all other entries with same type and user
    await addressBookRepository
      .createQueryBuilder()
      .update(AddressBook)
      .set({ isDefault: false })
      .where("userId = :userId", { userId })
      .andWhere("type = :type", { type: data.type })
      .execute();

    // Fetch all affected addresses to update cache
    const affectedAddresses = await addressBookRepository.find({
      where: { user: { id: userId }, type: data.type as any },
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

  // Create new address book entity with provided data
  const addressBookEntry = addressBookRepository.create({
    type: data.type as any,
    company: data.company,
    streetOne: data.streetOne,
    streetTwo: data.streetTwo,
    city: data.city,
    zip: data.zip,
    state: data.state,
    country: data.country,
    isDefault: data.isDefault,
    user: { id: userId } as any,
  });

  // Save address book entry to database
  const result = await addressBookRepository.save(addressBookEntry);

  // Cache address-book information and existence in Redis
  await setAddressBookInfoByIdInRedis(result.id, userId, {
    ...result,
    type: result.type as any,
    createdAt:
      result.createdAt instanceof Date
        ? result.createdAt.toISOString()
        : result.createdAt,
    updatedAt:
      result.updatedAt instanceof Date
        ? result.updatedAt.toISOString()
        : result.updatedAt,
  });

  // Clear all the cache list of the user address book
  await removeAllAddressBookByUserIdFromRedis(data.type, userId);

  return result;
};
