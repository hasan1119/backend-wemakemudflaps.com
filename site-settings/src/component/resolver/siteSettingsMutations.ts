import {
  createFaq,
  createSiteSetting,
  deleteFaqs,
  updateFaq,
  updateSiteSetting,
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
     * Creates site settings.
     */
    createSiteSetting,

    /**
     * Updates existing site settings.
     */
    updateSiteSetting,

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
