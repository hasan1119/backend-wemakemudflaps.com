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
