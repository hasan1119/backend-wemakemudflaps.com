import { getAllFaqs, getFaqById, getSiteSettings } from "../../controllers";

/**
 * Shared resolver function for federated `CreatedBy` references.
 * Returns a reference to the `CreatedBy` entity using the `createdBy` ID.
 */
const resolveCreatedBy = ({ createdBy }) => {
  if (!createdBy) return null;
  return {
    __typename: "CreatedBy",
    id: createdBy,
  };
};

/**
 * Shared resolver function for federated `thumbnail, images, videos and so on` references.
 * Returns a reference to the `Media` entity using the `media` ID.
 */
const resolveFavIcon = ({ favIcon }) => {
  if (!favIcon) return null;
  return {
    __typename: "Media",
    id: favIcon,
  };
};

/**
 * Shared resolver function for federated `Media` references (images, videos, etc.).
 * Returns a reference to the `Media` entity using the provided media ID.
 */
const resolveLogo = ({ logo }) => {
  if (!logo) return null;
  return {
    __typename: "Media",
    id: logo,
  };
};

// List of types that use the `resolveCreatedBy` resolver
const typesWithCreatedBy = ["SiteSettings", "Faq"];

// List of types that use the favIcon field
const typesWithFavIcon = ["SiteSettings"];

// List of types that use the logo field
const typesWithLogo = ["SiteSettings"];

/**
 * Defines GraphQL query resolvers for product-related operations.
 *
 * Workflow:
 * 1. Maps query fields to controller functions for fetching product data.
 * 2. Supports retrieval of individual product and aggregated product lists.
 * 3. Enables access to detailed product metadata and creator references.
 */
export const siteSettingsQueriesResolver = {
  Query: {
    /**
     * Retrieves the site settings.
     */
    getSiteSettings,

    /**
     * Retrieves all FAQs.
     */
    getAllFaqs,

    /**
     * Retrieves a specific FAQ by its ID.
     */
    getFaqById,
  },

  // Dynamically assign resolvers for createdBy and thumbnail
  ...Object.fromEntries(
    [
      ...new Set([
        ...typesWithCreatedBy,
        ...typesWithFavIcon,
        ...typesWithLogo,
      ]),
    ].map((type) => [
      type,
      {
        ...(typesWithCreatedBy.includes(type) && {
          createdBy: resolveCreatedBy,
        }),
        ...(typesWithFavIcon.includes(type) && {
          favIcon: resolveFavIcon,
        }),
        ...(typesWithLogo.includes(type) && {
          logo: resolveLogo,
        }),
      },
    ])
  ),
};
