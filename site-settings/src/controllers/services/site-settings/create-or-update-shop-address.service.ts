import { v4 as uuidv4 } from "uuid";
import { SiteSettings } from "../../../entities";
import {
  clearShopAddressesCache,
  removeShopAddressByIdFromRedis,
  setShopAddressByIdInRedis,
} from "../../../helper/redis";
import { ShopAddress, ShopAddressInput } from "../../../types";
import { siteSettingsRepository } from "../repositories/repositories";
/**
 * Creates or updates a shop address inside the SiteSettings JSONB field.
 *
 * @param data   - Shop address input
 * @param userId - ID of the user performing the action
 * @returns The updated SiteSettings entity
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

  // Handle isDefaultForTax
  let updatedAddress;

  if (processedData.id) {
    // Try to update an existing shop address
    const index = siteSettings.shopAddresses.findIndex(
      (addr) => addr.id === processedData.id
    );
    if (index !== -1) {
      // Preserve isDefaultForTax if not provided in input
      const existingAddress = siteSettings.shopAddresses[index];
      const isDefaultForTax =
        processedData.isDefaultForTax !== undefined
          ? processedData.isDefaultForTax
          : existingAddress.isDefaultForTax;

      // If setting this address as default for tax, reset others
      if (isDefaultForTax === true) {
        siteSettings.shopAddresses = siteSettings.shopAddresses.map((addr) => ({
          ...addr,
          isDefaultForTax: addr.id === processedData.id ? true : false,
        }));
      }

      updatedAddress = {
        ...existingAddress,
        ...processedData,
        isDefaultForTax,
        openingAndClosingHours: {
          opening: processedData.openingAndClosingHours?.opening ?? "",
          closing: processedData.openingAndClosingHours?.closing ?? "",
        },
      };
      siteSettings.shopAddresses[index] = updatedAddress;
    } else {
      // If ID provided but not found, treat as new
      updatedAddress = {
        ...processedData,
        id: processedData.id || uuidv4(),
        isDefaultForTax: processedData.isDefaultForTax ?? null,
        openingAndClosingHours: {
          opening: processedData.openingAndClosingHours?.opening ?? "",
          closing: processedData.openingAndClosingHours?.closing ?? "",
        },
      };

      // If setting this address as default for tax, reset others
      if (processedData.isDefaultForTax === true) {
        siteSettings.shopAddresses = siteSettings.shopAddresses.map((addr) => ({
          ...addr,
          isDefaultForTax: false,
        }));
      }
      siteSettings.shopAddresses.push(updatedAddress);
    }
  } else {
    // Create a new shop address
    updatedAddress = {
      ...processedData,
      id: uuidv4(),
      isDefaultForTax: processedData.isDefaultForTax ?? null,
      openingAndClosingHours: {
        opening: processedData.openingAndClosingHours?.opening ?? "",
        closing: processedData.openingAndClosingHours?.closing ?? "",
      },
    };

    // If setting this address as default for tax, reset others
    if (processedData.isDefaultForTax === true) {
      siteSettings.shopAddresses = siteSettings.shopAddresses.map((addr) => ({
        ...addr,
        isDefaultForTax: false,
      }));
    }
    siteSettings.shopAddresses.push(updatedAddress);
  }

  // Update Redis cache
  const redisOperations = [
    setShopAddressByIdInRedis(updatedAddress.id, updatedAddress as ShopAddress),
    clearShopAddressesCache(), // Clear the entire cache as shopAddresses is a JSONB array
  ];

  // If isDefaultForTax is true, remove other addresses from Redis
  if (updatedAddress.isDefaultForTax === true) {
    const otherAddressIds = siteSettings.shopAddresses
      .filter((addr) => addr.id !== updatedAddress.id)
      .map((addr) => addr.id);
    redisOperations.push(
      ...otherAddressIds.map((id) => removeShopAddressByIdFromRedis(id))
    );
  }

  await Promise.all(redisOperations);

  return await siteSettingsRepository.save(siteSettings);
};
