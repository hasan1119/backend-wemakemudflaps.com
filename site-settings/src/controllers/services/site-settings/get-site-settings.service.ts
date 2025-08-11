import { SiteSettings } from "../../../entities";
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
  search?: string
): Promise<{ data: ShopAddress[]; total: number }> => {
  const siteSettings = await siteSettingsRepository.findOne({
    where: { deletedAt: null },
  });

  if (!siteSettings || !siteSettings.shopAddresses) {
    return { data: [], total: 0 };
  }

  let addresses = siteSettings.shopAddresses;

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
