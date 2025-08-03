import CONFIG from "../../../config/config";
import { Context } from "../../../context";
import {
  getSiteSettingsFromRedis,
  setSiteSettingsToRedis,
} from "../../../helper/redis";
import {
  MutationUpdateBrandArgs,
  UpdateSiteSettingsResponseOrError,
} from "../../../types";
import { siteSettingsSchema } from "../../../utils/data-validation";
import {
  checkUserAuth,
  checkUserPermission,
  getSiteSettings,
  updateSiteSettings as updateSiteSettingService,
} from "../../services";

/**
 * Mutation to update site settings.
 * Validates user authentication and permissions, validates input data,
 * and updates the site settings in the database.
 *
 * @param _ - Unused parent argument
 * @param args - Arguments containing site settings data
 * @param context - Context containing user information
 * @returns A response indicating success or failure of the operation
 */
export const updateSiteSetting = async (
  _: any,
  args: MutationUpdateBrandArgs,
  { user }: Context
): Promise<UpdateSiteSettingsResponseOrError> => {
  try {
    // Verify user authentication
    const authError = checkUserAuth(user);
    if (authError) return authError;

    // Check if user has permission to update a site setting
    const hasPermission = await checkUserPermission({
      user,
      action: "canUpdate",
      entity: "site_settings",
    });

    if (!hasPermission) {
      return {
        statusCode: 403,
        success: false,
        message: "You do not have permission to update site settings",
        __typename: "BaseResponse",
      };
    }

    // Validate input data with Zod schema
    const result = await siteSettingsSchema.safeParseAsync(args);

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

    // Check if site settings already exist
    let existingSiteSettings;

    existingSiteSettings = await getSiteSettingsFromRedis();

    if (!existingSiteSettings) {
      // If not found in Redis, check the database
      existingSiteSettings = await getSiteSettings();

      if (!existingSiteSettings) {
        return {
          statusCode: 400,
          success: false,
          message: "Site settings do not exist",
          __typename: "BaseResponse",
        };
      }
    }

    // Update the site settings in the database
    const siteSettings = await updateSiteSettingService(
      existingSiteSettings,
      result.data
    );

    const updatedSiteSettings = {
      id: siteSettings.id,
      name: siteSettings.name,
      metaData: siteSettings.metaData,
      favIcon: siteSettings.favIcon as any,
      logo: siteSettings.logo as any,
      contactNumber: siteSettings.contactNumber,
      contactEmail: siteSettings.contactEmail,
      shopAddress: siteSettings.shopAddress,
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

    // Update the site settings in Redis
    await setSiteSettingsToRedis(updatedSiteSettings);

    return {
      statusCode: 200,
      success: true,
      message: "Site Settings updated successfully",
      siteSettings: updatedSiteSettings,
      __typename: "SiteSettingsResponse",
    };
  } catch (error: any) {
    console.error("Error updating site settings:", error);
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
