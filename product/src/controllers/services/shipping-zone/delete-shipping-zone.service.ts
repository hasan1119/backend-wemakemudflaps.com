import { shippingZoneRepository } from "../repositories/repositories";

/**
 * Permanently deletes a shipping zone from the database.
 *
 * @param shippingZoneId - The UUID of the shipping zone to delete.
 * @returns A promise that resolves when the deletion is complete.
 */
export const deleteShippingZone = async (
  shippingZoneId: string
): Promise<void> => {
  await shippingZoneRepository.delete({ id: shippingZoneId });
};
