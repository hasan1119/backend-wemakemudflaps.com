import {
  FAQ,
  Newsletter,
  PopupBanner,
  PrivacyPolicy,
  SiteSettings,
  TermAndCondition,
} from "../../../entities";
import { AppDataSource } from "../../../helper";

/**
 * Initializes repository for FAQ entity.
 *
 * Workflow:
 * 1. Retrieves the FAQ repository from AppDataSource for database operations.
 */
export const faqRepository = AppDataSource.getRepository(FAQ);

/**
 * Initializes repository for Newsletter entity.
 *
 * Workflow:
 * 1. Retrieves the Newsletter repository from AppDataSource for database operations.
 */
export const newsletterRepository = AppDataSource.getRepository(Newsletter);

/**
 * Initializes repository for PopupBanner entity.
 *
 * Workflow:
 * 1. Retrieves the PopupBanner repository from AppDataSource for database operations.
 */
export const popupBannerRepository = AppDataSource.getRepository(PopupBanner);

/**
 * Initializes repository for PrivacyPolicy entity.
 *
 * Workflow:
 * 1. Retrieves the PrivacyPolicy repository from AppDataSource for database operations.
 */
export const privacyPolicyRepository =
  AppDataSource.getRepository(PrivacyPolicy);

/**
 * Initializes repository for SiteSettings entity.
 *
 * Workflow:
 * 1. Retrieves the SiteSettings repository from AppDataSource for database operations.
 */
export const siteSettingsRepository = AppDataSource.getRepository(SiteSettings);

/**
 * Initializes repository for TermAndCondition entity.
 *
 * Workflow:
 * 1. Retrieves the TermAndCondition repository from AppDataSource for database operations.
 */
export const termAndConditionRepository =
  AppDataSource.getRepository(TermAndCondition);
