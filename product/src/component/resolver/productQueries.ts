import {
  getAllBrands,
  getAllBrandsForCustomers,
  getAllCategories,
  getAllCategoriesForCustomers,
  getAllCoupons,
  getAllProductAttribute,
  getAllProducts,
  getAllProductsForCustomer,
  getAllShippingClass,
  getAllShippingMethods,
  getAllShippingZones,
  getAllTags,
  getAllTagsForCustomers,
  getAllTaxClass,
  getAllTaxRates,
  getBrandById,
  getCart,
  getCategoryById,
  getCouponById,
  getProductAttributeById,
  getProductById,
  getProductBySlugForCustomer,
  getShippingClassById,
  getShippingMethodById,
  getShippingZoneById,
  getTagById,
  getTaxClassById,
  getTaxOptions,
  getTaxRateById,
  getWishlist,
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
  "Coupon",
  "Tag",
  "TagPaginationDataSession",
  "ShippingClass",
  "ShippingClassPaginationDataSession",
  "TaxClass",
  "TaxRate",
  "TaxRateSession",
  "TaxClassPaginationDataSession",
  "TaxOptions",
  "Product",
  "ProductPaginationDataSession",
  "Category",
  "CategoryPaginationDataSession",
  "ShippingMethod",
  "ShippingZone",
  "FlatRate",
  "FreeShipping",
  "LocalPickUp",
  "Ups",
  "ProductAttribute",
  "Cart",
  "Wishlist",
];

// List of types that use the thumbnail field
const typesWithThumbnail = [
  "Brand",
  "BrandPaginationDataSession",
  "Category",
  "CategoryPaginationDataSession",
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
  "CartItems",
  "WishlistItems",
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
     * Retrieves detailed information for a product attribute by their unique ID.
     */
    getProductAttributeById,

    /**
     * Fetches a paginated list of all product attributes in the system.
     */
    getAllProductAttribute,

    /**
     * Retrieves detailed information for a product by their unique ID.
     */
    getProductById,

    /**
     * Retrieves detailed information for a product by their unique ID, tailored for customer view.
     */
    getProductBySlugForCustomer,

    /**
     * Fetches a paginated list of all products in the system.
     */
    getAllProducts,

    /**
     * Fetches a paginated list of all products in the system, tailored for customer view.
     */
    getAllProductsForCustomer,

    /**
     * Retrieves detailed information for a category by their unique ID.
     */
    getCategoryById,

    /**
     * Fetches a paginated list of all categories in the system.
     */
    getAllCategories,

    /**
     * Fetches a paginated list of all categories in the system, tailored for customer view.
     */
    getAllCategoriesForCustomers,

    /**
     * Retrieves detailed information for a tag by their unique ID.
     */
    getTagById,

    /**
     * Fetches a paginated list of all tags in the system.
     */
    getAllTags,

    /**
     * Fetches a paginated list of all tags in the system, tailored for customer view.
     */
    getAllTagsForCustomers,

    /**
     * Retrieves detailed information for a brand by their unique ID.
     */
    getBrandById,

    /**
     * Fetches a paginated list of all brands in the system.
     */
    getAllBrands,

    /**
     * Fetches a paginated list of all brands in the system, tailored for customer view.
     */
    getAllBrandsForCustomers,

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

    /**
     * Retrieves a shipping zone by its ID, along with all related shipping zone and their details.
     */
    getShippingZoneById,

    /**
     * Fetches a paginated list of all shipping zones in the system.
     */
    getAllShippingZones,

    /**
     * Retrieves a shipping method by its ID, along with all related shipping method and their details.
     */
    getShippingMethodById,

    /**
     * Fetches a paginated list of all shipping methods in the system.
     */
    getAllShippingMethods,

    /**
     * Retrieves detailed information for a tax option by their unique ID.
     */
    getTaxOptions,

    /**
     * Retrieves a coupon by its ID, along with all related coupon and their details.
     */
    getCouponById,

    /**
     * Fetches a paginated list of all coupons in the system.
     */
    getAllCoupons,

    /**
     * Retrieves the current user's cart, including items and metadata.
     */
    getCart,

    /**
     * Retrieves the current user's wishlist, including items and metadata.
     */
    getWishlist,
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
