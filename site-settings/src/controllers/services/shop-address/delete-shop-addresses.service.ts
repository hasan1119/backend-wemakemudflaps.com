import { In } from "typeorm";
import { shopAddressRepository } from "../repositories/repositories";

/**
 * Permanently deletes specified shop addresses and ensures one address
 * is always marked as default for tax (the most recently created).
 *
 * @param ids - Array of IDs of the shop addresses to delete.
 * @throws Error if no addresses remain after deletion.
 */
export const deleteShopAddresses = async (ids: string[]): Promise<void> => {
  // Permanently delete the specified addresses
  await shopAddressRepository.delete({ id: In(ids) });

  // Get remaining addresses ordered by createdAt DESC
  const remainingAddresses = await shopAddressRepository.find({
    order: { createdAt: "DESC" },
  });

  // Reset all isDefaultForTax
  await shopAddressRepository.update(
    { id: In(remainingAddresses.map((addr) => addr.id)) },
    { isDefaultForTax: false }
  );

  // Set the most recent one as default
  const latest = remainingAddresses[0];

  if (latest) {
    await shopAddressRepository.update(
      { id: latest.id },
      { isDefaultForTax: true }
    );
  }
};
