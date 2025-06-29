import {
  getAllBrands,
  getAllCategories,
  getAllShippingClass,
  getAllTags,
  getAllTaxClass,
  getBrandById,
  getCategoryById,
  getShippingClassById,
  getSubCategoryById,
  getTagById,
  getTaxClassById,
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

    /**
     * Fetches a paginated list of all tags in the system.
     */
    getAllTags,

    /**
     * Retrieves detailed information for a brand by their unique ID.
     */
    getBrandById,

    /**
     * Fetches a paginated list of all brands in the system.
     */
    getAllBrands,

    /**
     * Retrieves detailed information for a shipping class by their unique ID.
     */
    getShippingClassById,

    /**
     * Fetches a paginated list of all shipping classes in the system.
     */
    getAllShippingClass,

    /**
     * Retrieves detailed information for a tax class by their unique ID.
     */
    getTaxClassById,

    /**
     * Fetches a paginated list of all tax classes in the system.
     */
    getAllTaxClass,
  },

  // Reuse resolveCreatedBy for all applicable types
  Brand: { createdBy: resolveCreatedBy },
  BrandPaginationDataSession: { createdBy: resolveCreatedBy },
  Tag: { createdBy: resolveCreatedBy },
  TagPaginationDataSession: { createdBy: resolveCreatedBy },
  ShippingClass: { createdBy: resolveCreatedBy },
  ShippingClassPaginationDataSession: { createdBy: resolveCreatedBy },
  TaxClass: { createdBy: resolveCreatedBy },
  TaxClassPaginationDataSession: { createdBy: resolveCreatedBy },
  Product: { createdBy: resolveCreatedBy },
  Category: { createdBy: resolveCreatedBy },
  CategoryDataResponse: { createdBy: resolveCreatedBy },
  SubCategory: { createdBy: resolveCreatedBy },
  SubCategoryDataResponse: { createdBy: resolveCreatedBy },
};
