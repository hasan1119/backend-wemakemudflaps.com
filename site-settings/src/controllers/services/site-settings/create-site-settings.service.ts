import { SiteSettings } from "../../../entities";
import { MutationCreateSiteSettingArgs } from "../../../types";
import { siteSettingsRepository } from "../repositories/repositories";

/**
 * Creates a new SiteSettings.
 *
 * Workflow:
 * 1. Validates and prepares site settings creation input.
 * 2. Creates the site settings with provided values.
 *
 * @param data - Input data for creating the site settings.
 * @returns Created SiteSettings entity.
 */
export const createSiteSettings = async (
  data: MutationCreateSiteSettingArgs,
  userId: string
): Promise<SiteSettings> => {
  const siteSettings = siteSettingsRepository.create({
    ...data,
    createdBy: userId,
  });

  return await siteSettingsRepository.save(siteSettings);
};
