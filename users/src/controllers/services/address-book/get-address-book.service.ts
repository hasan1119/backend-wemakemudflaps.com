import { AddressBook } from "../../../entities";
import { addressBookRepository } from "../repositories/repositories";

/**
 * Retrieves a single AddressBook entity by its ID.
 *
 * Workflow:
 * 1. Queries the addressBookRepository to find a addressBook that matches the provided ID.
 * 2. Includes the "products" relation to load associated products.
 * 3. Returns the AddressBook entity or null if not found.
 *
 * @param id - The UUID of the addressBook to retrieve.
 * @param userId - ID of the user.
 * @returns A promise that resolves to the AddressBook entity, or null if no match is found.
 */
export const getAddressBookById = async (
  id: string,
  userId: string
): Promise<AddressBook | null> => {
  return await addressBookRepository.findOne({
    where: { id, user: { id: userId } },
  });
};

/**
 * Retrieves multiple AddressBook entities by their IDs.
 *
 * Workflow:
 * 1. Checks if the input array is non-empty.
 * 2. Uses `In` operator to match all addressBook IDs in the provided list.
 * 3. Filters out soft-deleted addressBooks (deletedAt IS NULL).
 * 4. Includes the "products" relation for each addressBook.
 * 5. Returns an array of matching AddressBook entities.
 *
 * @param userId - ID of the user.
 * @param type - Type of the address book to retrieve.
 * @returns A promise resolving to an array of AddressBook entities.
 */
export const getAddressBooks = async (
  userId: string,
  type: string
): Promise<AddressBook[]> => {
  return await addressBookRepository.find({
    where: {
      user: { id: userId },
      type: type as any,
    },
    order: {
      isDefault: "DESC", // default one first
      updatedAt: "DESC", // most recently updated next
    },
  });
};
