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
  const siteSettings = await siteSettingsRepository.find();
  return siteSettings[0] || null;
};
