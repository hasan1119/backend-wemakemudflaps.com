import { getProduct } from "../../controllers/queries/product/get-product";

/**
 * Defines GraphQL query resolvers for product-related operations.
 *
 * Workflow:
 * 1. Maps query fields to controller functions for fetching product data.
 * 2. Supports retrieval of individual product and aggregated product lists.
 * 3. Enables access to detailed product metadata and creator references.
 */
export const productQueriesResolver = {
  Query: {
    getProduct,
  },

  Product: {
    /**
     * Resolver for federated reference to the `CreatedBy` entity,
     * allowing other subgraphs to fetch product creator data by ID.
     */
    createdBy: ({ createdBy }) => {
      return {
        __typename: "CreatedBy",
        id: createdBy, // Just references the creator's unique ID.
      };
    },
  },
  Category: {
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
  SubCategory: {
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
