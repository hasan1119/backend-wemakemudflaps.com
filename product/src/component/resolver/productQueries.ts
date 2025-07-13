import {
  getAllBrands,
  getAllCategories,
  getAllProducts,
  getAllShippingClass,
  getAllTags,
  getAllTaxClass,
  getAllTaxRates,
  getBrandById,
  getCategoryById,
  getProductById,
  getShippingClassById,
  getTagById,
  getTaxClassById,
  getTaxRateById,
} from "../../controllers";

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
const resolveThumbnail = ({ thumbnail }) => {
  if (!thumbnail) return null;
  return {
    __typename: "Media",
    id: thumbnail,
  };
};

/**
 * Shared resolver function for federated `Media` references (images, videos, etc.).
 * Returns a reference to the `Media` entity using the provided media ID.
 */
const resolveMedia = (mediaId) => {
  if (!mediaId) return null;
  return {
    __typename: "Media",
    id: mediaId,
  };
};

// List of types that use the `resolveCreatedBy` resolver
const typesWithCreatedBy = [
  "Brand",
  "BrandPaginationDataSession",
  "Tag",
  "TagPaginationDataSession",
  "ShippingClass",
  "ShippingClassPaginationDataSession",
  "TaxClass",
  "TaxRate",
  "TaxClassPaginationDataSession",
  "Product",
  "ProductPaginationDataSession",
  "Category",
  "ICategoryBase",
  "CategoryPaginationDataSession",
];

// List of types that use the thumbnail field
const typesWithThumbnail = [
  "Brand",
  "BrandPaginationDataSession",
  "Category",
  "CategoryDataResponse",
  "SubCategory",
  "SubCategoryDataResponse",
  "CategoryDataResponseById",
  "SubCategoryDataResponseById",
];

// List of types that use the media fields (defaultImage, images, videos)
const typesWithMedia = [
  "Product",
  "ProductVariation",
  "ProductPaginationDataSession",
];

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
    /**
     * Retrieves detailed information for a product by their unique ID.
     */
    getProductById,

    /**
     * Fetches a paginated list of all products in the system.
     */
    getAllProducts,

    /**
     * Retrieves detailed information for a category by their unique ID.
     */
    getCategoryById,

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

    /**
     * Fetches a paginated list of all tax rates in the system.
     */
    getAllTaxRates,

    /**
     * Retrieves detailed information for a tax rate by their unique ID.
     */
    getTaxRateById,
  },

  // Dynamically assign resolvers for createdBy and thumbnail
  ...Object.fromEntries(
    [
      ...new Set([
        ...typesWithCreatedBy,
        ...typesWithThumbnail,
        ...typesWithMedia,
      ]),
    ].map((type) => [
      type,
      {
        ...(typesWithCreatedBy.includes(type) && {
          createdBy: resolveCreatedBy,
        }),
        ...(typesWithThumbnail.includes(type) && {
          thumbnail: resolveThumbnail,
        }),
        ...(typesWithMedia.includes(type) && {
          defaultImage: (parent) => resolveMedia(parent.defaultImage),
          images: (parent) => parent.images?.map(resolveMedia),
          videos: (parent) => parent.videos?.map(resolveMedia),
        }),
      },
    ])
  ),
};
