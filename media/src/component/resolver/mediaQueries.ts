import { getAllMedias, getMediaById } from "../../controllers";
import { resolveMediaReference } from "../../controllers/services";

/**
 * Defines GraphQL query resolvers for media-related operations.
 *
 * Workflow:
 * 1. Maps query fields to controller functions for fetching media data.
 * 2. Supports retrieval of individual media files and aggregated media lists.
 * 3. Enables access to detailed media metadata and creator references.
 */
export const mediaQueriesResolver = {
  Query: {
    /**
     * Retrieves detailed information for a media file by its unique ID.
     */
    getMediaById,

    /**
     * Fetches a paginated list of all media files available in the system.
     */
    getAllMedias,
  },

  Media: {
    /**
     * Resolver for federated reference to the `Media` entity,
     * allowing other subgraphs to fetch user data by ID.
     */
    __resolveReference: resolveMediaReference,

    /**
     * Resolver for federated reference to the `CreatedBy` entity,
     * allowing other subgraphs to fetch media creator data by ID.
     */
    createdBy: ({ createdBy }) => {
      return {
        __typename: "CreatedBy",
        id: createdBy, // Just references the creator's unique ID.
      };
    },
  },
};
