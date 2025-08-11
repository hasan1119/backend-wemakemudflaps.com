import {
  createFaq,
  createOrUpdateShopAddress,
  createOrUpdateSiteSetting,
  deleteFaqs,
  updateFaq,
} from "../../controllers";

/**
 * Defines GraphQL mutation resolvers for site settings related operations.
 *
 * Workflow:
 * 1. Maps mutation fields to controller functions for site settings management.
 * 2. Handles site settings create, updates, deletions, and restorations.
 * 3. Ensures efficient site settings lifecycle management through structured mutations.
 */
export const siteSettingsMutationsResolver = {
  Mutation: {
    /**
     * Create or update site settings.
     */
    createOrUpdateSiteSetting,

    /**
     * Creates or updates a shop address.
     */
    createOrUpdateShopAddress,

    /**
     * Creates a new FAQ entry.
     */
    createFaq,

    /**
     * Deletes existing FAQs.
     */
    deleteFaqs,

    /**
     * Updates an existing FAQ entry.
     */
    updateFaq,
  },
};
