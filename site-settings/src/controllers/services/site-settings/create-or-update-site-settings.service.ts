import { v4 as uuidv4 } from "uuid";
import { SiteSettings } from "../../../entities";
import {
  MutationCreateOrUpdateSiteSettingArgs,
  SiteSettings as SiteSettingsType,
} from "../../../types";
import { siteSettingsRepository } from "../repositories/repositories";

/**
 * Creates or updates site settings in the database.
 *
 * @param data - Validated input data for site settings.
 * @param existingSettings - Existing site settings if any (for update).
 * @param userId - ID of the user performing the action.
 * @returns The created or updated SiteSettings entity.
 */
export const createOrUpdateSiteSettings = async (
  data: MutationCreateOrUpdateSiteSettingArgs,
  existingSettings: SiteSettingsType | SiteSettings | null | undefined,
  userId: string
): Promise<SiteSettings> => {
  let siteSettings;

  if (existingSettings) {
    siteSettings = {
      ...existingSettings,
      ...(data.name !== undefined && { name: data.name }),
      ...(data.metaData !== undefined && { metaData: data.metaData }),
      ...(data.favIcon !== undefined && { favIcon: data.favIcon }),
      ...(data.logo !== undefined && { logo: data.logo }),
      ...(data.contactNumbers !== undefined && {
        contactNumbers: data.contactNumbers,
      }),
      ...(data.contactEmails !== undefined && {
        contactEmails: data.contactEmails,
      }),
      ...(data.privacyPolicy !== undefined && {
        privacyPolicy: data.privacyPolicy,
      }),
      ...(data.termsAndConditions !== undefined && {
        termsAndConditions: data.termsAndConditions,
      }),
    };
  } else {
    // Create new site settings entity
    siteSettings = siteSettingsRepository.create({
      id: uuidv4(),
      createdBy: userId,
      ...data,
    });
  }

  // Save to database (create or update)
  await siteSettingsRepository.save(siteSettings);
  return siteSettings;
};
