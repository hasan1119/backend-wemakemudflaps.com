import { SiteSettings } from "../../../entities";
import { siteSettingsRepository } from "../repositories/repositories";

/**
 * Deletes specified shop addresses from the site settings.
 *
 * @param ids - Array of IDs of the shop addresses to delete.
 * @returns Updated site settings after deletion.
 * @throws Error if no addresses are found to delete.
 */
export const deleteShopAddresses = async (
  ids: string[]
): Promise<SiteSettings> => {
  // Load current active site settings (not deleted)
  const siteSettings = await siteSettingsRepository.findOne({
    where: { deletedAt: null },
  });

  // Filter out the addresses to delete
  const filteredAddresses = siteSettings.shopAddresses.filter(
    (addr) => !ids.includes(addr.id)
  );

  if (filteredAddresses.length === siteSettings.shopAddresses.length) {
    throw new Error("Shop addresses not found");
  }

  // Update shopAddresses and save
  siteSettings.shopAddresses = filteredAddresses;
  await siteSettingsRepository.save(siteSettings);

  return siteSettings;
};
