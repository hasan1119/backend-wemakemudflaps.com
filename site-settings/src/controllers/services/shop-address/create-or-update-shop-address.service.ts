import { v4 as uuidv4 } from "uuid";
import { ShopAddress } from "../../../entities";
import { ShopAddressInput } from "../../../types";
import { shopAddressRepository } from "../repositories/repositories";

/**
 * Creates or updates a shop address entity in the DB.
 *
 * @param data   - Shop address input
 * @param userId - ID of the user performing the action
 * @returns The updated ShopAddress entity
 */
export const createOrUpdateShopAddress = async (
  data: ShopAddressInput
): Promise<ShopAddress> => {
  let shopAddress;

  if (data.id) {
    // Try to find existing ShopAddress
    shopAddress = await shopAddressRepository.findOne({
      where: { id: data.id, deletedAt: null },
    });
  }

  // Business rule: isEveryDayOpen vs weeklyOffDays
  if (data.isEveryDayOpen === true) {
    data.weeklyOffDays = null;
  } else if (data.weeklyOffDays && data.weeklyOffDays.length > 0) {
    data.isEveryDayOpen = false;
  }

  // Handle default-for-tax: reset others if needed
  if (data.isDefaultForTax === true) {
    await shopAddressRepository.update(
      { isDefaultForTax: true },
      { isDefaultForTax: false }
    );
  }

  let updated;

  if (shopAddress) {
    // Update existing
    updated = Object.assign(shopAddress, {
      ...data,
      openingAndClosingHours: {
        opening: data.openingAndClosingHours?.opening ?? null,
        closing: data.openingAndClosingHours?.closing ?? null,
      },
    });
  } else {
    // Create new
    updated = shopAddressRepository.create({
      ...data,
      id: uuidv4(),
      openingAndClosingHours: {
        opening: data.openingAndClosingHours?.opening ?? null,
        closing: data.openingAndClosingHours?.closing ?? null,
      },
    });
  }

  await shopAddressRepository.save(updated);

  return updated;
};
