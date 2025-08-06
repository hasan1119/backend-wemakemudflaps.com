import CONFIG from "../../../config/config";
import { Context } from "../../../context";
import {
  getSiteSettingsFromRedis,
  setSiteSettingsToRedis,
} from "../../../helper/redis";
import { GetSiteSettingsResponseOrError } from "../../../types";
import { getSiteSettings as getSiteSettingsService } from "../../services";

/**
 * Handles the retrieval of site settings.
 *
 * @param _ - Unused parent argument.
 * @param __ - Unused arguments.
 * @param context - Context containing user information.
 * @returns Response containing site settings or an error message.
 */
export const getSiteSettings = async (
  _: any,
  __: any,
  { user }: Context
): Promise<GetSiteSettingsResponseOrError> => {
  try {
    // Check if site settings already exist
    let existingSettings;

    existingSettings = await getSiteSettingsFromRedis();
    if (!existingSettings) {
      existingSettings = await getSiteSettingsService();
      if (existingSettings) {
        // Cache in Redis for future use
        await setSiteSettingsToRedis(existingSettings);
      }
    }

    if (!existingSettings) {
      return {
        statusCode: 409,
        success: false,
        message: "Site settings doesn't exist",
        __typename: "BaseResponse",
      };
    }

    const siteSettings = existingSettings;

    return {
      statusCode: 200,
      success: true,
      message: "Site settings fetched successfully",
      siteSettings: {
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
      },
      __typename: "SiteSettingsResponse",
    };
  } catch (error: any) {
    console.error("Error fetching site settings:", {
      message: error.message,
    });

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
