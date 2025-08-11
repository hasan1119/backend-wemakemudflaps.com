/**
 * Exports GraphQL mutations for managing site settings.
 *
 * Workflow:
 * 1. Provides mutations for creating new site settings.
 * 2. Enables updating existing site settings.
 * 3. Supports retrieval of site settings.
 */
export { createOrUpdateShopAddress } from "./mutations/site-settings/create-or-update-shop-address";
export { createSiteSetting } from "./mutations/site-settings/create-site-settings";
export { updateSiteSetting } from "./mutations/site-settings/update-site-settings";
export { getShopAddresses } from "./queries/site-settings/get-shop-addresses";
export { getSiteSettings } from "./queries/site-settings/get-site-settings";

/**
 * Exports GraphQL queries for managing FAQs.
 *
 * Workflow:
 * 1. Provides queries for retrieving FAQs by ID.
 * 2. Supports fetching all FAQs with pagination and sorting.
 */
export { getFaqById } from "./queries/faq/get-faq-by-id";
export { getAllFaqs } from "./queries/faq/get-faqs";

/**
 * Exports GraphQL mutations for managing FAQs.
 *
 * Workflow:
 * 1. Provides mutations for creating new FAQs.
 * 2. Enables deletion of FAQs.
 * 3. Supports updating existing FAQs.
 */
export { createFaq } from "./mutations/faq/create-faq";
export { deleteFaqs } from "./mutations/faq/delete-faqs";
export { updateFaq } from "./mutations/faq/update-faq";
