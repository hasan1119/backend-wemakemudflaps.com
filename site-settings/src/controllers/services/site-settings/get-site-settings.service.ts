import { SiteSettings } from "../../../entities";
import {
  getShopAddressByIdFromRedis,
  setShopAddressByIdInRedis,
} from "../../../helper/redis";
import { siteSettingsRepository } from "../repositories/repositories";

/**
 * Retrieves the site settings.
 *
 * Workflow:
 * 1. Fetches the first site settings record from the database.
 * 2. Returns null if no records are found.
 *
 * @returns Promise resolving to SiteSettings or null if not found.
 */
export const getSiteSettings = async (): Promise<SiteSettings | null> => {
  const siteSettings = await siteSettingsRepository.findOne({
    where: { deletedAt: null },
    select: {
      id: true,
      name: true,
      metaData: true,
      favIcon: true,
      logo: true,
      contactNumber: true,
      contactEmail: true,
      privacyPolicy: true,
      termsAndConditions: true,
      createdBy: true,
      createdAt: true,
      deletedAt: true,
    },
  });

  return siteSettings || null;
};

interface ShopAddress {
  id: string;
  brunchName?: string | null;
  addressLine1?: string | null;
  addressLine2?: string | null;
  emails?:
    | {
        type: "Corporate" | "Complain" | "Support" | "Other" | null;
        email: string | null;
      }[]
    | null;
  phones?:
    | {
        type: "Mobile" | "Landline" | "Fax" | "Other" | null;
        number: string | null;
      }[]
    | null;
  city?: string | null;
  state?: string | null;
  country?: string | null;
  zipCode?: string | null;
  direction?: string | null;
}

/**
 * Retrieves shop addresses with pagination and optional search.
 *
 * Workflow:
 * 1. Fetches the site settings from the database.
 * 2. If no site settings or shop addresses are found, returns an empty array.
 * 3. Applies search filter if provided.
 * 4. Paginates the results.
 *
 * @param page - The page number to retrieve.
 * @param limit - The number of items per page.
 * @param search - Optional search term to filter results.
 * @returns Promise resolving to an object containing the paginated shop addresses and total count.
 */
export const getShopAddresses = async (
  page: number,
  limit: number,
  search?: string,
  forCustomer: boolean = true
): Promise<{ data: ShopAddress[]; total: number }> => {
  const siteSettings = await siteSettingsRepository.findOne({
    where: { deletedAt: null },
  });

  if (!siteSettings || !siteSettings.shopAddresses) {
    return { data: [], total: 0 };
  }

  // if user is authenticated, show all otherwise show only isActive true addresses
  let addresses = forCustomer
    ? siteSettings.shopAddresses.filter((addr) => addr.isActive)
    : siteSettings.shopAddresses;

  // Optional search filter
  if (search && search.trim()) {
    const term = search.toLowerCase();
    addresses = addresses.filter(
      (addr) =>
        (addr.brunchName && addr.brunchName.toLowerCase().includes(term)) ||
        (addr.city && addr.city.toLowerCase().includes(term)) ||
        (addr.state && addr.state.toLowerCase().includes(term)) ||
        (addr.country && addr.country.toLowerCase().includes(term))
    );
  }

  const total = addresses.length;
  const startIndex = (page - 1) * limit;
  const data = addresses.slice(startIndex, startIndex + limit);

  return { data, total };
};

/**
 * Retrieves the shop address marked as default for tax purposes.
 *
 * Workflow:
 * 1. Fetches the site settings from the database.
 * 2. If no site settings or shop addresses are found, returns null.
 * 3. Finds and returns the shop address marked as default for tax purposes.
 *
 * @returns Promise resolving to the default tax shop address or null if not found.
 */
export const getShopForDefaultTax = async (): Promise<ShopAddress | null> => {
  const siteSettings = await siteSettingsRepository.findOne({
    where: { deletedAt: null },
  });

  if (!siteSettings || !siteSettings.shopAddresses) return null;

  return (
    siteSettings.shopAddresses.find((addr) => addr.isDefaultForTax) || null
  );
};

/**
 * Federated reference resolver for the Media entity.
 * Used by Apollo Federation to resolve media entities by ID from other subgraphs.
 *
 * @param id - ID of the media to resolve
 * @returns Resolved Media object or null
 */
export const ShopAddressData = {
  __resolveReference: async ({ id }) => {
    let addressData = await getShopAddressByIdFromRedis(id);

    if (!addressData) {
      // Fetch from DB by finding site settings containing this shop address ID
      const siteSettings = await siteSettingsRepository.findOne({
        where: { deletedAt: null },
      });

      if (!siteSettings || !siteSettings.shopAddresses) return null;

      const foundAddress = siteSettings.shopAddresses.find(
        (addr) => addr.id === id
      );
      if (!foundAddress) return null;

      addressData = {
        ...foundAddress,
      } as any;

      await setShopAddressByIdInRedis(id, addressData);
    }

    return addressData;
  },
};
