/**
 * Exports service for verifying user authentication status.
 *
 * Workflow:
 * 1. Provides a function to check if a user is authenticated.
 */
export { checkUserAuth } from "./session-check/session-check";

/**
 * Exports services for managing permissions for media access.
 *
 * Workflow:
 * 1. Provides a function to check if a user has permission to access media.
 */
export { checkUserPermission } from "./permission/get-user-permission.service";

/**
 * Exports service for retrieving site settings.
 *
 * Workflow:
 * 1. Provides a function to fetch the first site settings, including shop addresses.
 */
export {
  getShopAddresses,
  getSiteSettings,
} from "./site-settings/get-site-settings.service";

/**
 * Exports service for creating new site settings.
 *
 * Workflow:
 * 1. Provides a function to create a new SiteSettings entity with the provided data.
 */
export { createOrUpdateSiteSettings } from "./site-settings/create-or-update-site-settings.service";

/**
 * Exports service for creating or updating shop addresses.
 *
 * Workflow:
 * 1. Provides a function to create a new shop address or update an existing one.
 */
export { createOrUpdateShopAddress } from "./site-settings/create-or-update-shop-address.service";

/**
 * Exports services for managing FAQs.
 *
 * Workflow:
 * 1. Provides functions to create, update, delete, and retrieve FAQs.
 */
export { createFaq } from "./faq/create-faq.service";
export { hardDeleteFaq } from "./faq/delete-faq.service";
export { getFaqById, getFaqsByIds, paginateFaqs } from "./faq/get-faq.service";
export { updateFaq } from "./faq/update-faq.service";
