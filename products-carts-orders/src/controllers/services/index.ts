/**
 * Exports service for verifying user authentication status.
 *
 * Workflow:
 * 1. Provides a function to check if a user is authenticated.
 */
export { checkUserAuth } from "./session-check/session-check";

/**
 * Exports services for managing permissions for media access.
 *
 * Workflow:
 * 1. Provides a function to check if a user has permission to access media.
 */
export { checkUserPermission } from "./permission/get-user-permission.service";

/**
 * Exports services for managing product attributes.
 *
 * Workflow:
 * 1. Provides functions to retrieve product attributes by ID or multiple IDs.
 */
export {
  findAttributeByName,
  findAttributeBySlug,
  findSystemAttributeByName,
  findSystemAttributeByNameToUpdate,
  findSystemAttributeBySlug,
  findSystemAttributeBySlugToUpdate,
  getProductAttributeById,
  getProductAttributesByIds,
  getProductAttributeValuesByIds,
  paginateSystemProductAttributes,
} from "./product-attribute/get-product-attribute.service";

/**
 * Exports services for creating product attributes.
 *
 * Workflow:
 * 1. Provides a function to create a product attribute based on input.
 */
export {
  createAttributeWithValues,
  createSystemAttributeWithValues,
} from "./product-attribute/create-product-attribute.service";

/**
 * Exports services for deleting product attributes.
 *
 * Workflow:
 * 1. Provides functions for hard deleting entities.
 */
export { hardDeleteAttribute } from "./product-attribute/delete-product-attribute.service";

/**
 * Exports services for updating product attributes.
 *
 * Workflow:
 * 1. Provides functions to update basic fields (name, slug, values).
 */
export { updateAttributeWithValues } from "./product-attribute/update-product-attribute.service";

/**
 * Exports services for creating categories and subcategories.
 *
 * Workflow:
 * 1. Provides a function to create either a Category or SubCategory based on input.
 * 2. Handles nested subcategory creation and position ordering.
 */
export { createCategoryOrSubCategory } from "./category/create-category.service";

/**
 * Exports services for deleting categories and subcategories.
 *
 * Workflow:
 * 1. Provides functions for soft deleting (skip to trash) and hard deleting entities.
 * 2. Handles position reordering after deletion.
 * 3. Checks for product associations before allowing deletion.
 */
export {
  hardDeleteCategory,
  softDeleteCategory,
} from "./category/delete-category.service";

/**
 * Exports services for fetching and counting categories and subcategories.
 *
 * Workflow:
 * 1. Provides counting of categories matching optional search criteria.
 * 2. Provides functions to fetch category or subcategory by ID/name with relations.
 * 3. Supports paginated retrieval of categories including their subcategories.
 */
export {
  countProductsForCategory,
  findCategoryByNameOrSlug,
  findCategoryByNameOrSlugToUpdateScoped,
  getCategoryById,
  getCategoryByIds,
  paginateCategories,
} from "./category/get-category.service";

/**
 * Exports service for restoring soft-deleted categories and subcategories by ID.
 *
 * Workflow:
 * 1. Allows restoring entities by clearing their deletedAt timestamp.
 * 2. Automatically detects whether the entity is category or subcategory.
 */
export { restoreCategoriesByIds } from "./category/restore-category.service";

/**
 * Exports services for updating categories and subcategories.
 *
 * Workflow:
 * 1. Provides functions to update basic fields (name, description, thumbnail).
 */
export {
  updateCategory,
  updatePosition,
} from "./category/update-category.service";

/**
 * Exports services for creating tag.
 *
 * Workflow:
 * 1. Provides a function to create either a tag based on input.
 */
export { createTag } from "./tag/create-tag.service";

/**
 * Exports services for deleting tags.
 *
 * Workflow:
 * 1. Provides functions for soft deleting (skip to trash) and hard deleting entities.
 */
export { hardDeleteTag, softDeleteTag } from "./tag/delete-tag.service";

/**
 * Exports services for fetching and counting tags.
 *
 * Workflow:
 * 1. Provides counting of tags matching optional search criteria.
 * 2. Provides functions to fetch tag by ID/name with relations.
 * 3. Supports paginated retrieval of tags.
 */
export {
  countProductsForTag,
  findTagByName,
  findTagByNameToUpdate,
  findTagBySlug,
  findTagBySlugToUpdate,
  getTagById,
  getTagsByIds,
  paginateTags,
} from "./tag/get-tag.service";

/**
 * Exports service for restoring soft-deleted tags by ID.
 *
 * Workflow:
 * 1. Allows restoring entities by clearing their deletedAt timestamp.
 */
export { restoreTag } from "./tag/restore-tag.service";

/**
 * Exports services for updating categories and subcategories.
 *
 * Workflow:
 * 1. Provides functions to update basic fields (name, slug).
 */
export { updateTag } from "./tag/update-tag.service";

/**
 * Exports services for creating brand.
 *
 * Workflow:
 * 1. Provides a function to create either a brand based on input.
 */
export { createBrand } from "./brand/create-brand.service";

/**
 * Exports services for deleting brands.
 *
 * Workflow:
 * 1. Provides functions for soft deleting (skip to trash) and hard deleting entities.
 */
export { hardDeleteBrand, softDeleteBrand } from "./brand/delete-brand.service";

/**
 * Exports services for fetching and counting brands.
 *
 * Workflow:
 * 1. Provides counting of brands matching optional search criteria.
 * 2. Provides functions to fetch brand by ID/name with relations.
 * 3. Supports paginated retrieval of brands.
 */
export {
  countProductsForBrand,
  findBrandByName,
  findBrandByNameToUpdate,
  findBrandBySlug,
  findBrandBySlugToUpdate,
  getBrandById,
  getBrandsByIds,
  paginateBrands,
} from "./brand/get-brand.service";

/**
 * Exports service for restoring soft-deleted brands by ID.
 *
 * Workflow:
 * 1. Allows restoring entities by clearing their deletedAt timestamp.
 */
export { restoreBrand } from "./brand/restore-brand.service";

/**
 * Exports services for updating categories and subcategories.
 *
 * Workflow:
 * 1. Provides functions to update basic fields (name, slug).
 */
export { updateBrand } from "./brand/update-brand.service";

/**
 * Exports services for creating shipping class.
 *
 * Workflow:
 * 1. Provides a function to create either a shipping class based on input.
 */
export { createShippingClass } from "./shipping-class/create-shipping-class.service";

/**
 * Exports services for deleting shipping classes.
 *
 * Workflow:
 * 1. Provides functions for soft deleting (skip to trash) and hard deleting entities.
 */
export {
  hardDeleteShippingClass,
  softDeleteShippingClass,
} from "./shipping-class/delete-shipping-class.service";

/**
 * Exports services for fetching and counting shipping class.
 *
 * Workflow:
 * 1. Provides counting of shipping class matching optional search criteria.
 * 2. Provides functions to fetch shipping class by ID/name with relations.
 * 3. Supports paginated retrieval of shipping class.
 */
export {
  countProductsForShippingClass,
  findShippingClassByValue,
  findShippingClassByValueToUpdate,
  getShippingClassById,
  getShippingClassesByIds,
  paginateShippingClasses,
} from "./shipping-class/get-shipping-class.service";

/**
 * Exports service for restoring soft-deleted shipping class by ID.
 *
 * Workflow:
 * 1. Allows restoring entities by clearing their deletedAt timestamp.
 */
export { restoreShippingClass } from "./shipping-class/restore-shipping-class.service";

/**
 * Exports services for updating shipping class.
 *
 * Workflow:
 * 1. Provides functions to update basic fields (value, description).
 */
export { updateShippingClass } from "./shipping-class/update-shipping-class.service";

/**
 * Exports services for creating tax options.
 *
 * Workflow:
 * 1. Provides a function to create tax options based on input.
 */
export { createTaxOptions } from "./tax-options/create-tax-options.service";

/**
 * Exports services for deleting tax options.
 *
 * Workflow:
 * 1. Provides functions for soft deleting (skip to trash) and hard deleting entities.
 */
export { updateTaxOptions } from "./tax-options/update-tax-options.service";

/**
 * Exports services for fetching and counting tax options.
 *
 * Workflow:
 * 1. Provides functions to fetch tax options by ID with relations.
 */
export { getTaxOptions } from "./tax-options/get-tax-options.service";

/**
 * Exports services for creating tax class.
 *
 * Workflow:
 * 1. Provides a function to create a tax class based on input.
 */
export { createTaxClass } from "./tax-class/create-tax-class.service";

/**
 * Exports services for deleting tax classes.
 *
 * Workflow:
 * 1. Provides functions for soft deleting (skip to trash) and hard deleting entities.
 */
export {
  hardDeleteTaxClass,
  softDeleteTaxClass,
} from "./tax-class/delete-tax-class.service";

/**
 * Exports services for fetching and counting tax classes.
 *
 * Workflow:
 * 1. Provides counting of tax classes matching optional search criteria.
 * 2. Provides functions to fetch tax class by ID/name with relations.
 * 3. Supports paginated retrieval of tax classes.
 */
export {
  countProductsForTaxClass,
  findTaxClassByValue,
  findTaxClassByValueToUpdate,
  getTaxClassById,
  getTaxClassByIds,
  paginateTaxClasses,
} from "./tax-class/get-tax-class.service";

/**
 * Exports service for restoring soft-deleted tax class by ID.
 *
 * Workflow:
 * 1. Allows restoring entities by clearing their deletedAt timestamp.
 */
export { restoreTaxClass } from "./tax-class/restore-tax-class.service";

/**
 * Exports services for updating tax class.
 *
 * Workflow:
 * 1. Provides functions to update basic fields (value, description).
 */
export { updateTaxClass } from "./tax-class/update-tax-class.service";

/**
 * Exports services for creating product.
 *
 * Workflow:
 * 1. Provides a function to create a product based on input.
 */
export { createProduct } from "./product/create-product.service";

/**
 * Exports services for deleting products.
 *
 * Workflow:
 * 1. Provides functions for soft deleting (skip to trash) and hard deleting entities.
 */
export {
  hardDeleteProduct,
  softDeleteProduct,
} from "./product/delete-product.service";

/**
 * Exports services for fetching and counting products.
 *
 * Workflow:
 * 1. Provides counting of products matching optional search criteria.
 * 2. Provides functions to fetch product by ID/name with relations.
 * 3. Supports paginated retrieval of products.
 */
export {
  findProductBySlug,
  findProductBySlugToUpdate,
  getProductById,
  getProductsByIds,
  getProductsByIdsToDelete,
  paginateProducts,
  paginateProductsForCustomer,
} from "./product/get-product.service";

/**
 * Exports service for restoring soft-deleted products by ID.
 *
 * Workflow:
 * 1. Allows restoring entities by clearing their deletedAt timestamp.
 */
export { restoreProduct } from "./product/restore-product.service";

/**
 * Exports services for updating products.
 *
 * Workflow:
 * 1. Provides functions to update basic fields.
 */
export { updateProduct } from "./product/update-product.service";

/* Mapping Functions For Products */
export {
  mapCategoryRecursive,
  mapProductPrice,
  mapProductRecursive,
  mapProductVariationRecursive,
} from "./product/product-map-recursive.service";

/**
 * Exports services for creating tax rate.
 *
 * Workflow:
 * 1. Provides a function to create a tax rate based on input.
 * 2. Handles relation to tax class and optional location rules.
 */
export { createTaxRate } from "./tax-rate/create-tax-rate.service";

/**
 * Exports services for deleting tax rates.
 *
 * Workflow:
 * 1. Provides functions for soft deleting (skip to trash) and hard deleting entities.
 */
export {
  hardDeleteTaxRate,
  softDeleteTaxRate,
} from "./tax-rate/delete-tax-rate.service";

/**
 * Exports services for fetching and counting tax rates.
 *
 * Workflow:
 * 1. Provides counting of tax rates matching optional search criteria.
 * 2. Provides functions to fetch tax rate by ID or label with relations.
 * 3. Supports paginated retrieval of tax rates.
 */
export {
  findTaxRateByTaxClassAndPriority,
  findTaxRateByTaxClassAndPriorityToUpdateScope,
  getTaxRateById,
  getTaxRateByIds,
  getTaxRateByTaxClassAndAddress,
  paginateTaxRates,
} from "./tax-rate/get-tax-rate.service";

/**
 * Exports services for restoring soft-deleted tax rates by ID.
 *
 * Workflow:
 * 1. Allows restoring entities by clearing their deletedAt timestamp.
 */
export { restoreTaxRate } from "./tax-rate/restore-tax-rate.service";

/**
 * Exports services for updating tax rates.
 *
 * Workflow:
 * 1. Provides functions to update fields such as rate, location, and flags.
 */
export { updateTaxRate } from "./tax-rate/update-tax-rate.service";

/**
 * Exports services for creating shipping methods.
 *
 * Workflow:
 * 1. Provides a function to create a shipping method based on input.
 * 2. Handles relation to shipping class and optional location rules.
 */
export { createShippingMethod } from "./shipping-method/create-shipping-method.service";
/**
 * Exports services for deleting shipping methods.
 *
 * Workflow:
 * 1. Provides functions for soft deleting (skip to trash) and hard deleting entities.
 */
export { deleteShippingMethod } from "./shipping-method/delete-shipping-method.service";

/**
 * Exports services for fetching and counting shipping methods.
 *
 * Workflow:
 * 1. Provides counting of shipping methods matching optional search criteria.
 * 2. Provides functions to fetch shipping method by ID or name with relations.
 * 3. Supports paginated retrieval of shipping methods.
 */
export {
  getShippingMethodById,
  paginateShippingMethods,
} from "./shipping-method/get-shipping-method.service";

/**
 * Exports services for updating shipping methods.
 *
 * Workflow:
 * 1. Provides functions to update fields such as name, description, and rates.
 */
export { updateShippingMethod } from "./shipping-method/update-shipping-method.service";

/**
 * Exports services for creating shipping zones.
 *
 * Workflow:
 * 1. Provides a function to create a shipping zone based on input.
 * 2. Handles relation to shipping methods and optional location rules.
 */
export { createShippingZone } from "./shipping-zone/create-shipping-zone.service";

/**
 * Exports services for deleting shipping zones.
 *
 * Workflow:
 * 1. Provides functions for soft deleting (skip to trash) and hard deleting entities.
 */
export { updateShippingZone } from "./shipping-zone/update-shipping-zone.service";

/**
 * Exports services for deleting shipping zones.
 *
 * Workflow:
 * 1. Provides functions for soft deleting (skip to trash) and hard deleting entities.
 */
export { deleteShippingZone } from "./shipping-zone/delete-shipping-zone.service";

/**
 * Exports services for fetching and counting shipping zones.
 *
 * Workflow:
 * 1. Provides counting of shipping zones matching optional search criteria.
 * 2. Provides functions to fetch shipping zone by ID or name with relations.
 * 3. Supports paginated retrieval of shipping zones.
 */
export {
  getShippingZoneById,
  getShippingZonesByIds,
  paginateShippingZones,
} from "./shipping-zone/get-shipping-zone.service";

/**
 * Exports services for creating coupons.
 *
 * Workflow:
 * 1. Provides a function to create a coupon based on input.
 * 2. Handles relation to products and categories.
 */
export { createCoupon } from "./coupon/create-coupon.service";

/**
 * Exports services for updating coupons.
 *
 * Workflow:
 * 1. Provides functions to update basic fields (code, description, discount).
 */
export { updateCoupon } from "./coupon/update-coupon.service";

/**
 * Exports services for deleting coupons.
 *
 * Workflow:
 * 1. Provides functions for soft deleting (skip to trash) and hard deleting entities.
 */
export {
  hardDeleteCoupon,
  softDeleteCoupon,
} from "./coupon/delete-coupon.service";

/**
 * Exports services for fetching and counting coupons.
 *
 * Workflow:
 * 1. Provides counting of coupons matching optional search criteria.
 * 2. Provides functions to fetch coupon by ID or code with relations.
 * 3. Supports paginated retrieval of coupons.
 */
export {
  countCouponUsages,
  findCouponByCode,
  findCouponByCodeToUpdate,
  findCouponsByCodes,
  getCouponById,
  getCouponsByIds,
  paginateCoupons,
} from "./coupon/get-coupon.service";

/**
 * Exports service for restoring soft-deleted coupons by ID.
 *
 * Workflow:
 * 1. Allows restoring entities by clearing their deletedAt timestamp.
 */
export { addToCart } from "./cart-wishlist/add-to-cart.service";

/**
 * Exports service for restoring soft-deleted coupons by ID.
 *
 * Workflow:
 * 1. Allows restoring entities by clearing their deletedAt timestamp.
 */
export { addToWishList } from "./cart-wishlist/add-to-wishlist.service";

/**
 * Exports services for applying coupons to carts.
 *
 * Workflow:
 * 1. Provides a function to apply a coupon to a cart based on user ID and cart ID.
 * 2. Validates coupon applicability and updates cart accordingly.
 */
export { applyCoupon } from "./cart-wishlist/apply-coupon.service";

/**
 * Exports services for fetching carts and wishlists.
 *
 * Workflow:
 * 1. Provides functions to fetch cart or wishlist by ID or user ID.
 * 2. Supports fetching multiple carts or wishlists by their IDs.
 */
export {
  findCartItem,
  getCartById,
  getCartByUserId,
  getCartsByIds,
} from "./cart-wishlist/get-cart.service";

/**
 * Exports services for fetching wishlists.
 *
 * Workflow:
 * 1. Provides functions to fetch wishlist by ID or user ID.
 * 2. Supports fetching multiple wishlists by their IDs.
 */
export {
  getWishlistById,
  getWishlistByUserId,
  getWishlistsByIds,
} from "./cart-wishlist/get-wishlist.service";

/**
 * Exports services for removing items from cart and wishlist.
 *
 * Workflow:
 * 1. Provides functions to remove items from cart or wishlist by their IDs.
 * 2. Updates the cart or wishlist accordingly after removal.
 */
export { removeItemsFromCart } from "./cart-wishlist/remove-item-from-cart.service";

/**
 * Exports services for removing items from wishlist.
 *
 * Workflow:
 * 1. Provides functions to remove items from wishlist by their IDs.
 * 2. Updates the wishlist accordingly after removal.
 */
export { removeItemsFromWishlist } from "./cart-wishlist/remove-item-from-wishlist.service";
