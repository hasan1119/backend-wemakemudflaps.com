/**
 * Exports GraphQL mutations for managing site settings.
 *
 * Workflow:
 * 1. Provides mutations for creating new site settings.
 * 2. Enables updating existing site settings.
 * 3. Supports retrieval of site settings.
 */
export { createSiteSetting } from "./mutations/site-settings/create-site-settings";
export { updateSiteSetting } from "./mutations/site-settings/update-site-settings";
export { getSiteSettings } from "./queries/site-settings/get-site-settings";
