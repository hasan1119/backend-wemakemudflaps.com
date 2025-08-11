import { v4 as uuid } from "uuid";
import { SiteSettings } from "../../../entities";
import { MutationUpdateSiteSettingArgs } from "../../../types";
import { siteSettingsRepository } from "../repositories/repositories";
import { getSiteSettings } from "./get-site-settings.service";

/**
 * Updates the existing site settings with the provided data.
 *
 * Workflow:
 * 1. Updates the site settings with provided values.
 * 2. For shopAddresses, maps input data to the entity structure, generating UUIDs for new addresses.
 *
 * @param siteSettings - The existing SiteSettings entity to update.
 * @param data - Input data for updating the site settings.
 * @return Updated SiteSettings entity.
 */
export const updateSiteSettings = async (
  siteSettings: SiteSettings,
  data: MutationUpdateSiteSettingArgs
) => {
  await siteSettingsRepository.update(siteSettings.id, {
    ...(data.name !== undefined && {
      name: data.name,
    }),
    ...(data.metaData !== undefined && {
      metaData: data.metaData,
    }),
    ...(data.favIcon !== undefined && {
      favIcon: data.favIcon,
    }),
    ...(data.logo !== undefined && {
      logo: data.logo,
    }),
    ...(data.contactNumber !== undefined && {
      contactNumber: data.contactNumber,
    }),
    ...(data.contactEmail !== undefined && {
      contactEmail: data.contactEmail,
    }),
    ...(data.shopAddresses !== undefined && {
      shopAddresses:
        data.shopAddresses?.map((address) => ({
          id: address.id || uuid(), // Generate UUID if not provided
          brunchName: address.brunchName,
          addressLine1: address.addressLine1,
          addressLine2: address.addressLine2,
          emails:
            address.emails?.map((email) => ({
              type: email.type,
              email: email.email,
            })) || [],
          phones:
            address.phones?.map((phone) => ({
              type: phone.type,
              number: phone.number,
            })) || [],
          city: address.city,
          state: address.state,
          country: address.country,
          zipCode: address.zipCode,
          direction: address.direction,
        })) || [],
    }),
    ...(data.privacyPolicy !== undefined && {
      privacyPolicy: data.privacyPolicy,
    }),
    ...(data.termsAndConditions !== undefined && {
      termsAndConditions: data.termsAndConditions,
    }),
  });

  return await getSiteSettings();
};
