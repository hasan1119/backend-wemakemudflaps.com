import { AddressBook } from "../../../entities";
import { MutationUpdateAddressBookEntryArgs } from "../../../types";
import { addressBookRepository } from "../repositories/repositories";
import { getAddressBookById } from "./get-address-book.service";

/**
 * Directly updates a addressAddressBook with the given fields and returns the updated entity.
 *
 * @param addressAddressBookId - The UUID of the addressAddressBook to update.
 * @param data - Partial data to update (e.g., name, slug).
 * @returns A promise resolving to the updated AddressBook entity.
 */
export const updateAddressBook = async (
  addressAddressBookId: string,
  data: Partial<MutationUpdateAddressBookEntryArgs>
): Promise<AddressBook> => {
  await addressBookRepository.update(addressAddressBookId, {
    ...(data.city !== undefined && data.city !== null && { city: data.city }),
    ...(data.county !== undefined &&
      data.county !== null && { county: data.county }),
    ...(data.houseNo !== undefined &&
      data.houseNo !== null && { houseNo: data.houseNo }),
    ...(data.isDefault !== undefined &&
      data.isDefault !== null && { isDefault: data.isDefault }),
    ...(data.state !== undefined &&
      data.state !== null && { state: data.state }),
    ...(data.street !== undefined &&
      data.street !== null && { street: data.street }),
    ...(data.zip !== undefined && data.zip !== null && { zip: data.zip }),
  });

  return await getAddressBookById(addressAddressBookId);
};
