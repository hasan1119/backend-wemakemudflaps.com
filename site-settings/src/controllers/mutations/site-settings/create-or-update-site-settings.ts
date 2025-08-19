import CONFIG from "../../../config/config";
import { Context } from "../../../context";
import {
  getSiteSettingsFromRedis,
  setSiteSettingsToRedis,
} from "../../../helper/redis";
import {
  CreateOrUpdateSiteSettingsResponseOrError,
  MutationCreateOrUpdateSiteSettingArgs,
} from "../../../types";
import { siteSettingsSchema } from "../../../utils/data-validation";
import {
  checkUserAuth,
  checkUserPermission,
  createOrUpdateSiteSettings as createOrUpdateSiteSettingsService,
  getSiteSettings,
} from "../../services";

/**
 * Mutation to create or update site settings.
 * Validates user authentication and permissions, validates input data,
 * and creates the site settings in the database.
 *
 * @param _ - Unused parent argument
 * @param args - Arguments containing site settings data
 * @param context - Context containing user information
 * @returns A response indicating success or failure of the operation
 */
export const createOrUpdateSiteSetting = async (
  _: any,
  args: MutationCreateOrUpdateSiteSettingArgs,
  { user }: Context
): Promise<CreateOrUpdateSiteSettingsResponseOrError> => {
  try {
    // Verify user authentication
    const authError = checkUserAuth(user);
    if (authError) return authError;

    // Check if site settings already exist
    let existingSettings;

    existingSettings = await getSiteSettingsFromRedis();
    if (!existingSettings) {
      existingSettings = await getSiteSettings();
      if (existingSettings) {
        // Cache in Redis for future use
        await setSiteSettingsToRedis(existingSettings);
      }
    }

    // Check if user has permission to create a site setting
    const hasPermission = await checkUserPermission({
      user,
      action: existingSettings ? "canUpdate" : "canCreate",
      entity: "site_settings",
    });

    if (!hasPermission) {
      return {
        statusCode: 403,
        success: false,
        message: `${
          existingSettings
            ? "You do not have permission to update site settings"
            : "You do not have permission to create site settings"
        }`,
        __typename: "BaseResponse",
      };
    }

    // Validate input data with Zod schema
    const result = await siteSettingsSchema
      .innerType()
      .omit({ shopAddress: true })
      .safeParseAsync(args);

    // Return detailed validation errors if input is invalid
    if (!result.success) {
      const errors = result.error.errors.map((e) => ({
        field: e.path.join("."),
        message: e.message,
      }));

      return {
        statusCode: 400,
        success: false,
        message: "Validation failed",
        errors,
        __typename: "ErrorResponse",
      };
    }

    // Create the site settings in the database
    const siteSettings = await createOrUpdateSiteSettingsService(
      result.data as any,
      existingSettings || undefined,
      user.id
    );

    const createdSiteSettings = {
      id: siteSettings.id,
      name: siteSettings.name,
      metaData: siteSettings.metaData,
      favIcon: siteSettings.favIcon as any,
      logo: siteSettings.logo as any,
      contactNumbers: siteSettings.contactNumbers,
      contactEmails: siteSettings.contactEmails,
      privacyPolicy: siteSettings.privacyPolicy,
      termsAndConditions: siteSettings.termsAndConditions,
      createdBy: siteSettings.createdBy as any,
      createdAt:
        siteSettings.createdAt instanceof Date
          ? siteSettings.createdAt.toISOString()
          : siteSettings.createdAt,
      deletedAt:
        siteSettings.deletedAt instanceof Date
          ? siteSettings.deletedAt.toISOString()
          : siteSettings.deletedAt,
    };

    await setSiteSettingsToRedis(createdSiteSettings);

    return {
      statusCode: 201,
      success: true,
      message: "Site Settings created successfully",
      siteSettings: createdSiteSettings,
      __typename: "SiteSettingsResponse",
    };
  } catch (error: any) {
    console.error("Error creating site settings:", error);
    return {
      statusCode: 500,
      success: false,
      message:
        CONFIG.NODE_ENV === "production"
          ? "Something went wrong, please try again."
          : error.message || "Internal server error",
      __typename: "BaseResponse",
    };
  }
};
