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
  // Check if any address of the same type already exists for the user
  const existingCount = await addressBookRepository.count({
    where: { user: { id: userId }, type: data.type as any },
  });

  const shouldBeDefault = data.isDefault || existingCount === 0;

  if (shouldBeDefault) {
    // Unset previous defaults of this type for the user
    await addressBookRepository
      .createQueryBuilder()
      .update(AddressBook)
      .set({ isDefault: false })
      .where("userId = :userId", { userId })
      .andWhere("type = :type", { type: data.type })
      .execute();

    // Update Redis cache for affected addresses
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

  // Create the new entry
  const addressBookEntry = addressBookRepository.create({
    type: data.type as any,
    company: data.company,
    streetOne: data.streetOne,
    streetTwo: data.streetTwo,
    city: data.city,
    zip: data.zip,
    state: data.state,
    country: data.country,
    isDefault: shouldBeDefault,
    user: { id: userId } as any,
  });

  const result = await addressBookRepository.save(addressBookEntry);

  // Cache the new address
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

  // Invalidate user's address list cache for that type
  await removeAllAddressBookByUserIdFromRedis(data.type, userId);

  return result;
};
