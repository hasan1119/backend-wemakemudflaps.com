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

  // Apply business logic for isEveryDayOpen and weeklyOffDays mutual exclusivity
  const processedData = { ...data };

  // If isEveryDayOpen is true, set weeklyOffDays to null
  if (processedData.isEveryDayOpen === true) {
    processedData.weeklyOffDays = null;
  }
  // If weeklyOffDays is not null/empty, set isEveryDayOpen to false
  else if (
    processedData.weeklyOffDays &&
    processedData.weeklyOffDays.length > 0
  ) {
    processedData.isEveryDayOpen = false;
  }

  if (processedData.id) {
    // Try to update an existing shop address
    const index = siteSettings.shopAddresses.findIndex(
      (addr) => addr.id === processedData.id
    );
    if (index !== -1) {
      siteSettings.shopAddresses[index] = {
        ...siteSettings.shopAddresses[index],
        ...processedData,
        openingAndClosingHours: {
          opening: processedData.openingAndClosingHours?.opening ?? "",
          closing: processedData.openingAndClosingHours?.closing ?? "",
        },
      };
    } else {
      // If ID provided but not found, treat as new
      siteSettings.shopAddresses.push({
        ...processedData,
        id: processedData.id || uuidv4(),
        openingAndClosingHours: {
          opening: processedData.openingAndClosingHours?.opening ?? "",
          closing: processedData.openingAndClosingHours?.closing ?? "",
        },
      });
    }
  } else {
    // Create a new shop address
    siteSettings.shopAddresses.push({
      ...processedData,
      id: uuidv4(),
      openingAndClosingHours: {
        opening: processedData.openingAndClosingHours?.opening ?? "",
        closing: processedData.openingAndClosingHours?.closing ?? "",
      },
    });
  }

  return await siteSettingsRepository.save(siteSettings);
};
