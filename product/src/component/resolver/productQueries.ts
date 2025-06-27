import {
  getAllCategories,
  getCategoryById,
  getSubCategoryById,
  getTagById,
} from "../../controllers";
import { getProduct } from "../../controllers/queries/product/get-product";

/**
 * Shared resolver function for federated `CreatedBy` references.
 * Returns a reference to the `CreatedBy` entity using the `createdBy` ID.
 */
const resolveCreatedBy = ({ createdBy }: { createdBy: string }) => ({
  __typename: "CreatedBy",
  id: createdBy,
});

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

    /**
     * Retrieves detailed information for a category by their unique ID.
     */
    getCategoryById,

    /**
     * Retrieves detailed information for a sub category by their unique ID.
     */
    getSubCategoryById,

    /**
     * Fetches a paginated list of all categories in the system.
     */
    getAllCategories,

    /**
     * Retrieves detailed information for a tag by their unique ID.
     */
    getTagById,
  },

  // Reuse resolveCreatedBy for all applicable types
  Tag: { createdBy: resolveCreatedBy },
  Product: { createdBy: resolveCreatedBy },
  Category: { createdBy: resolveCreatedBy },
  CategoryDataResponse: { createdBy: resolveCreatedBy },
  SubCategory: { createdBy: resolveCreatedBy },
  SubCategoryDataResponse: { createdBy: resolveCreatedBy },
};
