import { addressBookRepository } from "../repositories/repositories";

/**
 * Permanently deletes a address book from the database.
 *
 * @param addressBookId - The UUID of the addressBook to hard delete.
 */
export const hardDeleteAddressBook = async (
  addressBookId: string
): Promise<void> => {
  await addressBookRepository.delete({ id: addressBookId });
};
