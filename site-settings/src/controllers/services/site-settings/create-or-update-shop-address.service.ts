import { v4 as uuidv4 } from "uuid";
import { SiteSettings } from "../../../entities";
import { ShopAddressInput } from "../../../types";
import { siteSettingsRepository } from "../repositories/repositories";

/**
 * Creates or updates a shop address inside the SiteSettings JSONB field.
 *
 * @param data   - Shop address input
 * @param userId - ID of the user performing the action
 */
export const createOrUpdateShopAddress = async (
  data: ShopAddressInput,
  userId: string
): Promise<SiteSettings> => {
  // Load the current site settings (assuming only one active settings row)
  let siteSettings = await siteSettingsRepository.findOne({
    where: { deletedAt: null },
  });

  // If no settings exist yet, create a blank one
  if (!siteSettings) {
    siteSettings = siteSettingsRepository.create({
      id: uuidv4(),
      createdBy: userId,
      shopAddresses: [],
    });
  }

  if (!siteSettings.shopAddresses) {
    siteSettings.shopAddresses = [];
  }

  if (data.id) {
    // Try to update an existing shop address
    const index = siteSettings.shopAddresses.findIndex(
      (addr) => addr.id === data.id
    );
    if (index !== -1) {
      siteSettings.shopAddresses[index] = {
        ...siteSettings.shopAddresses[index],
        ...data,
      };
    } else {
      // If ID provided but not found, treat as new
      siteSettings.shopAddresses.push({
        ...data,
        id: data.id || uuidv4(),
      });
    }
  } else {
    // Create a new shop address
    siteSettings.shopAddresses.push({
      ...data,
      id: uuidv4(),
    });
  }

  return await siteSettingsRepository.save(siteSettings);
};
