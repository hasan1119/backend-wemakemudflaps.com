import { AddressBook } from "../../../entities";
import { MutationCreateAddressBookEntryArgs } from "../../../types";
import { addressBookRepository } from "../repositories/repositories";

/**
 * Handles creation and saving of a new address book entry in the database.
 *
 * Workflow:
 * 1. Creates a new AddressBook entity using the provided data.
 * 2. Sets optional fields like addressLine2, notes, and createdBy with defaults if not provided.
 * 3. Saves the address book entry to the database using the addressBookRepository.
 * 4. Returns the newly created AddressBook entity.
 *
 * @param data - Partial AddressBook data for creating the new entry.
 * @param userId - Optional user ID of the creator.
 * @returns A promise resolving to the newly created AddressBook entity.
 */
export const createAddressBookEntry = async (
  data: MutationCreateAddressBookEntryArgs,
  userId?: string
): Promise<AddressBook> => {
  // Create new address book entity with provided data
  const addressBookEntry = addressBookRepository.create({
    type: data.type as any,
    houseNo: data.houseNo,
    street: data.street,
    city: data.city,
    zip: data.zip,
    state: data.state,
    county: data.county,
    isDefault: data.isDefault,
    user: { id: userId } as any,
  });

  // Save address book entry to database
  return await addressBookRepository.save(addressBookEntry);
};
