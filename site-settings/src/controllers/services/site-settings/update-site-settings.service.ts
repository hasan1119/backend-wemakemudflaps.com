import { SiteSettings } from "../../../entities";
import { MutationUpdateSiteSettingArgs } from "../../../types";
import { siteSettingsRepository } from "../repositories/repositories";
import { getSiteSettings } from "./get-site-settings.service";

/**
 * Updates the existing site settings with the provided data.
 *
 * Workflow:
 * 1. Updates the site settings with provided values.
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
    ...(data.shopAddress !== undefined && {
      shopAddress: {
        ...(data.shopAddress.addressLine1 !== undefined && {
          addressLine1: data.shopAddress.addressLine1,
        }),
        ...(data.shopAddress.addressLine2 !== undefined && {
          addressLine2: data.shopAddress.addressLine2,
        }),
        ...(data.shopAddress.city !== undefined && {
          city: data.shopAddress.city,
        }),
        ...(data.shopAddress.zipCode !== undefined && {
          zipCode: data.shopAddress.zipCode,
        }),
        ...(data.shopAddress.state !== undefined && {
          state: data.shopAddress.state,
        }),
        ...(data.shopAddress.country !== undefined && {
          country: data.shopAddress.country,
        }),
      },
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
