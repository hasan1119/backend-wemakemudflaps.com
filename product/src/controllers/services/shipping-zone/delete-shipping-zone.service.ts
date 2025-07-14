import { shippingZoneRepository } from "../repositories/repositories";

/**
 * Permanently deletes a shipping zone from the database.
 *
 *Workflow:
 * 1. Uses the shippingZoneRepository to delete the shipping zone by its ID.
 *
 * @param shippingZoneId - The UUID of the shipping zone to delete.
 * @return A promise that resolves when the deletion is complete.
 */
export const deleteShippingZone = async (
  shippingZoneId: string
): Promise<void> => {
  await shippingZoneRepository.delete({ id: shippingZoneId });
};
