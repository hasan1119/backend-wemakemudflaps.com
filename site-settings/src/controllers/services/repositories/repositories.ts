import { FAQ, Newsletter, SiteSettings } from "../../../entities";
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
 * Initializes repository for SiteSettings entity.
 *
 * Workflow:
 * 1. Retrieves the SiteSettings repository from AppDataSource for database operations.
 */
export const siteSettingsRepository = AppDataSource.getRepository(SiteSettings);
